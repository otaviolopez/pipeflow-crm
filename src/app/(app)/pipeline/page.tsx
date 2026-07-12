import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { getLeadOptionsForWorkspace } from "@/lib/leads/queries";
import { getDealsForWorkspace } from "@/lib/pipeline/queries";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Pipeline — PiperFlow" };

export default async function PipelinePage() {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  const [deals, leadOptions] = await Promise.all([
    getDealsForWorkspace(workspace.id),
    getLeadOptionsForWorkspace(workspace.id),
  ]);

  return <PipelineBoard initialDeals={deals} leadOptions={leadOptions} />;
}
