"use client";

import { MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STAGES } from "@/lib/pipeline/types";
import type { Deal, DealStage } from "@/lib/pipeline/types";

// Alternativa acessível por teclado/menu ao drag-and-drop — requisito mínimo
// de acessibilidade do @dnd-kit (PRD, Seção 9.6).
export function DealCardMenu({
  deal,
  onMoveTo,
}: {
  deal: Deal;
  onMoveTo: (deal: Deal, toStage: DealStage) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Mais ações para ${deal.title}`}
            // Impede que o pointerdown do menu seja capturado pelo sensor de
            // drag do card pai (os dois ficam no mesmo elemento arrastável).
            onPointerDown={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Base UI exige GroupLabel dentro de Menu.Group */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Mover para...</DropdownMenuLabel>
        </DropdownMenuGroup>
        {STAGES.filter((stage) => stage.id !== deal.stage).map((stage) => (
          <DropdownMenuItem
            key={stage.id}
            onClick={() => onMoveTo(deal, stage.id)}
          >
            {stage.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
