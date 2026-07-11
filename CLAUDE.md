# CLAUDE.md — PiperFlow CRM

Contexto para o Claude Code / Cursor trabalhando neste repositório. Consulte
`Docs/PRD.md` para especificação completa de produto. Este arquivo contém apenas
regras de execução técnica — não repita decisões de produto aqui.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript 5 — versão com breaking changes
  em relação a releases anteriores; consulte `node_modules/next/dist/docs/` e
  o `AGENTS.md` antes de usar padrões de Next.js "clássicos"
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Row Level Security + Supabase Auth)
- Stripe (Checkout + Customer Portal + Webhooks)
- Resend (e-mail transacional)
- @dnd-kit (drag-and-drop do pipeline)
- Recharts (gráfico de funil no dashboard)
- Deploy: Vercel (app) + Supabase (banco/auth)

## Regras — NUNCA violar

🚫 Nunca desabilitar Row Level Security em nenhuma tabela do Supabase — nem
   temporariamente para testar localmente. Toda tabela de dado de negócio
   (`leads`, `deals`, `activities`, `invites`, `workspace_members`) precisa de
   política RLS antes do primeiro commit que a introduz.

🚫 Nunca criar query no banco sem filtrar por `workspace_id`. Todo dado de
   negócio pertence a um workspace — mesmo em rotas de admin/debug.

🚫 Nunca expor a Supabase service role key no código cliente, em componentes
   React, em variáveis `NEXT_PUBLIC_*` ou em commits. Ela só existe em Server
   Actions / API Routes que rodam no servidor.

🚫 Nunca usar `any` no TypeScript. Tipar contra os tipos gerados do Supabase
   (`supabase gen types typescript`) em `types/database.ts`.

🚫 Nunca processar o webhook do Stripe sem verificar a assinatura com
   `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`.

🚫 Nunca processar o mesmo evento de webhook do Stripe duas vezes — implementar
   idempotência guardando `event.id` processados (tabela dedicada ou coluna de
   controle) antes de aplicar efeitos colaterais (mudar plano, etc).

🚫 Nunca fazer redirect de rota protegida no lado do cliente. Proteção de rotas
   autenticadas (`/pipeline`, `/leads`, `/dashboard`, `/settings/*`) é feita via
   `middleware.ts` do Next.js, checando sessão do Supabase Auth.

🚫 Nunca implementar apenas o caminho feliz. Toda tela que busca dados externos
   (Supabase) precisa dos 4 estados: vazio, carregando, com dados e erro — ver
   Seção 9.3 do PRD para o comportamento exato de cada tela.

🚫 Nunca remover o indicador visual de foco (`outline`) de elementos interativos
   sem substituir por alternativa igualmente visível (`box-shadow` ou borda).

🚫 Nunca usar cor como único indicador de estado (ex: prazo vencido, erro de
   formulário) — sempre combinar cor + ícone + texto descritivo.

🚫 Nunca implementar o drag-and-drop do pipeline sem uma alternativa acessível
   por teclado/menu ("Mover para...") para o card de negócio.

🚫 Nunca aplicar limite de plano (2 colaboradores / 50 leads no Free) apenas no
   frontend. A validação de limite é sempre re-checada no servidor antes de
   criar o registro, independente do que a UI mostrar.

## Convenções de estrutura

- Server Components por padrão; `"use client"` apenas em componentes com estado
  interativo (formulários, drag-and-drop do Kanban, dropdowns)
- Mutações via Server Actions quando possível; API Routes reservadas para
  webhooks do Stripe e endpoints que precisam de verbo HTTP explícito
- Nomenclatura de tabelas e colunas em `snake_case` (padrão Postgres/Supabase);
  nomenclatura de variáveis e componentes TypeScript em `camelCase`/`PascalCase`
- Stage do deal no banco usa os valores em inglês definidos na Seção 11 do PRD
  (`new_lead`, `contacted`, `proposal_sent`, `negotiation`, `won`, `lost`) —
  a tradução para português acontece apenas na camada de apresentação

## O que não construir sem checar o PRD primeiro

Antes de implementar qualquer feature não listada explicitamente na Seção 6 do
`Docs/PRD.md`, verifique a Seção 4 (Non-Goals). Itens como automações de pipeline,
importação em massa, notificações in-app, i18n e customização de etapas estão
explicitamente fora do escopo do MVP.
