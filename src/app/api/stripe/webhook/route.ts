import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";

function resolveWorkspaceIdFromSubscription(subscription: Stripe.Subscription): string | null {
  return subscription.metadata?.workspace_id ?? null;
}

export async function POST(request: Request) {
  // stripe.webhooks.constructEvent precisa do corpo bruto (raw), sem
  // request.json() — verificação de assinatura obrigatória (CLAUDE.md).
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotência (CLAUDE.md): tenta gravar o event.id antes de aplicar
  // qualquer efeito colateral. "23505" = unique_violation, ou seja, este
  // evento já foi processado antes — responde 200 sem reprocessar. Qualquer
  // outro erro aqui é tratado como falha real (Stripe tenta reenviar).
  const { error: dedupeError } = await admin
    .from("stripe_webhook_events")
    .insert({ id: event.id });
  if (dedupeError) {
    if (dedupeError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: "Erro ao registrar evento." }, { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.client_reference_id ?? session.metadata?.workspace_id;
      if (workspaceId) {
        await admin
          .from("workspaces")
          .update({
            plan: "pro",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", workspaceId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const workspaceId = resolveWorkspaceIdFromSubscription(subscription);
      const isActive = subscription.status === "active" || subscription.status === "trialing";

      const update = admin.from("workspaces").update({ plan: isActive ? "pro" : "free" });
      if (workspaceId) {
        await update.eq("id", workspaceId);
      } else {
        // Metadata ausente (ex.: assinatura editada direto no Dashboard) —
        // localiza pelo id da assinatura como plano B.
        await update.eq("stripe_subscription_id", subscription.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const workspaceId = resolveWorkspaceIdFromSubscription(subscription);

      const update = admin
        .from("workspaces")
        .update({ plan: "free", stripe_subscription_id: null });
      if (workspaceId) {
        await update.eq("id", workspaceId);
      } else {
        await update.eq("stripe_subscription_id", subscription.id);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
