# Plano de Execução — PiperFlow CRM

> Roteiro derivado de `CLAUDE.md` (regras técnicas) e `Docs/PRD.md`
> (especificação de produto). Ordem de construção: **setup → interface
> (com dados mockados) → backend (conecta cada tela a dados reais) → deploy**.
>
> Cada milestone tem uma branch própria, um objetivo, uma lista de entregas
> e termina com um commit. Marque os checkboxes conforme o trabalho avança.

---

## Fase 0 — Setup

### M0 — Setup do ambiente e fundação técnica

**Branch:** `chore/setup-fundacao`

**Objetivo:** preparar as ferramentas, os componentes de UI e as peças de
infraestrutura que todas as telas e integrações vão precisar, antes de
começar a construir qualquer funcionalidade.

**Entregas:**
- [x] Adicionar os componentes shadcn/ui que faltam: `form`, `checkbox`,
      `popover`, `calendar`, `sonner` (toast), `tooltip`, `command`,
      `switch`, `sidebar`, `chart`, `progress` — no estilo `base-nova` o
      `form` foi substituído pelo `field`, que já existia no scaffold
- [x] Configurar `<Toaster />` (sonner) no layout raiz — necessário para os
      toasts de sucesso/erro da Seção 9.5 do PRD
- [x] Criar `.env.example` documentando todas as variáveis necessárias
      (Supabase URL/publishable key/service role, Resend API key, Stripe
      publishable/secret/webhook secret, URL pública do site)
- [x] Criar client Supabase com service role (`src/lib/supabase/admin.ts`) —
      só usado em Server Actions/Route Handlers no servidor, nunca exposto
      ao client (regra inegociável do CLAUDE.md); protegido com o pacote
      `server-only`, que quebra o build se importado em código cliente
- [x] Criar placeholder de tipos do banco (`src/lib/supabase/database.types.ts`),
      a ser substituído pelos tipos reais no M8
- [x] Corrigir o link de navegação em `src/app/layout.tsx` de `/contatos`
      para `/leads`, alinhando com o PRD

**Commit final:** `chore: setup de ambiente, componentes shadcn e fundação técnica`

---

## Fase 1 — Interface (dados mockados, sem Supabase real ainda)

### M1 — Shell autenticado (sidebar/topbar/navegação)

**Branch:** `feature/ui-shell`

**Objetivo:** construir a casca visual que envolve todas as telas
autenticadas — sidebar de 220px com switcher de workspace e navegação fixa,
topbar de 56px — conforme Seção 9.4 do PRD. Ainda sem dados reais de
workspace.

**Entregas:**
- [x] Componente `AppSidebar`: workspace ativo (mock) + dropdown de troca,
      links Pipeline/Leads/Dashboard, submenu Configurações
      (Workspace/Equipe/Plano)
- [x] Componente `AppTopbar` (logo + avatar do usuário com dropdown)
- [x] Route group `(app)` com layout compartilhado envolvendo `/pipeline`,
      `/leads`, `/dashboard`, `/settings/*`
- [x] Sidebar colapsa para ícones em telas < 1280px, com tooltip no hover
      (Seção 9.4)
- [x] Focus ring visível em todos os itens de navegação (Seção 9.6)

**Commit final:** `feat(ui): shell autenticado com sidebar, topbar e navegação`

### M2 — Dark mode e preferência de tema

**Branch:** `feature/ui-dark-mode`

**Objetivo:** dar suporte a modo claro/escuro em toda a aplicação — Seção
6.8 do PRD. Detectar a preferência do sistema operacional e, logo após o
login, perguntar ao usuário se ele quer manter o modo claro, mudar para
escuro, ou seguir a configuração do sistema. Entra logo após o shell (M1)
porque tema é uma decisão que afeta a aparência de todas as telas seguintes
— melhor ter isso resolvido antes de construir o resto da interface.

**Entregas:**
- [x] Configurar um provider de tema (ex: `next-themes`) na raiz do app,
      reaproveitando os tokens claro/escuro que já existem em
      `src/app/globals.css` (`.dark` + variáveis OKLCH) — falta só o
      mecanismo de alternância, os tokens já foram definidos no scaffold
