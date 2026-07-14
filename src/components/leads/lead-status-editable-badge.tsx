"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/leads/types";

import { LEAD_STATUS_LABELS } from "./lead-status-badge";

// !important: o SelectTrigger já traz `dark:bg-input/30` embutido, que teria
// prioridade sobre as classes de cor abaixo no modo escuro e deixaria o texto
// do badge ilegível — mesma progressão de cor do LeadStatusBadge.
const STATUS_CLASSNAME: Record<LeadStatus, string> = {
  new: "bg-secondary! text-secondary-foreground!",
  contacted: "bg-secondary! text-secondary-foreground!",
  waiting: "bg-warning/10! text-warning-foreground!",
  qualified: "bg-primary! text-primary-foreground!",
  disqualified: "bg-destructive/10! text-destructive!",
};

// Badge de status editável inline na página de detalhe do lead (PRD, Seção 9.3).
export function LeadStatusEditableBadge({
  status,
  onChange,
}: {
  status: LeadStatus;
  onChange: (status: LeadStatus) => void;
}) {
  return (
    <Select value={status} onValueChange={(value) => onChange(value as LeadStatus)}>
      <SelectTrigger
        size="sm"
        aria-label="Status do lead"
        className={cn(
          "h-6 rounded-full border-transparent px-2.5 text-xs font-medium",
          STATUS_CLASSNAME[status]
        )}
      >
        <SelectValue>{LEAD_STATUS_LABELS[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
