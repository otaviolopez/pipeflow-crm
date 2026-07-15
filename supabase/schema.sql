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

-- M13: guarda o id de cada evento do webhook do Stripe já processado, pra
-- garantir idempotência (CLAUDE.md — nunca aplicar o mesmo evento duas
-- vezes). Só o webhook (service role) toca essa tabela; por isso RLS
-- habilitada sem nenhuma policy — nem authenticated nem anon conseguem ler
-- ou escrever aqui, de propósito.
create table if not exists public.stripe_webhook_events (
  id text primary key, -- event.id do Stripe (ex.: "evt_...")
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

-- M12: /settings/team precisa mostrar o e-mail de cada colaborador. Sem essa
-- coluna, a única fonte de e-mail seria auth.users — schema protegido que a
-- aplicação não deve consultar direto (mesmo motivo do nome em profiles).
-- "add column if not exists" cobre o banco já existente (profiles criado no
-- M10, antes desta coluna existir); o "create table" acima já cobre instalações novas.
alter table public.profiles add column if not exists email text;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  role_title text,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'waiting', 'qualified', 'disqualified')
  ),
  owner_id uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Migração do enum de status de leads (active/inactive -> novo enum de 5
-- valores, ver PRD Seção 6.1). Remapeamento: 'active' vira 'new' (estado
-- inicial mais próximo — não há como saber quanto progresso o lead já teve
-- só pelo binário antigo); 'inactive' vira 'disqualified' (fim do funil, mais
-- próximo do significado original de "não seguir com este contato"). Cobre
-- bancos já existentes (leads criado no M8/M10); o "create table" acima já
-- cobre instalações novas.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'leads_status_check'
      and pg_get_constraintdef(oid) like '%active%inactive%'
  ) then
    -- Constraint trocada ANTES dos updates: o Postgres valida o check em
    -- cada statement (não só no fim da transação), então gravar 'new'/
    -- 'disqualified' com a constraint antiga ainda ativa (só aceita
    -- active/inactive) quebra o update com "violates check constraint".
    alter table public.leads drop constraint leads_status_check;
    alter table public.leads add constraint leads_status_check check (
      status in ('active', 'inactive', 'new', 'contacted', 'waiting', 'qualified', 'disqualified')
    );

    update public.leads set status = 'new' where status = 'active';
    update public.leads set status = 'disqualified' where status = 'inactive';

    alter table public.leads alter column status set default 'new';
    alter table public.leads drop constraint leads_status_check;
    alter table public.leads add constraint leads_status_check check (
      status in ('new', 'contacted', 'waiting', 'qualified', 'disqualified')
    );
  end if;
end $$;

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

-- Não é FK (aponta para o Stripe, não para outra tabela do banco), mas é
-- usada em WHERE no webhook (src/app/api/stripe/webhook/route.ts) como
-- fallback quando o evento não traz metadata.workspace_id — sem índice,
-- vira sequential scan na tabela inteira a cada evento do Stripe. Parcial
-- (where ... is not null) porque todo workspace no Free tem essa coluna
-- nula — só workspaces Pro (minoria) entram no índice.
create index if not exists workspaces_stripe_subscription_id_idx
  on public.workspaces (stripe_subscription_id)
  where stripe_subscription_id is not null;

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

-- Toda vez que um usuário se cadastra no Supabase Auth, cria automaticamente
-- a linha correspondente em public.profiles — é dali que leads/deals/
-- activities resolvem o nome de exibição de owner_id/author_id, já que
-- auth.users fica num schema protegido e não deve ser consultado direto pela
-- aplicação (ver memória do projeto sobre a descoberta pré-M10).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- raw_user_meta_data.name vem de options.data no supabase.auth.signUp()
  -- (src/app/signup/actions.ts) — nome digitado no cadastro. Fallback pra
  -- parte do e-mail antes do @ cobre fluxos que não passam nome (ex.:
  -- accept_invite, que só cria o profile via signUp de convite) — nullif
  -- trata string vazia como ausente também, já que coalesce sozinho só
  -- ativa o fallback para NULL, não para "".
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: usuários criados antes deste trigger existir (ex.: contas de
-- teste do M8/M9) ainda não têm profile — roda uma vez e é seguro repetir
-- (on conflict do nothing) se este arquivo for executado de novo.
insert into public.profiles (id, name, email)
select id, split_part(email, '@', 1), email
from auth.users
on conflict (id) do nothing;

-- Backfill do e-mail para profiles criados antes da coluna existir (M10).
update public.profiles
set email = u.email
from auth.users u
where profiles.id = u.id
  and profiles.email is null;

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
  _workspace_plan text;
  _member_count integer;
  _current_user_email text;
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

  -- Auditoria de segurança (aula 5.1): sem esta checagem, qualquer usuário
  -- autenticado com QUALQUER e-mail podia aceitar um convite que vazasse
  -- (print, link encaminhado por engano), virando membro — ou admin — de um
  -- workspace ao qual nunca deveria ter acesso. O convite pertence ao
  -- e-mail para o qual foi endereçado, não a quem quer que tenha o token.
  select email into _current_user_email
  from auth.users
  where id = auth.uid();

  if lower(_current_user_email) <> lower(_invite.email) then
    raise exception 'Este convite foi enviado para outro e-mail.';
  end if;

  -- Re-checa o limite de 2 colaboradores do Free aqui também (não só na
  -- criação do convite, em createInvite): o convite pode ficar pendente por
  -- dias, e o workspace pode ter ganhado outro membro nesse meio tempo —
  -- confiar só na checagem de quando o convite foi criado deixaria passar
  -- workspaces com mais membros do que o plano permite (CLAUDE.md: limite de
  -- plano sempre revalidado no servidor). Manter "2" em sincronia com
  -- FREE_PLAN_MEMBER_LIMIT em src/lib/settings/types.ts.
  select plan into _workspace_plan
  from public.workspaces
  where id = _invite.workspace_id;

  select count(*) into _member_count
  from public.workspace_members
  where workspace_id = _invite.workspace_id;

  if _workspace_plan = 'free' and _member_count >= 2 then
    raise exception 'Este workspace já atingiu o limite de 2 colaboradores do plano Free.';
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
alter table public.profiles enable row level security;