- [x] Detecção da preferência do sistema operacional via
      `window.matchMedia("(prefers-color-scheme: dark)")`
- [x] Modal/dialog de preferência de tema, exibido uma única vez logo após
      o primeiro login, com 3 opções: "Manter modo claro" (padrão atual),
      "Usar modo escuro", "Seguir o sistema"
- [x] Persistir a escolha do usuário (cookie ou `localStorage` — sem
      necessidade de tabela nova no banco para o MVP) para não perguntar de
      novo a cada login
- [x] Toggle manual de tema sempre acessível depois (ex: no dropdown do
      avatar na `AppTopbar` do M1), para o usuário mudar de ideia
- [x] Conferir contraste mínimo 4.5:1 e foco visível em ambos os temas
      (Seção 9.6)

**Commit final:** `feat(ui): dark mode com detecção de preferência do sistema`

### M3 — Autenticação, onboarding e convite (telas)

**Branch:** `feature/ui-auth-onboarding`

**Objetivo:** separar login/signup em rotas próprias, construir o wizard de
onboarding e a página pública de aceite de convite — Seção 9.1 e Fluxos 1 e
3 do PRD.

**Entregas:**
- [x] `/login`: só o formulário de entrada
- [x] `/signup`: só o formulário de cadastro
- [x] Mensagem de erro genérica "E-mail ou senha incorretos" (Seção 9.5) —
      nunca revelar qual campo está errado
- [x] `/onboarding`: wizard passo 1 (nome do workspace) + passo 2 opcional
      (convidar colaboradores, pode pular) — sem sidebar ainda
- [x] `/invite/[token]`: tela de aceite de convite (criar conta ou logar,
      mockado)

**Commit final:** `feat(ui): telas de login, signup, onboarding e aceite de convite`

### M4 — Pipeline Kanban (visual)

**Branch:** `feature/ui-pipeline`

**Objetivo:** construir a tela âncora do produto — Seção 6.2 e 9.3 — com as
6 etapas fixas, drag-and-drop e os 4 estados de tela, usando dados mockados
em memória.

**Entregas:**
- [x] 6 colunas fixas (Novo Lead → Contato Realizado → Proposta Enviada →
      Negociação → Fechado Ganho → Fechado Perdido)
- [x] `DealCard`: título, badge de valor (R$), avatar do responsável, prazo
      (vermelho + ícone ⚠️ se vencido)
- [x] Drag-and-drop entre colunas com @dnd-kit (estado mockado local)
- [x] Alternativa acessível por teclado/menu "Mover para..." (Seção 9.6 —
      requisito mínimo de acessibilidade para o @dnd-kit)
- [x] Modal de confirmação ao mover para "Fechado Perdido", com campo
      opcional de motivo (Seção 9.5)
- [x] Estado vazio, skeleton de carregamento (2-3 cards/coluna) e toast de
      erro de rollback

**Commit final:** `feat(ui): pipeline kanban visual com dnd-kit e estados de tela`

### M5 — Leads: listagem, cadastro, detalhe, timeline (visual)

**Branch:** `feature/ui-leads`

**Objetivo:** telas de gestão de leads e a página de detalhe com timeline de
atividades — Seção 6.1, 6.3 e 9.3 — cobrindo os 4 estados em cada tela, com
dados mockados.

**Entregas:**
- [ ] `/leads`: tabela (nome/empresa/status/responsável/última atividade) +
      busca full-text + filtros (status/responsável/data) + paginação
      (20/página)
- [ ] Estado vazio, skeleton (8 linhas), "busca sem resultado" e banner de
      limite do plano Free (50 leads)
- [ ] `/leads/new`: formulário com apenas nome obrigatório (react-hook-form
      + zod + shadcn `form`)
- [ ] `/leads/[id]`: cabeçalho (nome/empresa/cargo/status editável inline) +
      timeline cronológica + negócios vinculados
- [ ] Botão "Registrar atividade" sempre visível, abrindo drawer lateral
      (`Sheet`) com os 4 tipos (Ligação/E-mail/Reunião/Nota)
