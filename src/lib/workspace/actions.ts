"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { setActiveWorkspaceCookie } from "@/lib/workspace/session";

export async function createWorkspace(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Informe um nome para o workspace." };
  }

  const supabase = await createClient();

  // Gera o id no servidor e insere sem RETURNING de propósito: pedir a linha
  // de volta no mesmo INSERT (".select()") faz o Postgres reavaliar a
  // policy de SELECT ("workspaces: select as member") antes de o trigger
  // on_workspace_created (que cria a associação de admin) ficar visível
  // para essa checagem — e o INSERT inteiro falha com 42501 mesmo a policy
  // estando correta. Já sabendo o id de antemão, não precisamos de RETURNING.
  const workspaceId = randomUUID();
  const { error } = await supabase
    .from("workspaces")
    .insert({ id: workspaceId, name: trimmed });

  if (error) {
    return { error: "Não foi possível criar o workspace. Tente novamente." };
  }

  await setActiveWorkspaceCookie(workspaceId);
  revalidatePath("/", "layout");

  return { workspaceId };
}

export async function switchWorkspace(workspaceId: string) {
  const supabase = await createClient();

  // RLS ("workspaces: select as member") só retorna a linha se o usuário
  // logado de fato pertence a este workspace — ignora silenciosamente
  // qualquer id que não seja dele.
  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!data) return;

  await setActiveWorkspaceCookie(data.id);
  revalidatePath("/", "layout");
}
