import { createClient } from "@/lib/supabase/server";

import type { Invite, Member, MemberRole } from "./types";

export async function getWorkspaceMembers(workspaceId: string): Promise<Member[]> {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("id, user_id, role")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  const rows = memberships ?? [];
  const userIds = rows.map((row) => row.user_id);
  if (userIds.length === 0) return [];

  // workspace_members não tem FK direta para profiles (ambas apontam para
  // auth.users), então o join precisa ser feito em duas consultas — mesmo
  // padrão do getProfilesByIds (M10), mas aqui também precisamos do e-mail.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", userIds);

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return rows.map((row) => {
    const profile = profileById.get(row.user_id);
    return {
      id: row.id,
      userId: row.user_id,
      name: profile?.name ?? "—",
      email: profile?.email ?? "—",
      role: row.role as MemberRole,
    };
  });
}

export async function getPendingInvites(workspaceId: string): Promise<Invite[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invites")
    .select("id, email, role, created_at")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role as MemberRole,
    createdAt: row.created_at,
  }));
}
