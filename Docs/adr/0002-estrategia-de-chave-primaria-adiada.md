# 0002. Estratégia de chave primária adiada

Data: 2026-07-14

## Status

Proposto

## Contexto

Uma revisão do schema contra as boas práticas de performance do Postgres/
Supabase identificou que todas as tabelas do PiperFlow (`workspaces`,
`workspace_members`, `invites`, `leads`, `deals`, `activities`) usam
`id uuid primary key default gen_random_uuid()` — UUID v4, gerado de forma
totalmente aleatória.

UUID v4 aleatório é uma escolha conhecida por causar fragmentação de índice
em tabelas grandes: o índice B-tree por trás de toda chave primária funciona
melhor com valores inseridos em ordem crescente (como um `bigint` sequencial
ou um UUID v7, que embute timestamp); um UUID v4 insere em posições
imprevisíveis dentro do índice, aumentando o espaço em disco e reduzindo o
aproveitamento do cache de páginas.

Esse é um ganho de performance real, mas que só se manifesta em tabelas com
milhões de linhas e alta taxa de inserção — volume muito acima do esperado
para um CRM de pequenas equipes (o próprio plano Free limita a 50 leads por
workspace). Trocar a estratégia de PK, além disso, é uma migração invasiva:
afeta toda foreign key que referencia esses IDs, exige recriar constraints e
converter dados já existentes em produção.

## Decisão

Vamos manter UUID v4 aleatório como estratégia de chave primária por agora,
e não migrar nada preventivamente. Esta decisão fica registrada como
**Proposta** (não Aceita nem Rejeitada definitivamente) porque a resposta
correta depende de uma condição futura ainda não satisfeita: o projeto
precisa primeiro sair do estágio de MVP/aprendizado e se tornar um produto
real, com volume de dados que justifique o custo da migração.

## Alternativas consideradas

- **`bigint` sequencial (`generated always as identity`)**: mais eficiente
  para o índice, mas vaza informação de contagem de registros — um problema
  real aqui porque o `id` do lead já aparece na URL pública
  (`/leads/[id]`), permitindo adivinhar quantos leads existem e tentar IDs
  vizinhos.
- **UUID v7 (time-ordered)**: resolveria a fragmentação de índice sem vazar
  contagem, mas exige a extensão `pg_uuidv7`, que não está disponível por
  padrão em toda instância Supabase — dependência externa a mais para um
  ganho que hoje não é sentido.
- **Migrar agora, preventivamente**: descartada porque o custo (recriar FKs,
  converter dados de produção já existentes, testar todo o fluxo de novo) não
  se justifica para um volume de dados que está ordens de grandeza abaixo do
  ponto em que essa otimização importa.

## Consequências

Fica mais fácil: nenhum esforço de migração agora; o schema atual continua
simples de entender e não introduz dependência de extensão externa.

Fica mais difícil: se o projeto crescer rapidamente em volume de dados sem
que essa decisão seja revisitada a tempo, a migração terá que ser feita sob
pressão, em produção, com usuários reais já usando o sistema — um cenário
mais arriscado do que planejar a troca com antecedência. Esta decisão exige
revisão ativa: ela não deve ser esquecida, só adiada. Ver também a memória de
projeto `project_future_pk_strategy.md`, que registra o mesmo adiamento para
ser lembrado em conversas futuras com o assistente.
