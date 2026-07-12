import { getProfilesByIds } from "@/lib/profiles/queries";
import { createClient } from "@/lib/supabase/server";

import type { Activity, ActivityType, Lead, LeadStatus } from "./types";

export async function getLeadsForWorkspace(workspaceId: string): Promise<Lead[]> {
  const supabase = await createClient();

  const [{ data: leadsData }, { data: activitiesData }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, email, phone, company, role_title, status, owner_id, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    // Só lead_id + created_at, ordenado desc: dá pra achar a atividade mais
    // recente de cada lead sem uma query por lead (dataset pequeno o
    // suficiente — limite de 50 leads no Free — para trazer tudo de uma vez).
    supabase
      .from("activities")
      .select("lead_id, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
  ]);

  const leads = leadsData ?? [];
  const ownerIds = leads.map((lead) => lead.owner_id).filter((id): id is string => id !== null);
  const ownerNames = await getProfilesByIds(ownerIds);

  const lastActivityByLead = new Map<string, string>();
  for (const activity of activitiesData ?? []) {
    if (!lastActivityByLead.has(activity.lead_id)) {
      lastActivityByLead.set(activity.lead_id, activity.created_at);
    }
  }

  return leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    roleTitle: lead.role_title,
    status: lead.status as LeadStatus,
    ownerName: (lead.owner_id && ownerNames.get(lead.owner_id)) || "—",
    createdAt: lead.created_at,
    lastActivityAt: lastActivityByLead.get(lead.id) ?? null,
  }));
}

export async function getLeadById(workspaceId: string, leadId: string): Promise<Lead | null> {
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, name, email, phone, company, role_title, status, owner_id, created_at")
    // workspace_id sempre explícito na query (CLAUDE.md), mesmo já coberto
    // pela RLS — defesa em profundidade.
    .eq("workspace_id", workspaceId)
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) return null;

  const ownerNames = await getProfilesByIds(lead.owner_id ? [lead.owner_id] : []);

  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    roleTitle: lead.role_title,
    status: lead.status as LeadStatus,
    ownerName: (lead.owner_id && ownerNames.get(lead.owner_id)) || "—",
    createdAt: lead.created_at,
  };
}

export async function getActivitiesForLead(
  workspaceId: string,
  leadId: string
): Promise<Activity[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("activities")
    .select("id, lead_id, type, description, author_id, created_at")
    .eq("workspace_id", workspaceId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  const activities = data ?? [];
  const authorNames = await getProfilesByIds(activities.map((activity) => activity.author_id));

  return activities.map((activity) => ({
    id: activity.id,
    leadId: activity.lead_id,
    type: activity.type as ActivityType,
    description: activity.description,
    authorName: authorNames.get(activity.author_id) ?? "—",
    createdAt: activity.created_at,
  }));
}
