# PRD — PiperFlow CRM

> Versão 1.0 — 2026-07-10
> Documento otimizado para uso com Claude Code / Cursor. Todo item marcado como
> Non-Goal está explicitamente fora do escopo do MVP e não deve ser implementado
> sem aprovação.

---

## 1. Visão Geral

**Nome do projeto:** PiperFlow CRM

**O que é:** Plataforma SaaS de gestão de clientes e vendas (CRM), multi-empresa
(multi-workspace), com pipeline visual Kanban, gestão de leads e negócios, registro
de interações e monetização via assinatura recorrente (Stripe).

**Categoria de referência:** CRM / Vendas

---

## 2. Problema

**Quem sente a dor:** pequenos empresários, times de vendas de PME e freelancers/
consultores que atendem múltiplos clientes, hoje organizando vendas em planilhas,
WhatsApp e memória — ou pagando por um CRM que não foi desenhado para o tamanho
do seu time.

**Por que as alternativas atuais não bastam:**
- **HubSpot CRM** tem um plano gratuito robusto, mas o produto inteiro é construído
  em torno de um ecossistema (Marketing Hub, Service Hub, Operations Hub) que PMEs
  focadas apenas em vendas não usam — e os recursos realmente úteis (automações,
  relatórios customizados, campos avançados) ficam bloqueados atrás de planos caros.
  Reclamação recorrente do mercado: complexidade crescente e "menus que nunca vou usar".
- **Pipedrive** tem a melhor experiência de pipeline Kanban do mercado, mas não tem
  plano gratuito genuíno (apenas trial de 14 dias) — um freelancer ou empresário
  testando o processo de vendas pela primeira vez não consegue validar o produto
  sem cartão de crédito.
- Pesquisas de mercado sobre adoção de CRM em pequenas empresas apontam como
  queixas mais comuns: custo e complexidade percebidos como desproporcionais ao
  tamanho do time, dados de contato desatualizados/duplicados por falta de padrão
  de cadastro, integrações que não se conectam entre si, e relatórios com pouca
  visibilidade em tempo real. Esses pontos moldam diretamente os Non-Goals e as
  decisões de UX deste PRD.

**Hipótese de produto (não testada com usuários reais até o momento):** um CRM
genuinamente freemium, focado exclusivamente em vendas (sem os módulos de marketing/
service que encarecem HubSpot), com um pipeline Kanban tão bom quanto o do Pipedrive,
vai converter melhor pequenos negócios e freelancers que hoje não usam CRM nenhum.
Esta hipótese deve ser validada com o comportamento real dos primeiros usuários —
ver Seção 5 (Métricas) e Seção 15 (Milestones).

---

## 3. Solução e Diferencial

**O que será construído:** um CRM completo com cadastro de leads/contatos, pipeline
Kanban de vendas com drag-and-drop, página de detalhe do lead com timeline de
atividades, sistema multi-empresa (workspaces) com convite de colaboradores,
dashboard de métricas de vendas e monetização via Stripe.

**Diferencial competitivo:**
1. **Freemium genuíno** (diferente do Pipedrive) — plano Free funcional o suficiente
   para um pequeno negócio operar de verdade, não apenas um trial disfarçado.
2. **Foco exclusivo em vendas** (diferente do HubSpot) — sem módulos de marketing,
   service ou operations. Toda feature que não for "gerenciar o funil de vendas" é
   candidata a Non-Goal (ver Seção 4).
3. **Pipeline como tela âncora** — inspirado no Pipedrive, o Kanban é a tela mais
   usada no dia a dia, não o dashboard de analytics (ver Seção 9.4).
4. **Timeline de atividades como memória do relacionamento** — inspirado no HubSpot,
   toda interação (ligação, e-mail, reunião, nota) fica registrada cronologicamente
   no perfil do lead, eliminando o "onde estava mesmo essa informação?".
5. **Multi-workspace nativo** — pensado desde o início para freelancers/consultores
   que atendem vários clientes com isolamento total de dados entre eles.

---

## 4. Non-Goals — O que NÃO será construído no MVP

Estes itens estão explicitamente fora do escopo. Claude Code não deve implementá-los
sem aprovação explícita do time.

❌ **App mobile nativo (iOS/Android)** — apenas web responsivo (desktop-first,
   utilizável em tablet/mobile mas sem otimização dedicada) no MVP.

❌ **Automação de marketing** (e-mail em massa, campanhas, sequências) — é
   justamente o excesso que torna o HubSpot complexo para PMEs; mantém o produto
   focado em vendas.

