import type { Metadata } from "next";

import { WorkspaceSettingsForm } from "@/components/settings/workspace-settings-form";

export const metadata: Metadata = { title: "Workspace — PiperFlow" };

export default function SettingsWorkspacePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Nome e dados gerais do workspace atual.
        </p>
      </div>
      <WorkspaceSettingsForm />
    </div>
  );
}
