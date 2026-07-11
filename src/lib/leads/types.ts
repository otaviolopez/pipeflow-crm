// Valores em inglês, iguais ao schema do banco (CLAUDE.md) — a tradução
// para português é só de apresentação.
export type LeadStatus = "active" | "inactive";

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  roleTitle: string | null;
  status: LeadStatus;
  ownerName: string;
  createdAt: string; // ISO
};

export type ActivityType = "call" | "email" | "meeting" | "note";

export type Activity = {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  authorName: string;
  createdAt: string; // ISO
};

export const ACTIVITY_TYPES: { id: ActivityType; label: string }[] = [
  { id: "call", label: "Ligação" },
  { id: "email", label: "E-mail" },
  { id: "meeting", label: "Reunião" },
  { id: "note", label: "Nota" },
];

// Mesmos 3 responsáveis usados no mock do pipeline (M4), para o dado mockado
// parecer um único workspace coerente.
export const OWNERS = ["Ana Souza", "Bruno Lima", "Carla Dias"] as const;

// Limite do plano Free (PRD, Seção 6.6) — checado aqui só para exibir o
// banner; a validação de verdade é sempre no servidor (CLAUDE.md).
export const FREE_PLAN_LEAD_LIMIT = 50;

export const LEADS_PAGE_SIZE = 20;