❌ **Integrações externas prontas** (Zapier, Google Contacts, WhatsApp Business API,
   outros CRMs) — a API própria fica disponível como fundação (ver Seção 3 do
   escopo de features), mas sem conectores de terceiros construídos no MVP.

❌ **Automações de pipeline** (mover deal automaticamente por regra, triggers,
   workflows) — candidato de roadmap pós-launch, ver Seção 15.

❌ **Relatórios customizáveis / query builder** — apenas o dashboard fixo com as
   métricas definidas na Seção 6.5. Sem criação de relatórios ad-hoc pelo usuário.

❌ **Notificações push ou in-app em tempo real** — apenas e-mail transacional via
   Resend (convite de equipe, avisos de plano/pagamento). Sem central de notificações.

❌ **Múltiplos idiomas (i18n)** — interface apenas em português (pt-BR) no MVP.

❌ **Customização das etapas do pipeline pelo usuário** — as 6 etapas descritas na
   Seção 6.2 são fixas no MVP. Evita a confusão de configuração que trava usuários
   novos (insight do Pipedrive, ver Seção 10).

❌ **Importação em massa de leads** (CSV/Excel/API de terceiros) — cadastro manual
   apenas no MVP.

❌ **White-label, domínio customizado ou marca própria por workspace.**

---

## 5. Métricas de Sucesso

### 5.1 North Star Metric

**Workspaces Ativos Semanalmente (WAW)** — % de workspaces com pelo menos uma
ação de valor na semana (criar lead, mover negócio de etapa ou registrar atividade).

Justificativa: o modelo de receita é assinatura recorrente (Stripe). Retenção de uso
semanal é o melhor proxy de retenção de receita — um workspace que usa o pipeline
toda semana é um workspace que não cancela. North Star e monetização estão alinhados
por construção (evita o risco de otimizar uma métrica de vaidade desconectada da
receita).

### 5.2 KPIs de Produto

| KPI | Definição | Meta inicial (90 dias) |
|---|---|---|
| Ativação | % de workspaces novos que criam ≥1 lead **e** movem ≥1 negócio no pipeline dentro de 7 dias do cadastro | 40% |
| Retenção D30 | % de workspaces ativados que seguem com ≥1 ação de valor/semana 30 dias após o cadastro | 35% (referência de mercado: WAU/MAU > 0,6 é considerado saudável para CRM) |
| Tempo até primeiro valor (TTFV) | Tempo entre signup e primeiro negócio criado no pipeline | ≤ 5 minutos |

### 5.3 KPIs de Negócio

| KPI | Definição | Meta inicial (90 dias) |
|---|---|---|
| Conversão Free → Pro | % de workspaces Free que fazem upgrade em até 60 dias | 8–12% |
| Churn de assinatura Pro | % de assinaturas Pro canceladas por mês | < 5% |
| MRR | Receita recorrente mensal total | acompanhar tendência, sem meta fixa nos primeiros 90 dias |

### 5.4 Qualidade

| KPI | Definição | Meta |
|---|---|---|
| NPS | Coletado por e-mail 30 dias após signup | > 40 |

---

## 6. Funcionalidades Principais (MVP)

### 6.1 Gestão de Leads e Contatos
- Cadastro: nome, e-mail, telefone, empresa, cargo, status (Ativo / Inativo)
- Listagem com busca full-text (nome, e-mail, empresa) e filtros por status,
  responsável e data de cadastro
- Página de detalhe do lead (`/leads/[id]`) com perfil completo + timeline
  cronológica de atividades e negócios vinculados

### 6.2 Pipeline Kanban de Vendas
Etapas fixas (não customizáveis no MVP — ver Non-Goals):
1. Novo Lead
2. Contato Realizado
3. Proposta Enviada
4. Negociação
5. Fechado Ganho
6. Fechado Perdido

Cards de negócio (`deals`): título, valor estimado (R$), lead vinculado, responsável,
prazo (data de fechamento esperada).

**Regra de negócio:** drag-and-drop entre etapas persiste imediatamente no banco
(optimistic update com rollback em caso de erro de rede). Sem modal de confirmação
ao mover entre etapas intermediárias — **exceção:** mover para "Fechado Perdido"
exige confirmação com campo opcional de motivo, porque é uma ação com maior
consequência de relatório e mais difícil de reverter mentalmente.

### 6.3 Registro de Atividades
- Tipos: Ligação, E-mail, Reunião, Nota
- Campos: autor (usuário logado), descrição, data/hora
- Timeline cronológica (mais recente no topo) vinculada ao lead
- Ação de registrar atividade deve estar sempre visível e acessível em 1 clique a
  partir da página de detalhe do lead (nunca escondida em submenu — insight do
  Close CRM, ver Seção 10)

