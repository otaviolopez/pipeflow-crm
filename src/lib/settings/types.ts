// Valores em inglês, iguais ao schema do banco (CLAUDE.md) — a tradução
// para português é só de apresentação.
export type MemberRole = "admin" | "member";

export type Member = {
  id: string; // id da linha em workspace_members (usado para remover)
  userId: string; // id do usuário (auth.users/profiles) — compara com a sessão atual
  name: string;
  email: string;
  role: MemberRole;
};

export type Invite = {
  id: string;
  email: string;
  role: MemberRole;
  createdAt: string; // ISO
};

export type Plan = "free" | "pro";

export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: "Admin",
  member: "Membro",
};

// Limite de colaboradores do plano Free (PRD, Seção 6.6) — checado aqui só
// pra exibir os estados de tela; a validação de verdade é sempre no servidor
// (CLAUDE.md). O limite de leads equivalente já existe em lib/leads/types.ts.
export const FREE_PLAN_MEMBER_LIMIT = 2;
export const PRO_PLAN_PRICE_LABEL = "R$ 49/mês";
