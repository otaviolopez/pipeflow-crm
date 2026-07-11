import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

// Route group (app): agrupa /pipeline, /leads, /dashboard e /settings/* sob o
// mesmo shell (sidebar + topbar) sem afetar as URLs. A proteção de sessão
// dessas rotas acontece no middleware.ts, nunca no cliente (CLAUDE.md).
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  const userEmail = typeof email === "string" ? email : "usuário";

  return <AppShell userEmail={userEmail}>{children}</AppShell>;
}
