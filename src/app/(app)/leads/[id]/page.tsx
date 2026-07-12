import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LeadDetailView } from "@/components/leads/lead-detail-view";
import { getActivitiesForLead, getLeadById } from "@/lib/leads/queries";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Detalhe do lead — PiperFlow" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  const [lead, activities] = await Promise.all([
    getLeadById(workspace.id, id),
    getActivitiesForLead(workspace.id, id),
  ]);

  return <LeadDetailView key={id} leadId={id} initialLead={lead} initialActivities={activities} />;
}
