import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/leads/types";

const LABELS: Record<LeadStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {LABELS[status]}
    </Badge>
  );
}
