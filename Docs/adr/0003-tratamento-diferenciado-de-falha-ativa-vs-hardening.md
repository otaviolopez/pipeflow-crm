# 0003. Tratamento diferenciado: falha ativa vs. hardening de configuração

Data: 2026-07-14

## Status

Aceito

## Contexto

A auditoria de segurança da aula 5.1 encontrou dois tipos de achado bem
diferentes, e foi preciso decidir se ambos mereciam o mesmo tratamento
imediato:

1. `accept_invite()` (RPC do Supabase) nunca comparava o e-mail de quem
   aceita o convite com `invites.email` — qualquer usuário autenticado, com
   qualquer e-mail, conseguia aceitar um convite vazado (print, link
   encaminhado por engano) e virar membro, ou até admin, de um workspace
   alheio, sem precisar de nenhuma senha comprometida. Uma falha ativa e
   explorável no código do projeto, hoje.
2. `auth_leaked_password_protection` (recurso do Supabase Auth que rejeita
   senhas já conhecidas por vazamento, consultando a API do
   HaveIBeenPwned) estava desabilitado no projeto. Isso não é uma falha no
   código do PiperFlow — é uma camada de defesa em profundidade ausente,
   que reduz o risco de um cenário específico (usuário reaproveita uma
   senha já vazada em outro serviço), mas não é, por si só, uma
   vulnerabilidade explorável através de algo que o projeto escreveu.

Além da diferença de risco, os dois achados também diferem em **como** são
corrigidos: o primeiro é uma mudança de código (`supabase/schema.sql`),
aplicável via SQL contra o banco. O segundo é um toggle de configuração do
serviço de Auth, que só existe via Supabase Studio (Authentication →
Policies) ou via `supabase config push` — comando que substitui a
configuração inteira do projeto pelo conteúdo de um `config.toml` local, e
o Supabase CLI não oferece um `config pull` para trazer a configuração real
do projeto antes de editá-la. Ou seja: aplicar o toggle "à distância" via
CLI exigiria criar esse arquivo do zero com valores padrão, arriscando
sobrescrever silenciosamente outras configurações de Auth já existentes no
projeto (provedores de login, templates de e-mail) sem visibilidade de
quais são.

## Decisão

Falhas ativas e exploráveis (categoria 1) são corrigidas e aplicadas
imediatamente, sem esperar aprovação passo a passo de cada etapa —
incluindo escrever a correção, aplicá-la no banco de produção via CLI, e
validar com um ataque simulado real contra o ambiente real.

Recomendações de hardening que exigem mudança de configuração fora do
código versionado do projeto (categoria 2) são **reportadas como
recomendação**, não aplicadas automaticamente por CLI quando o caminho
automatizado (`config push` sem `config pull` prévio) tem risco real de
efeito colateral em configuração não relacionada. Quando o usuário confirma
que quer aplicar mesmo assim, a aplicação é feita manualmente por ele no
Studio (ação de 1 clique, sem esse risco), e a mensagem de erro que o
usuário final vê é ajustada no código do formulário para ser específica
("essa senha já apareceu em vazamentos conhecidos, por segurança não pode
ser usada aqui") em vez de manter a mensagem genérica de senha inválida.

## Alternativas consideradas

- **Tratar os dois achados com o mesmo nível de urgência e aplicar tudo via
  CLI sem checar o risco de `config push`**: descartada porque o
  `config push` sem um `config.toml` que reflita fielmente o estado atual
  do projeto pode desabilitar configurações de Auth já existentes (ex.:
  provedores OAuth configurados manualmente no Studio), trocando um
  problema pequeno (senha vazada não bloqueada) por um potencialmente
  maior (login quebrado para usuários reais).
- **Reportar os dois achados só como recomendação, sem corrigir nada
  automaticamente**: descartada para o achado 1 — a checagem de e-mail
  ausente em `accept_invite()` é uma falha ativa com exploração trivial
  (só precisa do token vazado), então adiar a correção para uma ação
  manual do usuário deixaria a vulnerabilidade aberta por mais tempo sem
  necessidade, já que a correção via SQL não tem o mesmo risco de efeito
  colateral do `config push`.
- **Criar o `config.toml` mesmo assim, restringindo o escopo do arquivo a
  só o campo de senha vazada**: descartada porque o comportamento exato do
  `supabase config push` com um arquivo parcial (se ele mescla com a
  configuração remota existente ou a substitui por completo) não está
  documentado com certeza suficiente para arriscar contra o projeto de
  produção.

## Consequências

Fica mais fácil: decisões futuras sobre "corrigir agora vs. recomendar"
têm um critério objetivo — é uma falha ativa explorável através do código
do projeto, ou é uma configuração de plataforma que só existe fora do
repositório? A primeira categoria é corrigida com a mesma agilidade
independente de quem a encontrou (auditoria formal, advisor automatizado do
Supabase, revisão manual); a segunda é reportada e aplicada com o cuidado
extra que uma mudança de configuração de infraestrutura compartilhada
merece.

Fica mais difícil: essa distinção exige julgamento em cada novo achado —
nem sempre é óbvio se algo é "código do projeto" ou "configuração de
plataforma", e a linha pode ficar ambígua em casos futuros (ex.: uma
policy de RLS é código, mas um rate limit do Supabase Auth é configuração).
Vale revisitar este ADR se o `supabase config pull` (ou equivalente) vier a
existir em uma versão futura do CLI, o que reduziria o risco do caminho
automatizado e mudaria o cálculo desta decisão.
