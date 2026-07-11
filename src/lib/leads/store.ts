import { MOCK_ACTIVITIES, MOCK_LEADS } from "./mock-data";
import type { Activity, ActivityType, Lead, LeadStatus } from "./types";

// "Banco" em memória, só do lado do cliente — vive enquanto a aba estiver
// aberta e é compartilhado entre /leads, /leads/new e /leads/[id] porque a
// navegação do Next é client-side (o módulo não é recarregado a cada rota).
// Substituído por Server Actions de verdade no M10 (plan.md).
let leads: Lead[] = [...MOCK_LEADS];
let activities: Activity[] = [...MOCK_ACTIVITIES];

export function getLeads(): Lead[] {
  return leads;
}

export function getLeadById(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id);
}

export function addLead(input: {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  roleTitle: string | null;
}): Lead {
  const lead: Lead = {
    id: crypto.randomUUID(),
    status: "active",
    ownerName: "Você",
    createdAt: new Date().toISOString(),
    ...input,
  };
  leads = [lead, ...leads];
  return lead;
}

export function updateLeadStatus(id: string, status: LeadStatus): void {
  leads = leads.map((lead) => (lead.id === id ? { ...lead, status } : lead));
}

export function getActivitiesForLead(leadId: string): Activity[] {
  return activities
    .filter((activity) => activity.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLastActivityAt(leadId: string): string | null {
  return getActivitiesForLead(leadId)[0]?.createdAt ?? null;
}

export function addActivity(input: {
  leadId: string;
  type: ActivityType;
  description: string;
  authorName: string;
}): Activity {
  const activity: Activity = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  activities = [activity, ...activities];
  return activity;
}
