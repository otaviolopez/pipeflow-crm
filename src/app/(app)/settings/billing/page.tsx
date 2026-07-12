import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BillingSettings } from "@/components/settings/billing-settings";
import { getLeadsCountForWorkspace } from "@/lib/leads/queries";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatus, getWorkspaceMembers } from "@/lib/settings/queries";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Plano — PiperFlow" };

export default async function SettingsBillingPage() {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  const supabase = await createClient();
  const { data: workspaceRow } = await supabase
    .from("workspaces")
    .select("stripe_subscription_id")
    .eq("id", workspace.id)
    .single();

  const [members, leadsUsed, subscriptionStatus] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getLeadsCountForWorkspace(workspace.id),
    workspaceRow?.stripe_subscription_id
      ? getSubscriptionStatus(workspaceRow.stripe_subscription_id)
      : Promise.resolve(null),
  ]);

  return (
    <BillingSettings
      plan={workspace.plan === "pro" ? "pro" : "free"}
      membersUsed={members.length}
      leadsUsed={leadsUsed}
      subscriptionStatus={subscriptionStatus}
    />
  );
}
