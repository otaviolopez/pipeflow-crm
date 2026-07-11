---
name: verify
description: Receita de verificação runtime do PiperFlow CRM — build, dev server, checagem de rotas protegidas e observação visual com Playwright + Chrome do sistema
---

# Verificação runtime — PiperFlow CRM

## Build / launch

- `npm run build` — build de produção (Turbopack); valida TS e lista as rotas.
- `npm run dev` em background — sobe em http://localhost:3000 (~1s).

## Proteção de rotas (sem sessão)

```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://localhost:3000/pipeline
```

Esperado: `307 -> /login` para `/pipeline`, `/leads`, `/dashboard`, `/settings/*`, `/onboarding`; `200` para `/` e `/login`.

Gotcha (Next 16): o arquivo de proteção é `src/proxy.ts` (função exportada `proxy`). A convenção `middleware.ts` foi depreciada e, com diretório `src/`, um arquivo na raiz do repo é **ignorado em silêncio** — as rotas ficam abertas sem nenhum erro no log.

## Observação visual (Playwright)

Não há Playwright no projeto. Instalar num diretório temporário (`npm i playwright`) e usar o Chrome do sistema: `chromium.launch({ channel: "chrome", headless: true })` — não baixa browser nenhum.

Fluxos que valem dirigir: viewport 1440px (sidebar expandida, 220px) vs 1100px (colapsa para ícones + tooltip no hover — PRD 9.4); dropdowns de workspace e avatar; focus ring via Tab (PRD 9.6).

## Gotchas

- **NUNCA disparar e-mails de teste** (signup Supabase, convites Resend) — a conta do usuário quase foi suspensa por isso. Confirmação de e-mail está ativa no projeto Supabase; não há como obter sessão programática até o M8 (service role key).
- Sem sessão, o shell autenticado só é observável criando uma rota temporária fora dos caminhos protegidos que renderize `AppShell` com e-mail mock — remover antes do commit.
- Erros de runtime do base-ui (ex: `GroupLabel` fora de `Menu.Group`) não aparecem no build, só no browser — o overlay de erro do Next aparece no screenshot.
