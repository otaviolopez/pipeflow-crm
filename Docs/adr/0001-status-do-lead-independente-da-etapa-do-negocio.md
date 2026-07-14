# 0001. Status do lead independente da etapa do negócio

Data: 2026-07-14

## Status

Aceito

## Contexto

O schema original definia `leads.status` como um enum binário (`active` /
`inactive`), suficiente apenas para marcar se um contato ainda estava em
prospecção ativa. Havia uma ambiguidade real que precisava ser resolvida
antes de expandir esse enum: será que "status do lead" e "etapa do negócio"
(`deals.stage`, que já tem 6 valores — `new_lead` → `contacted` →
`proposal_sent` → `negotiation` → `won` → `lost`) deveriam ser fundidos num
único conceito, ou continuar como dois conceitos paralelos?

A pressão para adicionar um novo valor veio de um caso de uso concreto: faltava
um status "Em espera" para representar um lead contatado que está aguardando
retorno — um estado de gestão de contato, não de negociação comercial.

## Decisão

Vamos manter `leads.status` e `deals.stage` como dois enums completamente
independentes, sem nenhum valor compartilhado ou mapeamento implícito entre
eles. `leads.status` passa a ter 5 valores: `new`, `contacted`, `waiting`,
`qualified`, `disqualified`. Nenhum valor de `leads.status` corresponde a
"virou cliente" — isso é sempre e exclusivamente representado por
`deals.stage = 'won'`.

## Alternativas consideradas

- **Fundir os dois conceitos num único enum de "estágio do relacionamento"**:
  descartada porque um lead pode ter zero, um, ou vários negócios associados
  (schema já modela `deals.lead_id` como N:1), e cada negócio tem sua própria
  etapa. Um único enum por lead não conseguiria representar "lead qualificado
  com um negócio em proposta e outro em negociação" sem perder informação.
- **Reaproveitar `deals.stage` diretamente em `leads`, adicionando `qualified`/
  `disqualified` como novas etapas de negócio**: descartada porque misturaria
  o funil de vendas (que já é bem definido no PRD, Seção 6.2, com 6 etapas
  fixas não customizáveis) com o ciclo de vida de gestão de contato — um lead
  pode ser "desqualificado" sem nunca ter chegado a virar um negócio de
  verdade.
- **Manter o binário `active`/`inactive` e adicionar `waiting` como terceiro
  valor solto**: descartada por ser insuficiente a médio prazo — resolveria
  só o pedido imediato sem cobrir estados já discutidos como "qualificado"/
  "desqualificado", que são úteis para relatórios futuros de funil de
  qualificação.

## Consequências

Fica mais fácil: reportar taxa de qualificação de leads sem depender do
pipeline de negócios; o time de vendas pode marcar um lead como
"desqualificado" sem afetar negócios já abertos vinculados a ele; a UI (badge
de 5 cores, filtro de status) reflete estados de negócio reais em vez de um
binário genérico.

Fica mais difícil: qualquer relatório futuro que precise cruzar "status do
lead" com "etapa do negócio" precisa fazer join explícito entre as duas
tabelas — não há atalho de coluna única. A migração de dados existentes
(`active` → `new`, `inactive` → `disqualified`) é uma aproximação: não há
como saber retroativamente quanto progresso um lead binário `active` já tinha
antes da migração, então todo `active` virou `new` (o estado inicial), mesmo
que alguns já estivessem de fato qualificados.
