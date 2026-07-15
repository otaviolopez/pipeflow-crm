import { redirect } from "next/navigation";

import { SettingsTabs } from "@/components/settings/settings-tabs";
import {
  getActiveWorkspace,
  getCurrentUserRole,
  getUserWorkspaces,
} from "@/lib/workspace/session";

// Route group só para as 3 telas administrativas (Workspace/Membros/
// Assinatura) — Perfil fica fora dele (settings/profile), porque não é uma
// das abas: é acessado pelo dropdown do avatar, não pela navegação de
// workspace. A navegação entre as 3 abas mudou de submenu na sidebar para
// abas aqui dentro (pedido do usuário); cada aba continua sendo sua própria
// rota (F5 preserva a aba ativa, cada uma é linkável direto).
export default async function SettingsTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  const currentUserRole = await getCurrentUserRole(workspace.id);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          <span className="h-6 w-1 rounded-full bg-primary" aria-hidden />
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie o workspace e os membros da equipe.
        </p>
      </div>
      <SettingsTabs currentUserRole={currentUserRole} />
      {children}
    </div>
  );
}
