"use client";

import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";
import type { Deal, DealStage } from "@/lib/pipeline/types";

import { DealCardVisual } from "./deal-card-visual";

export function DealCard({
  deal,
  onMoveTo,
}: {
  deal: Deal;
  onMoveTo: (deal: Deal, toStage: DealStage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // touch-none evita conflito entre o gesto de arrastar e o scroll da
      // coluna em telas touch (recomendação do @dnd-kit).
      className={cn(
        "touch-none cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <DealCardVisual deal={deal} onMoveTo={onMoveTo} />
    </div>
  );
}
