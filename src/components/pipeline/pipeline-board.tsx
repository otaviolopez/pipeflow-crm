"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MOCK_DEALS } from "@/lib/pipeline/mock-data";
import { STAGES } from "@/lib/pipeline/types";
import type { Deal, DealStage } from "@/lib/pipeline/types";

import { DealCardSkeleton } from "./deal-card-skeleton";
import { DealCardVisual } from "./deal-card-visual";
import { LostConfirmDialog } from "./lost-confirm-dialog";
import { NewDealDialog } from "./new-deal-dialog";
import { PipelineColumn } from "./pipeline-column";

// Simula a latência/instabilidade de uma persistência real (M11 conecta o
// endpoint de verdade). Mantém visível o estado de erro exigido pelo PRD
// (Seção 9.3) mesmo sem backend ainda.
const LOADING_DELAY_MS = 600;
const FAKE_LATENCY_MS = 450;
const FAILURE_RATE = 0.15;

export function PipelineBoard() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [deals, setDeals] = React.useState<Deal[]>(MOCK_DEALS);
  const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null);
  const [pendingLostMove, setPendingLostMove] = React.useState<{
    dealId: string;
    fromStage: DealStage;
  } | null>(null);
  const [isNewDealOpen, setIsNewDealOpen] = React.useState(false);
  const dragStartStageRef = React.useRef<DealStage | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function persistStageChange(dealId: string, fromStage: DealStage) {
    window.setTimeout(() => {
      if (Math.random() >= FAILURE_RATE) return;
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === dealId
            ? { ...deal, stage: fromStage, lostReason: undefined }
            : deal
        )
      );
      toast.error("Não foi possível mover o negócio. Tente novamente.");
    }, FAKE_LATENCY_MS);
  }

  // Caminho da alternativa acessível ("Mover para..." no menu do card).
  function moveDeal(deal: Deal, toStage: DealStage) {
    if (deal.stage === toStage) return;

    if (toStage === "lost") {
      setPendingLostMove({ dealId: deal.id, fromStage: deal.stage });
      setDeals((prev) =>
        prev.map((d) => (d.id === deal.id ? { ...d, stage: "lost" } : d))
      );
      return;
    }

    const fromStage = deal.stage;
    setDeals((prev) =>
      prev.map((d) => (d.id === deal.id ? { ...d, stage: toStage } : d))
    );
    persistStageChange(deal.id, fromStage);
  }

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id);
    dragStartStageRef.current = deal?.stage ?? null;
    setActiveDeal(deal ?? null);
  }

  // Move o card entre colunas visualmente enquanto o usuário arrasta —
  // padrão multi-container do @dnd-kit (só confirma/persiste no dragEnd).
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeDeal = deals.find((d) => d.id === active.id);
    if (!activeDeal) return;

    const overDeal = deals.find((d) => d.id === over.id);
    const overStage = (overDeal?.stage ?? over.id) as DealStage;

    if (activeDeal.stage !== overStage) {
      setDeals((prev) =>
        prev.map((d) => (d.id === active.id ? { ...d, stage: overStage } : d))
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const originalStage = dragStartStageRef.current;
    dragStartStageRef.current = null;
    const dealId = event.active.id as string;

    if (!event.over) {
      // Solto fora de qualquer coluna: desfaz o preview do dragOver.
      if (originalStage) {
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: originalStage } : d))
        );
      }
      return;
    }

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || !originalStage || deal.stage === originalStage) return;

    if (deal.stage === "lost") {
      setPendingLostMove({ dealId, fromStage: originalStage });
      return;
    }

    persistStageChange(dealId, originalStage);
  }

  function confirmLostMove(reason: string) {
    if (!pendingLostMove) return;
    const { dealId, fromStage } = pendingLostMove;
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: "lost", lostReason: reason || undefined } : d
      )
    );
    persistStageChange(dealId, fromStage);
    setPendingLostMove(null);
  }

  function cancelLostMove() {
    if (!pendingLostMove) return;
    const { dealId, fromStage } = pendingLostMove;
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: fromStage } : d))
    );
    setPendingLostMove(null);
  }

  function handleCreateDeal(input: {
    title: string;
    value: number;
    leadName: string;
    ownerName: string;
    dueDate: string | null;
  }) {
    const newDeal: Deal = { id: crypto.randomUUID(), stage: "new_lead", ...input };
    setDeals((prev) => [newDeal, ...prev]);
    // Negócio movido não tem toast (o movimento visual já é o feedback);
    // criação tem, com a microcopy exata do PRD (Seção 9.5).
    toast.success("Negócio adicionado ao pipeline.");
  }

  const dealsByStage = React.useMemo(() => {
    const map = new Map<DealStage, Deal[]>(STAGES.map((s) => [s.id, []]));
    for (const deal of deals) {
      map.get(deal.stage)?.push(deal);
    }
    return map;
  }, [deals]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline de Vendas</h1>
        <Button onClick={() => setIsNewDealOpen(true)} disabled={isLoading}>
          <Plus />
          Novo negócio
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className="flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-muted/40 p-2"
            >
              <span className="px-1 py-1.5 text-sm font-medium text-muted-foreground">
                {stage.label}
              </span>
              <DealCardSkeleton />
              <DealCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
            {STAGES.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stageId={stage.id}
                label={stage.label}
                deals={dealsByStage.get(stage.id) ?? []}
                onMoveTo={moveDeal}
              />
            ))}
          </div>
          <DragOverlay>
            {activeDeal ? (
              <DealCardVisual deal={activeDeal} onMoveTo={() => {}} interactive={false} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <LostConfirmDialog
        open={!!pendingLostMove}
        onConfirm={confirmLostMove}
        onCancel={cancelLostMove}
      />
      <NewDealDialog
        open={isNewDealOpen}
        onOpenChange={setIsNewDealOpen}
        onCreate={handleCreateDeal}
      />
    </div>
  );
}
