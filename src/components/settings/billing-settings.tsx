"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FREE_PLAN_LEAD_LIMIT } from "@/lib/leads/types";
import { cancelSubscription } from "@/lib/settings/actions";
import type { SubscriptionStatus } from "@/lib/settings/queries";
import { FREE_PLAN_MEMBER_LIMIT, PRO_PLAN_PRICE_LABEL } from "@/lib/settings/types";
import type { Plan } from "@/lib/settings/types";

import { CancelSubscriptionDialog } from "./cancel-subscription-dialog";

export function BillingSettings({
  plan,
  membersUsed,
  leadsUsed,
  subscriptionStatus,
}: {
  plan: Plan;
  membersUsed: number;
  leadsUsed: number;
  subscriptionStatus: SubscriptionStatus | null;
}) {
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  // Espelha o cancel_at_period_end real do Stripe; atualizado localmente só
  // pra feedback imediato depois de confirmar — a fonte de verdade volta a
  // ser o servidor no próximo carregamento da página.
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = React.useState(
    subscriptionStatus?.cancelAtPeriodEnd ?? false
  );

  const expiryLabel = subscriptionStatus
    ? format(new Date(subscriptionStatus.currentPeriodEnd), "dd/MM/yyyy", { locale: ptBR })
    : null;

  async function redirectTo(path: "checkout" | "portal") {
    setIsRedirecting(true);
    try {
      const response = await fetch(`/api/stripe/${path}`, { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Não foi possível continuar. Tente novamente.");
        setIsRedirecting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Não foi possível continuar. Tente novamente.");
      setIsRedirecting(false);
    }
  }

  function handleCancelConfirm() {
    setIsCancelling(true);
    (async () => {
      const result = await cancelSubscription();
      setIsCancelling(false);
      setIsCancelOpen(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setCancelAtPeriodEnd(true);
      const label = result.expiresAt
        ? format(new Date(result.expiresAt), "dd/MM/yyyy", { locale: ptBR })
        : "o fim do período atual";
      toast.success(`Assinatura cancelada. Acesso Pro mantido até ${label}.`);
    })();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          <span className="h-6 w-1 rounded-full bg-primary" aria-hidden />
          Plano
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie a assinatura deste workspace.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            Plano {plan === "pro" ? "Pro" : "Free"}
            <Badge variant={plan === "pro" ? "default" : "secondary"}>
              {plan === "pro" ? PRO_PLAN_PRICE_LABEL : "R$ 0/mês"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {plan === "free" ? (
            <>
              <UsageBar label="Colaboradores" used={membersUsed} limit={FREE_PLAN_MEMBER_LIMIT} />
              <UsageBar label="Leads" used={leadsUsed} limit={FREE_PLAN_LEAD_LIMIT} />
              <Button className="w-fit" disabled={isRedirecting} onClick={() => redirectTo("checkout")}>
                {isRedirecting ? "Redirecionando..." : "Fazer upgrade para Pro"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Colaboradores ilimitados · Leads ilimitados
              </p>
              {cancelAtPeriodEnd ? (
                <p className="text-sm text-muted-foreground">
                  Cancelamento agendado — acesso Pro até {expiryLabel}.
                </p>
              ) : (
                <Button
                  variant="outline"
                  className="w-fit"
                  onClick={() => setIsCancelOpen(true)}
                >
                  Cancelar assinatura
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-fit"
                disabled={isRedirecting}
                onClick={() => redirectTo("portal")}
              >
                {isRedirecting ? "Redirecionando..." : "Ver faturas e forma de pagamento"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {plan === "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Free vs. Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanComparisonTable />
          </CardContent>
        </Card>
      )}

      <CancelSubscriptionDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        expiresAtLabel={expiryLabel ?? "o fim do período atual"}
        onConfirm={handleCancelConfirm}
        isPending={isCancelling}
      />
    </div>
  );
}

const COMPARISON_ROWS: { label: string; free: string; pro: string }[] = [
  { label: "Colaboradores", free: `Até ${FREE_PLAN_MEMBER_LIMIT}`, pro: "Ilimitados" },
  { label: "Leads", free: `Até ${FREE_PLAN_LEAD_LIMIT}`, pro: "Ilimitados" },
  { label: "Preço", free: "R$ 0/mês", pro: PRO_PLAN_PRICE_LABEL },
];

function PlanComparisonTable() {
  return (
    <div className="grid grid-cols-3 gap-y-3 text-sm">
      <span className="text-muted-foreground" />
      <span className="font-medium">Free</span>
      <span className="font-medium">Pro</span>
      {COMPARISON_ROWS.map((row) => (
        <React.Fragment key={row.label}>
          <span className="text-muted-foreground">{row.label}</span>
          <span>{row.free}</span>
          <span className="flex items-center gap-1.5">
            <Check className="size-4 shrink-0 text-primary" aria-hidden />
            {row.pro}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
