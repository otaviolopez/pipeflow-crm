import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Pipeline — PiperFlow" };

export default function PipelinePage() {
  return <PagePlaceholder title="Pipeline" milestone="M4" />;
}