### 6.4 Dashboard de Métricas
- 4 KPI cards: Total de leads, Negócios abertos, Valor total do pipeline, Taxa de
  conversão (Fechado Ganho / total de negócios fechados)
- Cada card exibe o número principal em destaque tipográfico (2–3x maior que o
  label) — insight Stripe Dashboard / Baremetrics, ver Seção 10
- Gráfico de funil de vendas por etapa (Recharts)
- Lista "Meus negócios com prazo próximo" (7 dias) filtrada pelo usuário logado

### 6.5 Multi-empresa e Colaboração
- Criar workspaces (1 empresa/time = 1 workspace)
- Convite de colaborador por e-mail via Resend, com papel definido no convite
- Papéis: **Admin** (acesso total, incluindo billing e remoção de membros) e
  **Membro** (CRUD de leads, negócios e atividades; sem acesso a billing/settings
  de workspace)
- Alternar entre workspaces via dropdown fixo na sidebar
- Isolamento de dados via Row Level Security (RLS) no Supabase — toda tabela de
  dados de negócio tem `workspace_id` e política RLS obrigatória (ver CLAUDE.md)

### 6.6 Monetização (Stripe)
| Plano | Colaboradores | Leads | Preço |
|---|---|---|---|
| **Free** | até 2 | até 50 | R$ 0 |
| **Pro** | ilimitados | ilimitados | R$ 49/mês por workspace |

- Checkout via Stripe Checkout (assinatura recorrente mensal)
- Webhook do Stripe ativa/desativa o plano automaticamdo com base nos eventos
  `checkout.session.completed`, `customer.subscription.updated` e
  `customer.subscription.deleted`
- Customer Portal do Stripe para o Admin gerenciar/cancelar a própria assinatura
- Limite de plano aplicado por workspace (não por conta de usuário) — importante
  para a persona Freelancer, que pode ter um workspace Free e outro Pro

### 6.7 Landing Page
Página pública (`/`) com seções: Hero, Funcionalidades, Planos e Preços, CTA
(cadastro). Sem autenticação necessária.

### 6.8 Preferência de Tema (Claro / Escuro / Sistema)
- A aplicação suporta modo claro e modo escuro em toda a interface autenticada.
- Logo após o primeiro login, o sistema detecta a preferência de cor do sistema
  operacional do usuário (`prefers-color-scheme`) e pergunta explicitamente qual
  modo usar: **manter o modo claro** (padrão atual do produto), **mudar para
  escuro**, ou **seguir a configuração do sistema operacional** (o app muda
  automaticamente se o usuário trocar o tema do SO).
- A escolha feita é lembrada nas sessões seguintes — o app não pergunta de novo
  a cada login — e pode ser alterada a qualquer momento por um controle no menu
  do usuário (ver Seção 9.4, dropdown do avatar na topbar).
- Vale a mesma regra de contraste mínimo da Seção 9.6 (4.5:1 texto principal,
  3:1 placeholders) para os dois temas.

---

## 7. Personas e Tipos de Usuário

### Dono do Negócio / Empreendedor (Admin)
Pequeno empresário que precisa organizar seu processo de vendas. Cria o workspace,
convida o time, gerencia o plano (billing) e possui acesso completo a todas as
funcionalidades, incluindo remoção de membros e cancelamento de assinatura.

### Vendedor / Colaborador (Membro)
Profissional de vendas que usa o CRM no dia a dia operacional: cadastra leads,
move negócios no pipeline e registra atividades. Pode participar de múltiplos
workspaces (ex: vendedor que atua em duas empresas), mas não acessa billing nem
gerencia membros de um workspace onde não é Admin.

### Freelancer / Consultor (Admin Solo)
Profissional independente que atende vários clientes, usando um workspace separado
por cliente/projeto para isolamento total de dados. É Admin em todos os workspaces
que cria. Começa no plano Free em cada novo workspace e faz upgrade individualmente
conforme aquele cliente específico cresce em volume.

---

## 8. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS + shadcn/ui |
| Backend/API | Next.js API Routes + Server Components/Actions |
| Banco de dados + Auth | Supabase (PostgreSQL + Row Level Security + Supabase Auth) |
| Pagamento | Stripe (Checkout + Customer Portal + Webhooks) |
| E-mail transacional | Resend |
| Drag-and-drop | @dnd-kit |
| Gráficos | Recharts |
| Linguagem | TypeScript 5 |
| Versionamento | Git + GitHub |
| Deploy | Vercel (app) + Supabase (banco/auth) |
| IDE / Assistente | Cursor com Claude Code no terminal |

