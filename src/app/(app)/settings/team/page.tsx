import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TeamSettings } from "@/components/settings/team-settings";
import { createClient } from "@/lib/supabase/server";
import { getPendingInvites, getWorkspaceMembers } from "@/lib/settings/queries";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Equipe — PiperFlow" };

export default async function SettingsTeamPage() {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [members, invites] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getPendingInvites(workspace.id),
  ]);

  return (
    <TeamSettings
      members={members}
      invites={invites}
      currentUserId={user?.id ?? ""}
      isFreePlan={workspace.plan === "free"}
    />
  );
}
