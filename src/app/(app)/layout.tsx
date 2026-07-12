import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

// Route group (app): agrupa /pipeline, /leads, /dashboard e /settings/* sob o
// mesmo shell (sidebar + topbar) sem afetar as URLs. A proteção de sessão
// dessas rotas acontece no proxy.ts (middleware), nunca no cliente (CLAUDE.md).
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  const userEmail = typeof email === "string" ? email : "usuário";

  const workspaces = await getUserWorkspaces();

  // Usuário autenticado sem nenhum workspace (ex.: acabou de confirmar o
  // e-mail do signup) precisa passar pelo onboarding antes de ver o app.
  if (workspaces.length === 0) {
    redirect("/onboarding");
  }

  const activeWorkspace = await getActiveWorkspace(workspaces);

  return (
    <AppShell
      userEmail={userEmail}
      workspaces={workspaces}
      activeWorkspaceId={activeWorkspace!.id}
    >
      {children}
    </AppShell>
  );
}
