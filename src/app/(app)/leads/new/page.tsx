import type { Metadata } from "next";

import { NewLeadForm } from "@/components/leads/new-lead-form";

export const metadata: Metadata = { title: "Novo lead — PiperFlow" };

export default function Page() {
  return <NewLeadForm />;
}
