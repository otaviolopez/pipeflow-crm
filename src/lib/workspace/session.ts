import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export const ACTIVE_WORKSPACE_COOKIE = "piperflow_active_workspace";

export type WorkspaceSummary = {
  id: string;
  name: string;
  plan: string;
};

// A policy "workspaces: select as member" (supabase/schema.sql) já restringe
// o resultado aos workspaces em que o usuário logado é membro — não precisa
// filtrar por workspace_id aqui.
export async function getUserWorkspaces(): Promise<WorkspaceSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, plan")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getActiveWorkspace(
  workspaces: WorkspaceSummary[]
): Promise<WorkspaceSummary | null> {
  if (workspaces.length === 0) return null;

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

  return (
    workspaces.find((workspace) => workspace.id === activeId) ?? workspaces[0]
  );
}

export type WorkspaceRole = "admin" | "member";

// Papel do usuário logado no workspace informado — hoje só usado pela UI
// pra esconder ações admin-only (Convidar/Remover membro, renomear
// workspace) de quem não pode executá-las; a autorização de verdade
// continua só na RLS (is_workspace_admin/is_workspace_member), nunca nesta
// função.
export async function getCurrentUserRole(
  workspaceId: string
): Promise<WorkspaceRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  return (data?.role as WorkspaceRole) ?? null;
}

export async function setActiveWorkspaceCookie(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