- [ ] Estado de erro 404 (lead não encontrado ou fora do workspace ativo)

**Commit final:** `feat(ui): telas de leads, cadastro, detalhe e timeline de atividades`

### M6 — Dashboard e Landing Page (visual)

**Branch:** `feature/ui-dashboard-landing`

**Objetivo:** tela de métricas (Seção 6.4) e a landing page pública (Seção
6.7), ambas com dados mockados/estáticos.

**Entregas:**
- [ ] `/dashboard`: 4 KPI cards (Total de leads, Negócios abertos, Valor
      total do pipeline, Taxa de conversão) com número em destaque 2-3x
      maior que o label
- [ ] Gráfico de funil de vendas por etapa (Recharts + shadcn `chart`)
- [ ] Lista "Meus negócios com prazo próximo" (7 dias)
- [ ] `/` landing page pública: Hero, Funcionalidades, Planos e Preços, CTA
      de cadastro

**Commit final:** `feat(ui): dashboard de métricas e landing page pública`

### M7 — Configurações: workspace/equipe/billing/perfil (visual)

**Branch:** `feature/ui-settings`

**Objetivo:** as 4 telas de `/settings/*` da Seção 9.1, com os estados e a
microcopy exatos das Seções 9.3/9.5, ainda mockadas.

**Entregas:**
- [ ] `/settings/workspace`: nome do workspace, dados gerais (Admin)
- [ ] `/settings/team`: lista de membros + convites pendentes + modal
      "Convidar membro" com todos os estados de erro (Seção 9.3)
- [ ] `/settings/billing`: plano atual, uso (colaboradores/leads), CTA de
      upgrade, acesso ao Customer Portal
- [ ] `/settings/profile`: dados do usuário logado + toggle manual de tema
      (Seção 6.8)
- [ ] Modais de confirmação destrutiva (remover membro, cancelar
      assinatura) com a microcopy exata da Seção 9.5

**Commit final:** `feat(ui): telas de configurações de workspace, equipe, plano e perfil`

---

## Fase 2 — Backend (conecta cada tela já construída a dados reais)

### M8 — Banco de dados e RLS (aplicar schema real)

**Branch:** `feature/backend-database`

**Objetivo:** sair do mock e ligar o projeto ao Supabase de verdade —
aplicar o schema multi-workspace já desenhado (`supabase/schema.sql`) e
confirmar que a segurança funciona antes de conectar qualquer tela.

**Entregas:**
- [ ] Rodar `supabase/schema.sql` no SQL Editor do projeto Supabase (já
      configurado em `.env.local`)
- [ ] Gerar tipos reais (`supabase gen types typescript`) e substituir
      `database.types.ts`
- [ ] Adicionar `SUPABASE_SERVICE_ROLE_KEY` ao `.env.local` (nunca
      commitado, nunca em `NEXT_PUBLIC_*`)
- [ ] Testar RLS manualmente: criar 2 workspaces com 2 usuários diferentes
      e confirmar isolamento total de dados entre eles

**Commit final:** `feat(backend): aplica schema multi-workspace real e valida RLS`

### M9 — Auth + Workspaces + Onboarding (conectado)

**Branch:** `feature/backend-auth-workspaces`

**Objetivo:** conectar as telas do M3 e o shell do M1 a dados reais de
sessão e workspace.

**Entregas:**
- [ ] Server Action `createWorkspace` (o trigger do M8 já cria o criador
      como admin automaticamente)
- [ ] Query/Server Action para listar os workspaces do usuário e trocar o
      ativo, alimentando o switcher do M1
- [ ] Conectar `/onboarding` para criar o workspace de verdade e
      redirecionar para `/pipeline`
- [ ] Conectar `/invite/[token]` à função `accept_invite` (M8)

**Commit final:** `feat(backend): auth, workspaces e onboarding conectados ao Supabase`

### M10 — Leads + Activities (conectado)

**Branch:** `feature/backend-leads`

**Objetivo:** trocar os dados mockados das telas do M5 por Server Actions
reais.

