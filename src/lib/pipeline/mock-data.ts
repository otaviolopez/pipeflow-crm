import type { Deal } from "./types";

// Dados mockados em memória (Fase 1 do plan.md) — a conexão com o Supabase
// real só acontece no M11. Prazos são relativos a hoje para o estado
// "vencido" continuar fazendo sentido em qualquer dia que o app for aberto.
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const MOCK_DEALS: Deal[] = [
  {
    id: "1",
    leadId: "mock-lead-1",
    title: "Implantação CRM — Studio Aurora",
    value: 4800,
    leadName: "Studio Aurora",
    ownerName: "Ana Souza",
    dueDate: daysFromNow(5),
    stage: "new_lead",
  },
  {
    id: "2",
    leadId: "mock-lead-2",
    title: "Consultoria de vendas — Grupo Ravena",
    value: 12000,
    leadName: "Grupo Ravena",
    ownerName: "Bruno Lima",
    dueDate: daysFromNow(-2),
    stage: "new_lead",
  },
  {
    id: "3",
    leadId: "mock-lead-3",
    title: "Plano anual — Cafeteria Bom Grão",
    value: 2400,
    leadName: "Cafeteria Bom Grão",
    ownerName: "Ana Souza",
    dueDate: null,
    stage: "contacted",
  },
  {
    id: "4",
    leadId: "mock-lead-4",
    title: "Upgrade Pro — Ótica Visão Clara",
    value: 5880,
    leadName: "Ótica Visão Clara",
    ownerName: "Carla Dias",
    dueDate: daysFromNow(3),
    stage: "contacted",
  },
  {
    id: "5",
    leadId: "mock-lead-5",
    title: "Proposta enviada — Construtora Pinheiro",
    value: 32000,
    leadName: "Construtora Pinheiro",
    ownerName: "Bruno Lima",
    dueDate: daysFromNow(-1),
    stage: "proposal_sent",
  },
  {
    id: "6",
    leadId: "mock-lead-6",
    title: "Renovação — Farmácia Vida Plena",
    value: 9600,
    leadName: "Farmácia Vida Plena",
    ownerName: "Carla Dias",
    dueDate: daysFromNow(7),
    stage: "proposal_sent",
  },
  {
    id: "7",
    leadId: "mock-lead-7",
    title: "Negociação de desconto — Auto Peças União",
    value: 18500,
    leadName: "Auto Peças União",
    ownerName: "Ana Souza",
    dueDate: daysFromNow(2),
    stage: "negotiation",
  },
  {
    id: "8",
    leadId: "mock-lead-8",
    title: "Contrato anual — Studio de Pilates Movimente",
    value: 7200,
    leadName: "Studio de Pilates Movimente",
    ownerName: "Bruno Lima",
    dueDate: daysFromNow(-4),
    stage: "negotiation",
  },
  {
    id: "9",
    leadId: "mock-lead-9",
    title: "Fechamento — Padaria Trigo Dourado",
    value: 3600,
    leadName: "Padaria Trigo Dourado",
    ownerName: "Carla Dias",
    dueDate: daysFromNow(-10),
    stage: "won",
  },
  {
    id: "10",
    leadId: "mock-lead-10",
    title: "Contrato fechado — Barbearia Corte Fino",
    value: 2160,
    leadName: "Barbearia Corte Fino",
    ownerName: "Ana Souza",
    dueDate: daysFromNow(-15),
    stage: "won",
  },
  {
    id: "11",
    leadId: "mock-lead-11",
    title: "Sem orçamento — Loja Estilo Urbano",
    value: 4300,
    leadName: "Loja Estilo Urbano",
    ownerName: "Bruno Lima",
    dueDate: daysFromNow(-20),
    stage: "lost",
    lostReason: "Cliente optou por continuar usando planilhas.",
  },
];