**Autenticação:** e-mail + senha via Supabase Auth no MVP. Sem login social
(Google/GitHub) — não mencionado no escopo original; tratar como Non-Goal implícito
até decisão explícita em contrário.

---

## 9. UX e Design

### 9.1 Mapa de Telas

```
PÚBLICAS (sem autenticação)
/                           → landing page
/login                      → formulário de login
/signup                     → formulário de cadastro
/invite/[token]             → aceite de convite de workspace

AUTENTICADAS
/onboarding                 → wizard de criação do primeiro workspace (sem sidebar ainda)
/pipeline                   → Kanban de vendas (tela padrão após login)
/leads                      → listagem de leads/contatos
/leads/new                  → cadastro de novo lead
/leads/[id]                 → detalhe do lead: perfil + timeline de atividades
/dashboard                  → métricas e funil de vendas
/settings/workspace         → nome do workspace, dados gerais (Admin)
/settings/team              → membros e convites pendentes (Admin)
/settings/billing           → plano atual, upgrade, Customer Portal (Admin)
/settings/profile           → dados do usuário logado (todos)
```

### 9.2 Fluxos Principais por Persona

**FLUXO 1 — Dono do negócio cria workspace e primeiro negócio**
```
/signup
  → preenche nome + e-mail + senha → [conta criada] →
/onboarding (passo 1: nome do workspace — ex. "Minha Empresa")
  → (passo 2 opcional: convidar colaboradores por e-mail — pode pular)
  → [workspace criado] →
/pipeline (estado vazio: 6 colunas fixas, todas sem cards)
  → clica "Novo negócio" → preenche título + valor + lead (cria lead inline se
    não existir) → negócio aparece na coluna "Novo Lead"
```

**FLUXO 2 — Vendedor move negócio pelo pipeline e registra atividade**
```
/pipeline
  → arrasta card de "Contato Realizado" para "Proposta Enviada"
    [update otimista: card já aparece na nova coluna antes da resposta do servidor]
  → clica no card → abre drawer de detalhe rápido do negócio
  → clica "Registrar atividade" → seleciona tipo "Ligação" → escreve nota → salva
  → atividade aparece no topo da timeline do lead vinculado
```

**FLUXO 3 — Admin convida colaborador e define papel**
```
/settings/team
  → vê lista de membros atuais + convites pendentes
  → clica "Convidar membro" → [modal: e-mail + papel (Admin / Membro)]
  → preenche e-mail + seleciona "Membro" → "Enviar convite"
  → [modal fecha] + toast: "Convite enviado para vendedor@empresa.com"
  → linha de convite pendente aparece com status "Aguardando aceite"
[colaborador abre link do e-mail] →
/invite/[token]
  → cria conta (se novo) ou faz login (se já tem conta)
  → [adicionado ao workspace como Membro] →
/pipeline (dados do workspace, sem acesso a /settings/billing ou /settings/team)
```

**FLUXO 4 — Admin faz upgrade para o plano Pro**
```
/settings/billing (plano atual: Free — "2/2 colaboradores, 48/50 leads")
  → clica "Fazer upgrade para Pro"
  → redireciona para Stripe Checkout
  → [pagamento confirmado] → webhook atualiza workspace → redireciona para
/settings/billing (plano atual: Pro) + toast "🎉 Bem-vindo ao Pro! Limites removidos."
```

### 9.3 Estados de Tela

**TELA: /pipeline**
```
├─ VAZIO (workspace novo, nenhum negócio criado)
│  6 colunas fixas visíveis, todas vazias
│  Coluna "Novo Lead": ilustração pequena + "Nenhum negócio aqui ainda."
│  Botão primário no header: "Novo negócio"
│
├─ CARREGANDO
│  Skeleton de 2-3 cards por coluna (mesma altura e estrutura dos cards reais)
│
├─ COM DADOS (estado normal)
│  Cards com: título, badge de valor (R$), avatar do responsável, prazo
│  Prazo vencido: texto em vermelho + ícone ⚠️
│  Drag-and-drop ativo entre todas as colunas
│
└─ ERRO AO MOVER CARD (falha de rede durante persistência)
   Card retorna à coluna original (rollback do optimistic update)
   Toast vermelho: "Não foi possível mover o negócio. Tente novamente."
```

