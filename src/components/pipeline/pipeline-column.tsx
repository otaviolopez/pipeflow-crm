"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Deal, DealStage } from "@/lib/pipeline/types";

import { DealCard } from "./deal-card";

export function PipelineColumn({
  stageId,
  label,
  deals,
  onMoveTo,
}: {
  stageId: DealStage;
  label: string;
  deals: Deal[];
  onMoveTo: (deal: Deal, toStage: DealStage) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/40">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h2 className="text-sm font-medium">{label}</h2>
        <span className="text-xs text-muted-foreground">{deals.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-2 pt-0 transition-colors",
          isOver && "bg-primary/5"
        )}
      >
        <SortableContext
          items={deals.map((deal) => deal.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.length === 0 ? (
            // Estado vazio (PRD, Seção 9.3) — cobre tanto uma coluna
            // isolada quanto o workspace novo, quando as 6 colunas
            // renderizam esta mesma mensagem ao mesmo tempo.
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed p-4 text-center">
              <Inbox className="size-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Nenhum negócio aqui ainda.
              </p>
            </div>
          ) : (
            deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onMoveTo={onMoveTo} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
