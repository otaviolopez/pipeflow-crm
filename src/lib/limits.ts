import type { SupabaseClient } from "@supabase/supabase-js";

import { FREE_PLAN_LEAD_LIMIT } from "@/lib/leads/types";
import { FREE_PLAN_MEMBER_LIMIT } from "@/lib/settings/types";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

// Checagem de limite do plano Free (PRD, Seção 6.6) — sempre re-executada no
// servidor antes de criar o registro (CLAUDE.md), nunca só confiando no que
// a UI mostrou. Pro é ilimitado, então retorna liberado sem consultar o banco.
export async function canAddLead(
  supabase: Client,
  workspaceId: string,
  plan: string
): Promise<boolean> {
  if (plan !== "free") return true;

  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  return (count ?? 0) < FREE_PLAN_LEAD_LIMIT;
}

// Conta membros atuais + convites pendentes (um convite aceito vira membro) —
// mesma regra já usada em createInvite.
export async function canAddMember(
  supabase: Client,
  workspaceId: string,
  plan: string
): Promise<boolean> {
  if (plan !== "free") return true;

  const [{ count: memberCount }, { count: inviteCount }] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("invites")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString()),
  ]);

  return (memberCount ?? 0) + (inviteCount ?? 0) < FREE_PLAN_MEMBER_LIMIT;
}