**TELA: /leads (listagem)**
```
├─ VAZIA (nenhum lead cadastrado)
│  Ilustração centralizada + "Nenhum lead ainda."
│  Subtexto: "Cadastre seu primeiro lead para começar a vender."
│  Botão primário: "Adicionar lead"
│
├─ CARREGANDO
│  Skeleton de 8 linhas na tabela; busca e filtros visíveis mas desabilitados
│
├─ COM DADOS
│  Busca full-text (nome/e-mail/empresa) + filtros: status | responsável | data
│  Tabela: nome | empresa | status (badge) | responsável | última atividade
│  Paginação: 20 itens/página
│
├─ BUSCA SEM RESULTADO
│  "Nenhum lead encontrado para '[termo]'."
│  Botão: "Limpar busca" (reseta busca e filtros)
│
└─ LIMITE DO PLANO FREE ATINGIDO (50 leads)
   Banner amarelo persistente: "Você atingiu o limite de 50 leads do plano Free."
   Link inline: "Fazer upgrade" → /settings/billing
   Botão "Adicionar lead": desabilitado + tooltip "Limite do plano Free atingido."
```

**TELA: /leads/[id] (detalhe)**
```
├─ COM DADOS
│  Cabeçalho: nome, empresa, cargo, status (badge editável inline)
│  Botão sempre visível: "Registrar atividade"
│  Timeline cronológica (mais recente no topo): tipo de atividade (ícone) + autor
│    + descrição + data/hora relativa ("há 2 horas")
│  Seção lateral: negócios vinculados a este lead (cards resumidos)
│
└─ ERRO 404 (lead não existe ou não pertence ao workspace ativo)
   "Lead não encontrado." + botão "Voltar para leads"
```

**FORMULÁRIO: convidar membro (/settings/team)**
```
├─ IDLE
│  Campos: e-mail + papel (Admin / Membro)
│  Botão: "Enviar convite"
│
├─ ENVIANDO
│  Botão: spinner + "Enviando..." + desabilitado
│
├─ SUCESSO
│  Modal fecha + toast "Convite enviado para [email]."
│  Linha de convite pendente aparece na lista
│
├─ ERRO: e-mail já é membro
│  Campo e-mail: borda vermelha + "Este e-mail já faz parte da sua equipe."
│
├─ ERRO: convite pendente já existe
│  Campo e-mail: borda vermelha + "Já existe um convite pendente para este e-mail."
│
└─ ERRO: limite de colaboradores do plano Free atingido
   Modal exibe aviso no lugar do formulário: "Plano Free permite até 2 colaboradores."
   Botão: "Ver planos" → /settings/billing (substitui "Enviar convite")
```

### 9.4 Padrões de Navegação

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR (56px)                                                        │
│ [Logo PiperFlow]  ─────────────────────────  [🔔ausente MVP] [Avatar▼]│
├────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR (220px)         │  ÁREA DE CONTEÚDO                          │
│                         │                                             │
│ [Workspace ativo ▼]     │  [Título da tela]        [Ação primária]   │
│ ───────────────         │                                             │
│ 📊 Pipeline             │  [Conteúdo principal]                       │
│ 👤 Leads                │                                             │
│ 📈 Dashboard             │                                             │
│ ───────────────         │                                             │
│ ⚙️  Configurações        │                                             │
│   • Workspace           │                                             │
│   • Equipe               │                                             │
│   • Plano                │                                             │
└────────────────────────────────────────────────────────────────────────┘
```

**Nota:** ao contrário de produtos de analytics (top nav + sidebar dividindo
responsabilidades), o PiperFlow usa sidebar como centro de navegação — inclusive
o switcher de workspace fica na sidebar, não no top bar, porque o workspace é o
contexto raiz de tudo que o usuário vê (insight adaptado do padrão CRM, ver Seção 10).

**Tela padrão ao logar:** `/pipeline` — não o dashboard. O vendedor deve abrir o
Kanban toda manhã, não uma tela de métricas (insight direto do Pipedrive).

**Comportamentos de interação:**
- Drag-and-drop no pipeline: sem confirmação, exceto ao mover para "Fechado Perdido"
- Convidar membro: modal centralizado (ação simples, 2 campos)
- Trocar workspace: dropdown na sidebar, sem reload de página
- Registrar atividade: drawer lateral acessível de qualquer lugar do lead, nunca
  em página separada — reduz fricção (insight Close CRM)
- Cancelar assinatura: modal com confirmação — ação com consequência de negócio

**Responsividade:**
- Desktop-first: pipeline e cadastro de dados otimizados para uso no computador
- Sidebar colapsa para ícones em telas < 1280px (tooltip no hover)
- Pipeline em telas < 1024px: scroll horizontal entre colunas
- Tabela de leads em telas < 768px: cards empilhados em vez de tabela

### 9.5 Microcopy Crítico

**EMPTY STATES**
```
Pipeline (sem negócios):    "Nenhum negócio aqui ainda."
Leads (vazio):               "Nenhum lead ainda. Cadastre seu primeiro lead para começar a vender."
Equipe (só o Admin):         "Você está sozinho por enquanto. Convide colaboradores para vender junto."
Timeline (sem atividades):   "Nenhuma atividade registrada. Registre a primeira interação com este lead."
```

**CONFIRMAÇÕES DESTRUTIVAS**
```
Mover para Fechado Perdido:
  "Marcar este negócio como perdido? Você pode registrar o motivo (opcional)."
  [Cancelar]  [Marcar como perdido]  → botão vermelho

