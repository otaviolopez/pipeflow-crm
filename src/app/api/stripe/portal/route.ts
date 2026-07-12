import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

// Usado só para ver faturas / atualizar forma de pagamento — o cancelamento
// de assinatura tem seu próprio fluxo (cancelSubscription, com o diálogo de
// confirmação customizado do PRD), para não duplicar essa decisão de UX
// entre nossa tela e o Customer Portal hospedado pelo Stripe.
export async function POST(request: Request) {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) {
    return NextResponse.json({ error: "Nenhum workspace ativo." }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: workspaceRow } = await supabase
    .from("workspaces")
    .select("stripe_customer_id")
    .eq("id", workspace.id)
    .single();

  if (!workspaceRow?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Este workspace ainda não tem uma assinatura." },
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const session = await stripe.billingPortal.sessions.create({
    customer: workspaceRow.stripe_customer_id,
    return_url: `${origin}/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
