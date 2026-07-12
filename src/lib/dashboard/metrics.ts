import { addDays, isWithinInterval, parseISO, startOfDay } from "date-fns";

import { STAGES } from "@/lib/pipeline/types";
import type { Deal, DealStage } from "@/lib/pipeline/types";
import type { Lead } from "@/lib/leads/types";

const OPEN_STAGES: DealStage[] = STAGES.filter(
  (stage) => stage.id !== "won" && stage.id !== "lost"
).map((stage) => stage.id);

export type FunnelStagePoint = {
  stage: DealStage;
  label: string;
  count: number;
};

export type DashboardMetrics = {
  totalLeads: number;
  openDealsCount: number;
  totalPipelineValue: number;
  conversionRate: number;
  funnelData: FunnelStagePoint[];
  upcomingDeals: Deal[];
};

export function computeDashboardMetrics(
  leads: Lead[],
  deals: Deal[],
  currentUserId: string
): DashboardMetrics {
  const openDeals = deals.filter((deal) => OPEN_STAGES.includes(deal.stage));
  const closedDeals = deals.filter(
    (deal) => deal.stage === "won" || deal.stage === "lost"
  );
  const wonDeals = deals.filter((deal) => deal.stage === "won");

  const totalPipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);
  const conversionRate =
    closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;

  const funnelData: FunnelStagePoint[] = STAGES.map((stage) => ({
    stage: stage.id,
    label: stage.label,
    count: deals.filter((deal) => deal.stage === stage.id).length,
  }));

  const today = startOfDay(new Date());
  const in7Days = addDays(today, 7);

  const upcomingDeals = openDeals
    .filter(
      (deal) =>
        deal.ownerId === currentUserId &&
        deal.dueDate &&
        isWithinInterval(parseISO(deal.dueDate), { start: today, end: in7Days })
    )
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  return {
    totalLeads: leads.length,
    openDealsCount: openDeals.length,
    totalPipelineValue,
    conversionRate,
    funnelData,
    upcomingDeals,
  };
}