Remover membro:
  "Remover [nome] da equipe? Ele perderá acesso imediatamente a este workspace."
  [Cancelar]  [Remover]  → botão vermelho

Cancelar assinatura Pro:
  "Cancelar assinatura? Você manterá acesso ao Pro até [data de expiração].
   Após essa data, o workspace volta ao plano Free (2 colaboradores, 50 leads)."
  [Manter Pro]  [Cancelar assinatura]  → botão vermelho
```

**ERROS DE FORMULÁRIO**
```
E-mail (login, inválido):     "E-mail ou senha incorretos."  (mensagem genérica — nunca revelar qual campo está errado)
E-mail (convite, já membro):  "Este e-mail já faz parte da sua equipe."
E-mail (convite pendente):    "Já existe um convite pendente para este e-mail."
Valor do negócio (inválido):  "Informe um valor numérico válido."
Nome do lead (vazio):         "O nome é obrigatório."
```

**FEEDBACK DE AÇÕES BEM-SUCEDIDAS (toasts, duração 4s)**
```
Negócio criado:         "Negócio adicionado ao pipeline."
Negócio movido:          (sem toast — o movimento visual do card já é o feedback)
Atividade registrada:    "Atividade registrada."
Convite enviado:         "Convite enviado para [email]."
Membro removido:         "Membro removido da equipe."
Upgrade realizado:       "🎉 Bem-vindo ao Pro! Limites removidos."
Assinatura cancelada:    "Assinatura cancelada. Acesso Pro mantido até [data]."
```

### 9.6 Acessibilidade Mínima (WCAG 2.1 AA)

- Contraste mínimo 4.5:1 para texto principal e secundário; 3:1 para placeholders
- Pipeline: nunca usar cor isolada para indicar prazo vencido — combinar cor +
  ícone ⚠️ + texto ("Vencido")
- Drag-and-drop do Kanban: fornecer alternativa por teclado/menu ("Mover para...")
  para usuários que não conseguem usar arraste — requisito mínimo de acessibilidade
  para o @dnd-kit
- Todo campo de formulário tem `<label>` associada; erros com cor + ícone + texto
- Toasts de erro: `role="alert"`; toasts de sucesso: `aria-live="polite"`
- Modais: foco move para o título ao abrir, retorna ao elemento gatilho ao fechar,
  `aria-modal="true"`
- Focus ring visível em todos os elementos interativos

---

## 10. Design Language — Referências Competitivas

### HubSpot CRM

**Pontos fortes relevantes:**
- Timeline de contato como centro de gravidade — toda atividade em um único lugar
  cronológico
- Onboarding com dados de exemplo reduz a ansiedade da tela vazia

**Pontos fracos / oportunidade:**
- Complexidade que escala para sempre entre Marketing/Service/Operations Hub
- Recursos úteis bloqueados no plano gratuito, forçando upgrade antes de provar valor

**Insight para o PiperFlow:** adotar a timeline de atividade como centro da página
de detalhe do lead (Seção 6.3, 9.3), mas vetar qualquer proliferação de módulos
fora de vendas — cada feature "extra" é candidata a Non-Goal (Seção 4).
↳ **Conecta com:** Seção 6.3 (Registro de Atividades), Seção 9.3 (`/leads/[id]`)

### Pipedrive

**Pontos fortes relevantes:**
- Pipeline Kanban como tela âncora — o vendedor entende o funil num relance
- UX que minimiza tempo de entrada de dados, o CRM "sai do caminho" do vendedor

**Pontos fracos / oportunidade:**
- Sem plano genuinamente gratuito — barreira para quem quer só validar o processo
- Personalização de etapas confunde iniciantes

**Insight para o PiperFlow:** o pipeline é a tela padrão ao logar (não o dashboard);
etapas fixas no MVP eliminam a fricção de configuração; drag-and-drop sem
confirmação exceto para "Fechado Perdido".
↳ **Conecta com:** Seção 9.4 (tela padrão = `/pipeline`), Seção 6.2 (etapas fixas),
Seção 4 (Non-Goal: customização de etapas)

### Close CRM (referência adicional — activity-based selling)

**Pontos fortes relevantes:**
- Registro de atividade como gesto de 1 clique, nunca escondido em formulário longo

**Pontos fracos / oportunidade:**
- Interface densa e preço proibitivo para times pequenos — o oposto do público do PiperFlow

**Insight para o PiperFlow:** botão "Registrar atividade" sempre visível na página
de detalhe do lead, aberto em drawer lateral (não página separada), com os 4 tipos
de atividade acessíveis em 1 clique.
↳ **Conecta com:** Seção 6.3, Seção 9.5 (microcopy de atividades)

**Síntese:** o PiperFlow combina pipeline visual como âncora (Pipedrive), timeline
de atividade como memória do relacionamento (HubSpot) e fricção mínima no registro
de atividade (Close) — com o diferencial de ser genuinamente freemium e focado
apenas em vendas. Aposta central: "um CRM que pequenos times realmente usam todo
dia", não um CRM com todos os módulos que uma PME nunca vai precisar.

---

## 11. Modelo de Dados (Supabase / PostgreSQL)

Todas as tabelas de dados de negócio possuem `workspace_id` obrigatório com
Row Level Security habilitada. Nenhuma query pode ser feita sem filtrar por
workspace do usuário autenticado.

```sql
-- Workspaces (empresas/times/clientes de freelancer)
workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
)

