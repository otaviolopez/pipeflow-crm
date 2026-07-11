import type { Metadata } from "next";

import { LeadDetailView } from "@/components/leads/lead-detail-view";

export const metadata: Metadata = { title: "Detalhe do lead — PiperFlow" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetailView key={id} leadId={id} />;
}
