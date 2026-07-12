import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export async function POST(request: Request) {
  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) {
    return NextResponse.json({ error: "Nenhum workspace ativo." }, { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  }

  const { data: workspaceRow } = await supabase
    .from("workspaces")
    .select("stripe_customer_id")
    .eq("id", workspace.id)
    .single();

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  // client_reference_id + subscription_data.metadata carregam o
  // workspace_id: o primeiro só existe no evento checkout.session.completed,
  // o segundo persiste na assinatura e por isso é o que os eventos
  // customer.subscription.updated/deleted (webhook) conseguem ler depois.
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    customer: workspaceRow?.stripe_customer_id ?? undefined,
    customer_email: workspaceRow?.stripe_customer_id ? undefined : (user.email ?? undefined),
    client_reference_id: workspace.id,
    subscription_data: { metadata: { workspace_id: workspace.id } },
    success_url: `${origin}/settings/billing?checkout=success`,
    cancel_url: `${origin}/settings/billing?checkout=cancelled`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Não foi possível iniciar o checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