-- Membros do workspace (relação usuário <-> workspace com papel)
workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
)

-- Convites pendentes
invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  token text not null unique,
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
)

-- Leads / contatos
leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  role_title text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  owner_id uuid references auth.users(id),
  created_at timestamptz not null default now()
)

-- Negócios / deals (cards do pipeline)
deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  title text not null,
  value numeric(12,2) not null default 0,
  stage text not null default 'new_lead' check (
    stage in ('new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost')
  ),
  lost_reason text,
  owner_id uuid references auth.users(id),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

-- Atividades (timeline)
activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  type text not null check (type in ('call', 'email', 'meeting', 'note')),
  description text not null,
  author_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
)
```

**Índices recomendados:** `workspace_id` em todas as tabelas; `(workspace_id, stage)`
em `deals` para o Kanban; `(workspace_id, lead_id, created_at desc)` em `activities`
para a timeline.

---

## 12. Endpoints Principais (Next.js API Routes / Server Actions)

```
POST   /api/workspaces                     Criar workspace (onboarding)
GET    /api/workspaces/:id                 Detalhe do workspace ativo

POST   /api/invites                        Criar convite (Admin apenas)
POST   /api/invites/:token/accept          Aceitar convite

GET    /api/leads?search=&status=&owner=   Listar leads com filtros
POST   /api/leads                          Criar lead
GET    /api/leads/:id                      Detalhe + timeline
PATCH  /api/leads/:id                      Atualizar lead

POST   /api/deals                          Criar negócio
PATCH  /api/deals/:id                      Atualizar (inclui mudança de stage)
PATCH  /api/deals/:id/stage                Mover no pipeline (endpoint dedicado
                                            para otimizar o drag-and-drop)

POST   /api/activities                     Registrar atividade

POST   /api/stripe/checkout                Criar sessão de Stripe Checkout
POST   /api/stripe/portal                  Criar sessão de Customer Portal
POST   /api/stripe/webhook                 Processar eventos do Stripe
                                            (verificação de assinatura obrigatória)
