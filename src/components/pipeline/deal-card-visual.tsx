import { TriangleAlert } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrencyBRL, formatDueDate, isOverdue } from "@/lib/pipeline/format";
import type { Deal, DealStage } from "@/lib/pipeline/types";

import { DealCardMenu } from "./deal-card-menu";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Markup puro do card — usado tanto pela versão arrastável (DealCard) quanto
// pela cópia flutuante do DragOverlay, que não pode repetir o hook
// useSortable (geraria um segundo item arrastável com o mesmo id).
export function DealCardVisual({
  deal,
  onMoveTo,
  interactive = true,
}: {
  deal: Deal;
  onMoveTo: (deal: Deal, toStage: DealStage) => void;
  interactive?: boolean;
}) {
  const overdue = isOverdue(deal.dueDate, deal.stage);

  return (
    <Card size="sm" className="shadow-sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-1.5">
          <p className="text-sm leading-snug font-medium">{deal.title}</p>
          {interactive && <DealCardMenu deal={deal} onMoveTo={onMoveTo} />}
        </div>

        <Badge variant="secondary" className="w-fit">
          {formatCurrencyBRL(deal.value)}
        </Badge>

        <div className="flex items-center justify-between gap-2">
          <Avatar size="sm">
            <AvatarFallback>{initials(deal.ownerName)}</AvatarFallback>
          </Avatar>

          {deal.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                overdue ? "font-medium text-destructive" : "text-muted-foreground"
              )}
            >
              {overdue && <TriangleAlert className="size-3.5" />}
              {overdue ? "Vencido" : formatDueDate(deal.dueDate)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
