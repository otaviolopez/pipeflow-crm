// Valores em inglês, iguais ao schema do banco (CLAUDE.md) — a tradução
// para português (STAGES abaixo) é só de apresentação.
export type DealStage =
  | "new_lead"
  | "contacted"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

export type Deal = {
  id: string;
  title: string;
  value: number;
  leadName: string;
  ownerName: string;
  dueDate: string | null; // ISO yyyy-mm-dd
  stage: DealStage;
  lostReason?: string;
};

// Ordem fixa das 6 etapas do pipeline (PRD, Seção 6.2) — não customizável no MVP.
export const STAGES: { id: DealStage; label: string }[] = [
  { id: "new_lead", label: "Novo Lead" },
  { id: "contacted", label: "Contato Realizado" },
  { id: "proposal_sent", label: "Proposta Enviada" },
  { id: "negotiation", label: "Negociação" },
  { id: "won", label: "Fechado Ganho" },
  { id: "lost", label: "Fechado Perdido" },
];
