"use client";

import * as React from "react";
import Link from "next/link";
import { FileQuestion, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/pipeline/format";
import { MOCK_DEALS } from "@/lib/pipeline/mock-data";
import { STAGES } from "@/lib/pipeline/types";
import {
  addActivity,
  getActivitiesForLead,
  getLeadById,
  updateLeadStatus,
} from "@/lib/leads/store";
import type { ActivityType, Lead } from "@/lib/leads/types";

import { ActivityTimeline } from "./activity-timeline";
import { LeadStatusEditableBadge } from "./lead-status-editable-badge";
import { RegisterActivitySheet } from "./register-activity-sheet";

export function LeadDetailView({ leadId }: { leadId: string }) {
  // O componente remonta a cada troca de lead (key={leadId} em page.tsx),
  // então o estado inicial já nasce correto sem precisar de um useEffect de
  // sincronização (react.dev/learn/you-might-not-need-an-effect).
  const [lead, setLead] = React.useState<Lead | null>(() => getLeadById(leadId) ?? null);
  const [activities, setActivities] = React.useState(() => getActivitiesForLead(leadId));
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  function handleStatusChange(status: Lead["status"]) {
    if (!lead) return;
    updateLeadStatus(lead.id, status);
    setLead({ ...lead, status });
    toast.success("Status atualizado.");
  }

  function handleRegisterActivity(input: { type: ActivityType; description: string }) {
    const activity = addActivity({
      leadId,
      type: input.type,
      description: input.description,
      // Mock: em produção vem da sessão autenticada (Supabase Auth).
      authorName: "Você",
    });
    setActivities((prev) => [activity, ...prev]);
    return activity;
  }

  // Estado de erro 404 — lead não existe ou não pertence ao workspace ativo
  // (PRD, Seção 9.3).
  if (lead === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <FileQuestion className="size-10 text-muted-foreground" />
        <p className="text-lg font-medium">Lead não encontrado.</p>
        <Button render={<Link href="/leads" />}>Voltar para leads</Button>
      </div>
    );
  }

  const linkedDeals = MOCK_DEALS.filter((deal) => deal.leadName === lead.company);
  const subtitle = [lead.roleTitle, lead.company].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
            <LeadStatusEditableBadge status={lead.status} onChange={handleStatusChange} />
          </div>
          <p className="text-sm text-muted-foreground">
            {subtitle || "Sem empresa ou cargo cadastrado"}
          </p>
        </div>

        <Button onClick={() => setIsSheetOpen(true)}>
          <MessageSquarePlus />
          Registrar atividade
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Timeline de atividades</h2>
          <ActivityTimeline activities={activities} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Negócios vinculados</h2>
          {linkedDeals.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Nenhum negócio vinculado a este lead ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {linkedDeals.map((deal) => {
                const stageLabel = STAGES.find((stage) => stage.id === deal.stage)?.label;
                return (
                  <Card key={deal.id} size="sm">
                    <CardHeader>
                      <CardTitle className="text-sm">{deal.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-2">
                      <Badge variant="secondary">{formatCurrencyBRL(deal.value)}</Badge>
                      <span className="text-xs text-muted-foreground">{stageLabel}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <RegisterActivitySheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onRegister={handleRegisterActivity}
      />
    </div>
  );
}
