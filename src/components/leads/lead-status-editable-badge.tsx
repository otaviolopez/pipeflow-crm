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

const LABELS: Record<LeadStatus, string> = { active: "Ativo", inactive: "Inativo" };

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
          // !important: o SelectTrigger já traz `dark:bg-input/30` embutido,
          // que teria prioridade sobre bg-primary/bg-secondary no modo
          // escuro e deixaria o texto do badge ilegível.
          status === "active"
            ? "bg-primary! text-primary-foreground!"
            : "bg-secondary! text-secondary-foreground!"
        )}
      >
        <SelectValue>{LABELS[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="active">Ativo</SelectItem>
        <SelectItem value="inactive">Inativo</SelectItem>
      </SelectContent>
    </Select>
  );
}
