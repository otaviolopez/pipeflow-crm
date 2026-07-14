import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/leads/types";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  waiting: "Em espera",
  qualified: "Qualificado",
  disqualified: "Desqualificado",
};

// Progressão neutro -> quente -> positivo, com desqualificado em destructive
// (fim do funil) — reaproveita os tokens semânticos já existentes no design
// system (warning, primary, destructive) em vez de criar cores novas.
const STATUS_CLASSNAME: Record<LeadStatus, string> = {
  new: "border-border text-foreground",
  contacted: "border-border text-foreground",
  waiting: "border-transparent bg-warning/10 text-warning-foreground",
  qualified: "border-transparent bg-primary text-primary-foreground",
  disqualified: "border-transparent bg-destructive/10 text-destructive",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASSNAME[status])}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}
