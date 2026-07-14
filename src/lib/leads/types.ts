// Valores em inglês, iguais ao schema do banco (CLAUDE.md) — a tradução
// para português é só de apresentação. Independente de deals.stage (PRD,
// Seção 6.1): nenhum valor aqui significa "virou cliente" — isso é sempre
// deals.stage === 'won'.
export type LeadStatus = "new" | "contacted" | "waiting" | "qualified" | "disqualified";

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
  lastActivityAt?: string | null; // preenchido só na listagem (/leads)
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

// Limite do plano Free (PRD, Seção 6.6) — checado aqui só para exibir o
// banner; a validação de verdade é sempre no servidor (CLAUDE.md).
export const FREE_PLAN_LEAD_LIMIT = 50;

export const LEADS_PAGE_SIZE = 20;
