import type { Metadata } from "next";

import { BillingSettings } from "@/components/settings/billing-settings";

export const metadata: Metadata = { title: "Plano — PiperFlow" };

export default function SettingsBillingPage() {
  return <BillingSettings />;
}
