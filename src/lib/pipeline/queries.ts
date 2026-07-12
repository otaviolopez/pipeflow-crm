import { getProfilesByIds } from "@/lib/profiles/queries";
import { createClient } from "@/lib/supabase/server";

import type { Deal, DealStage } from "./types";

type DealRow = {
  id: string;
  title: string;
  value: number;
  stage: string;
  lost_reason: string | null;
  owner_id: string | null;
  due_date: string | null;
  lead_id: string;
  // deals.lead_id referencia public.leads (mesmo schema), então o PostgREST
  // consegue embutir o join direto — diferente de owner_id/author_id, que
  // apontam para auth.users e precisam do merge manual via profiles.
  leads: { name: string } | null;
};

async function toDeal(row: DealRow, ownerNames: Map<string, string>): Promise<Deal> {
  return {
    id: row.id,
    title: row.title,
    value: row.value,
    leadId: row.lead_id,
    leadName: row.leads?.name ?? "—",
    ownerName: (row.owner_id && ownerNames.get(row.owner_id)) || "—",
    dueDate: row.due_date,
    stage: row.stage as DealStage,
    lostReason: row.lost_reason ?? undefined,
  };
}

export async function getDealsForWorkspace(workspaceId: string): Promise<Deal[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("deals")
    .select("id, title, value, stage, lost_reason, owner_id, due_date, lead_id, leads(name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as DealRow[];
  const ownerNames = await getProfilesByIds(
    rows.map((row) => row.owner_id).filter((id): id is string => id !== null)
  );

  return Promise.all(rows.map((row) => toDeal(row, ownerNames)));
}

export async function getDealsForLead(workspaceId: string, leadId: string): Promise<Deal[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("deals")
    .select("id, title, value, stage, lost_reason, owner_id, due_date, lead_id, leads(name)")
    .eq("workspace_id", workspaceId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as DealRow[];
  const ownerNames = await getProfilesByIds(
    rows.map((row) => row.owner_id).filter((id): id is string => id !== null)
  );

  return Promise.all(rows.map((row) => toDeal(row, ownerNames)));
}
