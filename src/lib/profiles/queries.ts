import { createClient } from "@/lib/supabase/server";

export type ProfileSummary = { id: string; name: string };

// profiles não tem FK direta com leads/activities/workspace_members (todas
// apontam para auth.users, não entre si), então o PostgREST não consegue
// embutir esse join automaticamente — resolvemos em duas consultas e
// juntamos aqui.
export async function getProfilesByIds(ids: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, name").in("id", uniqueIds);

  return new Map((data ?? []).map((profile) => [profile.id, profile.name]));
}

export async function getWorkspaceMemberProfiles(
  workspaceId: string
): Promise<ProfileSummary[]> {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId);

  const ids = (members ?? []).map((member) => member.user_id);
  const names = await getProfilesByIds(ids);

  return ids.map((id) => ({ id, name: names.get(id) ?? "—" }));
}