**Entregas:**
- [ ] Server Actions: criar/listar/atualizar lead (com busca e filtros
      reais via `workspace_id`)
- [ ] Server Actions: registrar atividade + buscar timeline de um lead
- [ ] Validação server-side do limite de 50 leads no plano Free — nunca só
      no frontend (regra do CLAUDE.md)

**Commit final:** `feat(backend): CRUD de leads e timeline de atividades conectados`

### M11 — Pipeline/Deals (conectado)

**Branch:** `feature/backend-pipeline`

**Objetivo:** conectar o Kanban do M4 a dados reais, com persistência
otimista de verdade.

**Entregas:**
- [ ] Server Action criar negócio
- [ ] Endpoint dedicado `PATCH /api/deals/:id/stage` para o drag-and-drop
      (Seção 12 do PRD)
- [ ] Optimistic update com rollback real em caso de erro de rede (Seção
      6.2)
- [ ] Confirmação obrigatória (com motivo opcional) ao mover para "Fechado
      Perdido", gravando `lost_reason`

**Commit final:** `feat(backend): pipeline conectado ao Supabase com stage otimista`

### M12 — Equipe e Convites via Resend (conectado)

**Branch:** `feature/backend-team-invites`

**Objetivo:** conectar `/settings/team` a convites reais por e-mail.

**Entregas:**
- [ ] Server Action criar convite (gera token, grava em `invites`, dispara
      e-mail via Resend)
- [ ] Envio de e-mail transacional de convite (Resend)
- [ ] Server Action remover membro (Admin)
- [ ] Validação server-side do limite de 2 colaboradores no plano Free

**Commit final:** `feat(backend): convites por e-mail e gestão de equipe conectados`

### M13 — Stripe Billing: Checkout + Portal + Webhook

**Branch:** `feature/backend-billing`

**Objetivo:** conectar `/settings/billing` ao Stripe de verdade — Seção 6.6
e 12 do PRD.

**Entregas:**
- [ ] `POST /api/stripe/checkout` (cria sessão de Stripe Checkout)
- [ ] `POST /api/stripe/portal` (cria sessão de Customer Portal)
- [ ] `POST /api/stripe/webhook` com verificação de assinatura
      (`stripe.webhooks.constructEvent`) — regra inegociável do CLAUDE.md
- [ ] Idempotência do webhook: guardar `event.id` processados antes de
      aplicar qualquer efeito colateral (CLAUDE.md)
- [ ] Atualização automática do plano do workspace nos eventos
      `checkout.session.completed`, `customer.subscription.updated` e
      `customer.subscription.deleted`
- [ ] `STRIPE_WEBHOOK_SECRET` adicionado ao `.env.local`

**Commit final:** `feat(backend): assinatura Stripe com checkout, portal e webhook`

### M14 — Dashboard com dados reais

**Branch:** `feature/backend-dashboard`

**Objetivo:** trocar os números mockados do M6 pelas queries agregadas
reais do workspace ativo.

**Entregas:**
- [ ] Queries agregadas: total de leads, negócios abertos, valor total do
      pipeline, taxa de conversão
- [ ] Dados reais do funil de vendas por etapa
- [ ] Lista real de "negócios com prazo próximo" filtrada pelo usuário
      logado

**Commit final:** `feat(backend): dashboard com métricas reais do workspace`

---

## Fase 3 — Deploy

### M15 — Deploy de produção (Vercel + Supabase + Stripe)

**Branch:** `chore/deploy-producao`

**Objetivo:** publicar o PiperFlow em produção, com todas as integrações
externas configuradas para o ambiente real — Seção 8 do PRD.

**Entregas:**
- [ ] Configurar todas as variáveis de ambiente de produção na Vercel
- [ ] Deploy de produção
- [ ] Configurar o endpoint de webhook do Stripe apontando para a URL de
      produção
- [ ] `NEXT_PUBLIC_SITE_URL` apontando para o domínio de produção
- [ ] Smoke test end-to-end em produção: signup → onboarding → criar lead
      → criar negócio → mover no pipeline → registrar atividade → convidar
      membro → upgrade Stripe

**Commit final:** `chore: deploy de produção na Vercel`
