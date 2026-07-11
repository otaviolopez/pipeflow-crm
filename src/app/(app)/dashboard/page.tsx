import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Dashboard — PiperFlow" };

export default function DashboardPage() {
  return <PagePlaceholder title="Dashboard" milestone="M6" />;
}
