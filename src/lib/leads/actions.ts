"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { canAddLead } from "@/lib/limits";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

import { FREE_PLAN_LEAD_LIMIT } from "./types";
import type { ActivityType, LeadStatus } from "./types";

export async function createLead(input: {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  roleTitle: string | null;
}) {
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return { error: "O nome é obrigatório." };
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

  // Limite do plano Free re-checado no servidor (CLAUDE.md) — nunca confiar
  // só no banner exibido no frontend.
  if (!(await canAddLead(supabase, workspace.id, workspace.plan))) {
    return { error: `Limite de ${FREE_PLAN_LEAD_LIMIT} leads do plano Free atingido.` };
  }

  // Gera o id no servidor e insere sem RETURNING de propósito, mesmo não
  // havendo trigger em "leads" hoje — mesma precaução do createWorkspace
  // (M9) depois do bug de RLS+RETURNING encontrado ali.
  const leadId = randomUUID();
  const { error } = await supabase.from("leads").insert({
    id: leadId,
    workspace_id: workspace.id,
    name: trimmedName,
    email: input.email,
    phone: input.phone,
    company: input.company,
    role_title: input.roleTitle,
    owner_id: user.id,
  });

  if (error) {
    return { error: "Não foi possível criar o lead. Tente novamente." };
  }

  revalidatePath("/leads");
  return { leadId };
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = await createClient();

  const workspace = await getActiveWorkspace(await getUserWorkspaces());
  if (!workspace) {
    return { error: "Nenhum workspace ativo." };
  }

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("workspace_id", workspace.id)
    .eq("id", leadId);

  if (error) {
    return { error: "Não foi possível atualizar o status." };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return {};
}

export async function createActivity(input: {
  leadId: string;
  type: ActivityType;
  description: string;
}) {
  const trimmedDescription = input.description.trim();
  if (!trimmedDescription) {
    return { error: "Descreva o que aconteceu." };
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

  const { error } = await supabase.from("activities").insert({
    workspace_id: workspace.id,
    lead_id: input.leadId,
    type: input.type,
    description: trimmedDescription,
    author_id: user.id,
  });

  if (error) {
    return { error: "Não foi possível registrar a atividade." };
  }

  revalidatePath(`/leads/${input.leadId}`);
  return {};
}
