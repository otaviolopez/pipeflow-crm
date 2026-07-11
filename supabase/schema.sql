-- Piperflow CRM — schema inicial
-- Rodar este arquivo inteiro no SQL Editor do Supabase (dashboard do projeto).
--
-- Este schema segue o modelo de dados multi-workspace da Seção 11 do PRD
-- (Docs/PRD.md). Ele substitui um modelo anterior single-user (tabelas
-- "companies"/"contacts" com isolamento por user_id). Se você já rodou o
-- schema antigo neste projeto Supabase, remova as tabelas antigas antes:
--
--   drop table if exists public.deals cascade;
--   drop table if exists public.contacts cascade;
--   drop table if exists public.companies cascade;

-- ============================================================================
-- TABELAS
-- ============================================================================

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  token text not null unique,
  invited_by uuid not null references auth.users (id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  role_title text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  owner_id uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  title text not null,
  value numeric(12, 2) not null default 0,
  stage text not null default 'new_lead' check (
    stage in ('new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost')
  ),
  lost_reason text,
  owner_id uuid references auth.users (id),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  type text not null check (type in ('call', 'email', 'meeting', 'note')),
  description text not null,
  author_id uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================
-- Postgres não indexa colunas de foreign key automaticamente — cada
-- workspace_id (e demais FKs usadas em JOINs ou políticas de RLS) precisa de
-- índice explícito.

create index if not exists workspace_members_workspace_id_idx on public.workspace_members (workspace_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members (user_id);

create index if not exists invites_workspace_id_idx on public.invites (workspace_id);

create index if not exists leads_workspace_id_idx on public.leads (workspace_id);

create index if not exists deals_workspace_id_idx on public.deals (workspace_id);
create index if not exists deals_workspace_id_stage_idx on public.deals (workspace_id, stage);
create index if not exists deals_lead_id_idx on public.deals (lead_id);

create index if not exists activities_workspace_id_idx on public.activities (workspace_id);
create index if not exists activities_workspace_id_lead_id_created_at_idx
  on public.activities (workspace_id, lead_id, created_at desc);

-- ============================================================================
-- FUNÇÕES AUXILIARES (security definer)
-- ============================================================================
-- Evitam que cada política de RLS precise reavaliar a tabela workspace_members
-- linha a linha, e concentram a lógica de "sou membro?" / "sou admin?" num
-- único lugar. search_path vazio + nomes totalmente qualificados (public.…)
-- é a prática recomendada para evitar sequestro de search_path.

create or replace function public.is_workspace_member(_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = _workspace_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_workspace_admin(_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = _workspace_id
      and user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

-- Quando um workspace é criado, quem criou vira automaticamente admin dele.
create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, auth.uid(), 'admin');
  return new;
end;
$$;

drop trigger if exists on_workspace_created on public.workspaces;
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- Aceitar convite (POST /api/invites/:token/accept da Seção 12 do PRD):
-- valida o token, cria a associação em workspace_members e marca o convite
-- como aceito — tudo em uma única operação atômica.
create or replace function public.accept_invite(_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  _invite public.invites;
begin
  select *
  into _invite
  from public.invites
  where token = _token
    and accepted_at is null
    and expires_at > now();

  if not found then
    raise exception 'Convite inválido ou expirado.';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (_invite.workspace_id, auth.uid(), _invite.role)
  on conflict (workspace_id, user_id) do nothing;

  update public.invites
  set accepted_at = now()
  where id = _invite.id;

  return _invite.workspace_id;
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Regra do CLAUDE.md: nenhuma tabela de dado de negócio sem RLS. Isolamento
-- é por workspace (não por usuário) — qualquer membro do workspace, seja
-- "admin" ou "member", pode ler/criar/editar leads, deals e activities;
-- apenas "admin" gerencia membros, convites e dados do workspace (billing).

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.invites enable row level security;
alter table public.leads enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;

-- workspaces
create policy "workspaces: select as member" on public.workspaces
  for select to authenticated
  using ( (select public.is_workspace_member(id)) );

create policy "workspaces: insert self" on public.workspaces
  for insert to authenticated
  with check ( true );

create policy "workspaces: update as admin" on public.workspaces
  for update to authenticated
  using ( (select public.is_workspace_admin(id)) )
  with check ( (select public.is_workspace_admin(id)) );

-- workspace_members
create policy "workspace_members: select as member" on public.workspace_members
  for select to authenticated
  using ( (select public.is_workspace_member(workspace_id)) );

create policy "workspace_members: insert as admin" on public.workspace_members
  for insert to authenticated
  with check ( (select public.is_workspace_admin(workspace_id)) );

create policy "workspace_members: update as admin" on public.workspace_members
  for update to authenticated
  using ( (select public.is_workspace_admin(workspace_id)) )
  with check ( (select public.is_workspace_admin(workspace_id)) );

create policy "workspace_members: delete as admin" on public.workspace_members
  for delete to authenticated
  using ( (select public.is_workspace_admin(workspace_id)) );

-- invites (tela /settings/team é Admin-only — ver Seção 9.1 do PRD)
create policy "invites: select as admin" on public.invites
  for select to authenticated
  using ( (select public.is_workspace_admin(workspace_id)) );

create policy "invites: insert as admin" on public.invites
  for insert to authenticated
  with check ( (select public.is_workspace_admin(workspace_id)) );

-- leads (qualquer membro do workspace tem CRUD, sem distinção de papel)
create policy "leads: select as member" on public.leads
  for select to authenticated
  using ( (select public.is_workspace_member(workspace_id)) );

create policy "leads: insert as member" on public.leads
  for insert to authenticated
  with check ( (select public.is_workspace_member(workspace_id)) );

create policy "leads: update as member" on public.leads
  for update to authenticated
  using ( (select public.is_workspace_member(workspace_id)) )
  with check ( (select public.is_workspace_member(workspace_id)) );

-- deals
create policy "deals: select as member" on public.deals
  for select to authenticated
  using ( (select public.is_workspace_member(workspace_id)) );

create policy "deals: insert as member" on public.deals
  for insert to authenticated
  with check ( (select public.is_workspace_member(workspace_id)) );

create policy "deals: update as member" on public.deals
  for update to authenticated
  using ( (select public.is_workspace_member(workspace_id)) )
  with check ( (select public.is_workspace_member(workspace_id)) );

-- activities (timeline: apenas criação e leitura no MVP, sem edição/remoção)
create policy "activities: select as member" on public.activities
  for select to authenticated
  using ( (select public.is_workspace_member(workspace_id)) );

create policy "activities: insert as member" on public.activities
  for insert to authenticated
  with check ( (select public.is_workspace_member(workspace_id)) );