-- Cada "create policy" é precedido de "drop policy if exists" — sem isso,
-- rodar este arquivo de novo (prática do projeto a cada milestone que mexe
-- no schema) falha com "policy already exists" no primeiro create policy,
-- como aconteceu ao tentar aplicar as mudanças do M10 por cima do M8/M9.

-- workspaces
drop policy if exists "workspaces: select as member" on public.workspaces;
create policy "workspaces: select as member" on public.workspaces
  for select to authenticated
  using ( (select public.is_workspace_member(id)) );

drop policy if exists "workspaces: insert self" on public.workspaces;
create policy "workspaces: insert self" on public.workspaces
  for insert to authenticated
  with check ( true );

drop policy if exists "workspaces: update as admin" on public.workspaces;
create policy "workspaces: update as admin" on public.workspaces
  for update to authenticated
  using ( (select public.is_workspace_admin(id)) )
  with check ( (select public.is_workspace_admin(id)) );

-- workspace_members
drop policy if exists "workspace_members: select as member" on public.workspace_members;
create policy "workspace_members: select as member" on public.workspace_members
  for select to authenticated
  using ( (select public.is_workspace_member(workspace_id)) );

drop policy if exists "workspace_members: insert as admin" on public.workspace_members;
create policy "workspace_members: insert as admin" on public.workspace_members
  for insert to authenticated
  with check ( (select public.is_workspace_admin(workspace_id)) );

drop policy if exists "workspace_members: update as admin" on public.workspace_members;
create policy "workspace_members: update as admin" on public.workspace_members
  for update to authenticated
  using ( (select public.is_workspace_admin(workspace_id)) )
  with check ( (select public.is_workspace_admin(workspace_id)) );

drop policy if exists "workspace_members: delete as admin" on public.workspace_members;
create policy "workspace_members: delete as admin" on public.workspace_members
  for delete to authenticated
  using ( (select public.is_workspace_admin(workspace_id)) );

-- invites (tela /settings/team é Admin-only — ver Seção 9.1 do PRD)
drop policy if exists "invites: select as admin" on public.invites;
create policy "invites: select as admin" on public.invites
  for select to authenticated
  using ( (select public.is_workspace_admin(workspace_id)) );

drop policy if exists "invites: insert as admin" on public.invites;
create policy "invites: insert as admin" on public.invites
  for insert to authenticated
  with check ( (select public.is_workspace_admin(workspace_id)) );

-- leads (qualquer membro do workspace tem CRUD, sem distinção de papel)
drop policy if exists "leads: select as member" on public.leads;
create policy "leads: select as member" on public.leads
  for select to authenticated
  using ( (select public.is_workspace_member(workspace_id)) );

drop policy if exists "leads: insert as member" on public.leads;
create policy "leads: insert as member" on public.leads
  for insert to authenticated
  with check ( (select public.is_workspace_member(workspace_id)) );

drop policy if exists "leads: update as member" on public.leads;
create policy "leads: update as member" on public.leads
  for update to authenticated
  using ( (select public.is_workspace_member(workspace_id)) )
  with check ( (select public.is_workspace_member(workspace_id)) );

-- deals
drop policy if exists "deals: select as member" on public.deals;
create policy "deals: select as member" on public.deals
  for select to authenticated
  using ( (select public.is_workspace_member(workspace_id)) );

drop policy if exists "deals: insert as member" on public.deals;
create policy "deals: insert as member" on public.deals
  for insert to authenticated
  with check ( (select public.is_workspace_member(workspace_id)) );

drop policy if exists "deals: update as member" on public.deals;
create policy "deals: update as member" on public.deals
  for update to authenticated
  using ( (select public.is_workspace_member(workspace_id)) )
  with check ( (select public.is_workspace_member(workspace_id)) );

-- activities (timeline: apenas criação e leitura no MVP, sem edição/remoção)
drop policy if exists "activities: select as member" on public.activities;
create policy "activities: select as member" on public.activities
  for select to authenticated
  using ( (select public.is_workspace_member(workspace_id)) );

drop policy if exists "activities: insert as member" on public.activities;
create policy "activities: insert as member" on public.activities
  for insert to authenticated
  with check ( (select public.is_workspace_member(workspace_id)) );

-- profiles (não é dado de negócio de um workspace específico — é a "lista
-- telefônica" de nomes; visível apenas entre pessoas que compartilham pelo
-- menos um workspace, nunca para usuários sem nenhum vínculo em comum)
drop policy if exists "profiles: select as workspace-mate" on public.profiles;
create policy "profiles: select as workspace-mate" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.workspace_members mine
      join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
      where mine.user_id = (select auth.uid())
        and theirs.user_id = public.profiles.id
    )
  );

-- Cada usuário só edita o próprio nome de exibição — nunca o de outro membro
-- (mesmo sendo admin do workspace: perfil não é dado de negócio do workspace).
drop policy if exists "profiles: update self" on public.profiles;
create policy "profiles: update self" on public.profiles
  for update to authenticated
  using ( id = (select auth.uid()) )
  with check ( id = (select auth.uid()) );
