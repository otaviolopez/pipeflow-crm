import { CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyBRL, formatDueDate } from "@/lib/pipeline/format";
import type { Deal } from "@/lib/pipeline/types";

export function UpcomingDealsList({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
        <CalendarClock className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum negócio com prazo nos próximos 7 dias.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {deals.map((deal) => (
        <li key={deal.id}>
          <Card size="sm">
            <CardContent className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{deal.title}</span>
                <span className="text-xs text-muted-foreground">{deal.leadName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{formatCurrencyBRL(deal.value)}</Badge>
                {deal.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    {formatDueDate(deal.dueDate)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
