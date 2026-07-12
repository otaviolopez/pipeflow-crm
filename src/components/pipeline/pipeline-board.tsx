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
import { createDeal } from "@/lib/pipeline/actions";
import { STAGES } from "@/lib/pipeline/types";
import type { Deal, DealStage } from "@/lib/pipeline/types";

import { DealCardSkeleton } from "./deal-card-skeleton";
import { DealCardVisual } from "./deal-card-visual";
import { HorizontalScrollFade } from "./horizontal-scroll-fade";
import { LostConfirmDialog } from "./lost-confirm-dialog";
import { NewDealDialog } from "./new-deal-dialog";
import { PipelineColumn } from "./pipeline-column";

// Skeleton de montagem — puramente cosmético (os dados já chegam prontos via
// Server Component), não representa uma busca real.
const LOADING_DELAY_MS = 600;

export function PipelineBoard({
  initialDeals,
  leadOptions,
  currentUserId,
}: {
  initialDeals: Deal[];
  leadOptions: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [deals, setDeals] = React.useState<Deal[]>(initialDeals);
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

  async function persistStageChange(
    dealId: string,
    fromStage: DealStage,
    toStage: DealStage,
    lostReason?: string
  ) {
    try {
      const response = await fetch(`/api/deals/${dealId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: toStage, lostReason }),
      });
      if (!response.ok) throw new Error("PATCH falhou");
    } catch {
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === dealId
            ? { ...deal, stage: fromStage, lostReason: undefined }
            : deal
        )
      );
      toast.error("Não foi possível mover o negócio. Tente novamente.");
    }
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
    void persistStageChange(deal.id, fromStage, toStage);
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

    void persistStageChange(dealId, originalStage, deal.stage);
  }

  function confirmLostMove(reason: string) {
    if (!pendingLostMove) return;
    const { dealId, fromStage } = pendingLostMove;
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: "lost", lostReason: reason || undefined } : d
      )
    );
    void persistStageChange(dealId, fromStage, "lost", reason);
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

  async function handleCreateDeal(input: {
    title: string;
    value: number;
    leadId: string;
    dueDate: string | null;
  }) {
    const result = await createDeal(input);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const leadName = leadOptions.find((lead) => lead.id === input.leadId)?.name ?? "—";
    const newDeal: Deal = {
      id: result.dealId!,
      stage: "new_lead",
      title: input.title,
      ownerId: currentUserId,
      value: input.value,
      leadId: input.leadId,
      leadName,
      // O dono é sempre quem cria (mesma regra do createLead, M10); uma
      // recarga da página resolve o nome real via profiles.
      ownerName: "Você",
      dueDate: input.dueDate,
    };
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
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline de Vendas</h1>
      </div>

      {/* fixed (não sticky/relative): fica ancorado no canto superior
          direito da tela o tempo todo, mesmo se a página ganhar scroll
          vertical — não faz parte do fluxo normal do header. top-20 (abaixo
          da topbar de 56px + folga) evita sobrepor o dropdown de
          avatar/tema que já vive lá. */}
      <Button
        onClick={() => setIsNewDealOpen(true)}
        disabled={isLoading}
        className="fixed top-20 right-6 z-40 shadow-lg"
      >
        <Plus />
        Novo negócio
      </Button>

      {isLoading ? (
        <HorizontalScrollFade>
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className="flex w-72 shrink-0 snap-start flex-col gap-2 rounded-xl bg-muted/40 p-2"
            >
              <span className="px-1 py-1.5 text-sm font-medium text-muted-foreground">
                {stage.label}
              </span>
              <DealCardSkeleton />
              <DealCardSkeleton />
            </div>
          ))}
        </HorizontalScrollFade>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <HorizontalScrollFade>
            {STAGES.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stageId={stage.id}
                label={stage.label}
                deals={dealsByStage.get(stage.id) ?? []}
                onMoveTo={moveDeal}
              />
            ))}
          </HorizontalScrollFade>
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
        leadOptions={leadOptions}
      />
    </div>
  );
}
