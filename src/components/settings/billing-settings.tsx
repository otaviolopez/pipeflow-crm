"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FREE_PLAN_LEAD_LIMIT } from "@/lib/leads/types";
import { FREE_PLAN_MEMBER_LIMIT, PRO_PLAN_PRICE_LABEL } from "@/lib/settings/types";
import type { Plan } from "@/lib/settings/types";

import { CancelSubscriptionDialog } from "./cancel-subscription-dialog";

// Uso mockado — vem das contagens reais de leads/membros só quando o
// dashboard (M14) e a equipe (M9) estiverem conectados ao Supabase.
const MOCK_USAGE = { members: 2, leads: 48 };

export function BillingSettings() {
  const [plan, setPlan] = React.useState<Plan>("free");
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);

  // "Se cancelar agora, o acesso Pro dura até esta data" — calculada uma
  // vez para o texto do diálogo de confirmação bater com o toast depois.
  const candidateExpiryDate = React.useMemo(() => addDays(new Date(), 30), []);
  const expiryLabel = format(candidateExpiryDate, "dd/MM/yyyy", { locale: ptBR });

  function handleUpgrade() {
    // Mock: em produção isso redireciona pro Stripe Checkout (M13).
    setPlan("pro");
    setCancelAtPeriodEnd(false);
    toast.success("🎉 Bem-vindo ao Pro! Limites removidos.");
  }

  function handleCancelConfirm() {
    setCancelAtPeriodEnd(true);
    setIsCancelOpen(false);
    toast.success(`Assinatura cancelada. Acesso Pro mantido até ${expiryLabel}.`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plano</h1>
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
              <UsageBar
                label="Colaboradores"
                used={MOCK_USAGE.members}
                limit={FREE_PLAN_MEMBER_LIMIT}
              />
              <UsageBar label="Leads" used={MOCK_USAGE.leads} limit={FREE_PLAN_LEAD_LIMIT} />
              <Button className="w-fit" onClick={handleUpgrade}>
                Fazer upgrade para Pro
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
                  Gerenciar assinatura
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CancelSubscriptionDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        expiresAtLabel={expiryLabel}
        onConfirm={handleCancelConfirm}
      />
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
