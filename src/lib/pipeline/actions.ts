"use server";

import { randomUUID } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

export async function createDeal(input: {
  title: string;
  value: number;
  leadId: string;
  dueDate: string | null;
}) {
  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) {
    return { error: "Informe um título para o negócio." };
  }
  if (!input.leadId) {
    return { error: "Selecione o lead vinculado." };
  }

  const supabase = await createClient();

  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) {
    return { error: "Nenhum workspace ativo." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  // Confere que o lead escolhido pertence de fato a este workspace — o
  // Select do formulário já só lista leads do workspace ativo, mas a Server
  // Action nunca confia só no que o cliente manda (CLAUDE.md).
  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("id", input.leadId)
    .maybeSingle();
  if (!lead) {
    return { error: "Lead inválido para este workspace." };
  }

  // Id gerado no servidor + insert sem RETURNING, mesmo padrão do
  // createWorkspace/createLead (evita depender de RLS+RETURNING no mesmo
  // statement — ver bug encontrado no M9).
  const dealId = randomUUID();
  const { error } = await supabase.from("deals").insert({
    id: dealId,
    workspace_id: workspace.id,
    lead_id: input.leadId,
    title: trimmedTitle,
    value: input.value,
    due_date: input.dueDate,
    owner_id: user.id,
    stage: "new_lead",
  });

  if (error) {
    return { error: "Não foi possível criar o negócio. Tente novamente." };
  }

  return { dealId };
}
