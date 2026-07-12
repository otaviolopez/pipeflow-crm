import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

const VALID_STAGES = [
  "new_lead",
  "contacted",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
] as const;

// Endpoint dedicado (em vez de reaproveitar uma Server Action genérica de
// update) porque o drag-and-drop do Kanban precisa do caminho mais curto
// possível: sem revalidar a árvore de Server Components a cada solto de
// card, já que o board já mantém e reconcilia o próprio estado otimista
// (PRD, Seção 12).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  const body = await request.json().catch(() => null);

  const stage = body?.stage;
  const lostReason = typeof body?.lostReason === "string" ? body.lostReason.trim() : "";

  if (typeof stage !== "string" || !VALID_STAGES.includes(stage as (typeof VALID_STAGES)[number])) {
    return NextResponse.json({ error: "Etapa inválida." }, { status: 400 });
  }

  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) {
    return NextResponse.json({ error: "Nenhum workspace ativo." }, { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("deals")
    .update({
      stage,
      lost_reason: stage === "lost" ? lostReason || null : null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspace.id)
    .eq("id", dealId);

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível mover o negócio. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
