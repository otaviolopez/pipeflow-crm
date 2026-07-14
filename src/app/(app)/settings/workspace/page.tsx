import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WorkspaceSettingsForm } from "@/components/settings/workspace-settings-form";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Workspace — PiperFlow" };

export default async function SettingsWorkspacePage() {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          <span className="h-6 w-1 rounded-full bg-primary" aria-hidden />
          Workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Nome e dados gerais do workspace atual.
        </p>
      </div>
      <WorkspaceSettingsForm name={workspace.name} />
    </div>
  );
}
