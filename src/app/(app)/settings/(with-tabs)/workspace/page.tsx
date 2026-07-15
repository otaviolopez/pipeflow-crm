import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WorkspaceSettingsForm } from "@/components/settings/workspace-settings-form";
import {
  getActiveWorkspace,
  getCurrentUserRole,
  getUserWorkspaces,
} from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Workspace — PiperFlow" };

export default async function SettingsWorkspacePage() {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  const currentUserRole = await getCurrentUserRole(workspace.id);

  return <WorkspaceSettingsForm name={workspace.name} currentUserRole={currentUserRole} />;
}
