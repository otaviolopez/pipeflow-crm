import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mesma altura/estrutura do DealCardVisual (PRD, Seção 9.3 — estado CARREGANDO).
export function DealCardSkeleton() {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
      </CardContent>
    </Card>
  );
}
