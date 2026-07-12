import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LeadsPage } from "@/components/leads/leads-page";
import { getLeadsForWorkspace } from "@/lib/leads/queries";
import { getWorkspaceMemberProfiles } from "@/lib/profiles/queries";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Leads — PiperFlow" };

export default async function Page() {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  const [leads, members] = await Promise.all([
    getLeadsForWorkspace(workspace.id),
    getWorkspaceMemberProfiles(workspace.id),
  ]);

  return (
    <LeadsPage
      leads={leads}
      owners={members.map((member) => member.name)}
      isFreePlan={workspace.plan === "free"}
    />
  );
}