```

---

## 13. User Stories

### Dono do Negócio / Admin

- Como **Admin**, quero **criar meu workspace no onboarding** para começar a usar
  o CRM em menos de 2 minutos.
  Critério: workspace criado, usuário redirecionado para `/pipeline` vazio em
  até 5 segundos após submeter o formulário.

- Como **Admin**, quero **convidar um colaborador por e-mail** para que ele acesse
  o workspace sem eu precisar criar a conta manualmente por ele.
  Critério: e-mail de convite chega em < 2 minutos via Resend; ao aceitar, o
  colaborador aparece imediatamente em `/settings/team`; link expira em 48h com
  mensagem de expiração clara.

- Como **Admin**, quero **fazer upgrade para o plano Pro via Stripe** para remover
  os limites de colaboradores e leads sem falar com suporte.
  Critério: após pagamento confirmado no Stripe, o plano do workspace atualiza em
  até 30 segundos via webhook; limites são removidos na próxima ação do usuário.

- Como **Admin**, quero **remover um colaborador** para que ex-membros percam
  acesso imediatamente.
  Critério: usuário removido recebe erro de autorização na próxima requisição
  autenticada àquele workspace.

### Vendedor / Membro

- Como **Membro**, quero **cadastrar um lead rapidamente** para não perder tempo
  em formulários longos antes de começar a vender.
  Critério: formulário com apenas nome obrigatório; demais campos opcionais;
  lead aparece na listagem imediatamente após salvar.

- Como **Membro**, quero **arrastar um negócio entre etapas do pipeline** para
  refletir o progresso real da venda sem preencher formulários.
  Critério: card se move visualmente de forma instantânea (optimistic update);
  em caso de falha de rede, o card retorna à posição original com mensagem de erro.

- Como **Membro**, quero **registrar uma ligação ou reunião no perfil do lead**
  para que qualquer colega saiba o histórico antes de entrar em contato.
  Critério: atividade aparece no topo da timeline com tipo, autor, data/hora e
  descrição, visível para todos os membros do workspace.

### Freelancer / Consultor (Admin Solo)

- Como **Freelancer**, quero **criar um workspace separado por cliente** para
  manter os dados de cada projeto completamente isolados.
  Critério: nenhum dado (lead, negócio, atividade) de um workspace é visível ou
  acessível a partir de outro, mesmo sendo o mesmo usuário Admin em ambos.

- Como **Freelancer**, quero **fazer upgrade de apenas um workspace específico**
  para pagar Pro somente no cliente que já justifica o investimento.
  Critério: o plano é um atributo do workspace, não da conta do usuário; upgrade
  em um workspace não afeta os limites dos demais.

---

## 14. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Escopo do MVP é extenso (auth + multi-tenant + Kanban + billing + dashboard + landing) para um time pequeno/solo com Cursor + Claude Code | Atraso no lançamento | Priorizar milestones da Seção 15 — M1 e M2 são o núcleo vendável; M3 em diante pode escorregar sem travar o lançamento |
| Hipótese de problema (Seção 2) não validada com usuários reais antes da construção | Construir features que ninguém usa | Lançar M1 (pipeline + leads + auth) para um grupo pequeno de usuários reais antes de investir em billing e dashboard completos |
| RLS mal configurada no Supabase pode vazar dados entre workspaces | Vazamento de dados entre clientes/empresas — crítico para a persona Freelancer | Toda tabela nova exige política RLS testada antes do merge; ver regra específica no CLAUDE.md |
| Webhook do Stripe processado fora de ordem ou duplicado | Plano incorreto no workspace, cobrança duplicada | Implementar idempotência por `event.id` e verificação de assinatura (ver CLAUDE.md) |
| North Star (retenção semanal) pode demorar a mostrar sinal em uma base pequena de usuários iniciais | Decisões de produto sem dado suficiente | Complementar com TTFV e ativação (sinais rápidos) enquanto a base cresce |

---

## 15. Milestones

**M0 — Fundação (auth + multi-tenant)**
Signup/login via Supabase Auth, criação de workspace, onboarding, RLS básica,
convite de membro por e-mail.
Critério de sucesso: um Admin consegue criar conta, criar workspace e convidar
um Membro de ponta a ponta sem erros.

**M1 — Núcleo de vendas (validação da hipótese central)**
Leads (CRUD + busca/filtros), pipeline Kanban com as 6 etapas fixas e
drag-and-drop, página de detalhe do lead com registro de atividades.
Critério de sucesso: um usuário real consegue cadastrar um lead, criar um
negócio, movê-lo pelo pipeline e registrar uma atividade sem suporte.

**M2 — Monetização**
Integração Stripe Checkout, webhook de ativação/desativação de plano, limites
de plano Free aplicados (2 colaboradores / 50 leads), Customer Portal.
Critério de sucesso: um workspace consegue fazer upgrade e o limite é removido
automaticamente em produção.

**M3 — Visibilidade e lançamento público**
Dashboard de métricas com gráfico de funil, landing page pública.
Critério de sucesso: produto pronto para tráfego externo (landing + funil de
cadastro + primeira experiência completa).

**Pós-MVP (backlog, fora do escopo deste PRD):** automações de pipeline,
importação de leads, integrações externas, notificações in-app, relatórios
customizáveis — todos atualmente listados como Non-Goals (Seção 4).
