import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart";
import { UpcomingDealsList } from "@/components/dashboard/upcoming-deals-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { computeDashboardMetrics } from "@/lib/dashboard/metrics";
import { getLeadsForWorkspace } from "@/lib/leads/queries";
import { formatCurrencyBRL } from "@/lib/pipeline/format";
import { getDealsForWorkspace } from "@/lib/pipeline/queries";
import { getProfilesByIds } from "@/lib/profiles/queries";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Dashboard — PiperFlow" };

// Server Component: os 4 KPIs, o funil e a lista de prazos são só leitura
// de dados reais (sem interatividade), então não precisam de "use client"
// — só o gráfico (Recharts) é uma ilha cliente à parte.
export default async function DashboardPage() {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) redirect("/onboarding");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [leads, deals, ownerNames] = await Promise.all([
    getLeadsForWorkspace(workspace.id),
    getDealsForWorkspace(workspace.id),
    getProfilesByIds([user.id]),
  ]);

  const currentUserName = ownerNames.get(user.id) ?? "Você";
  const metrics = computeDashboardMetrics(leads, deals, user.id);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total de leads" value={String(metrics.totalLeads)} />
        <KpiCard label="Negócios abertos" value={String(metrics.openDealsCount)} />
        <KpiCard
          label="Valor total do pipeline"
          value={formatCurrencyBRL(metrics.totalPipelineValue)}
        />
        <KpiCard
          label="Taxa de conversão"
          value={`${metrics.conversionRate.toFixed(0)}%`}
        />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Funil de vendas por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesFunnelChart data={metrics.funnelData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus negócios com prazo próximo</CardTitle>
            <CardDescription>{currentUserName} · próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingDealsList deals={metrics.upcomingDeals} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
