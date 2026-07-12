"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace, getUserWorkspaces } from "@/lib/workspace/session";

import { FREE_PLAN_MEMBER_LIMIT, ROLE_LABELS } from "./types";
import type { MemberRole } from "./types";

const INVITE_EXPIRES_DAYS = 7;
// Trava contra rajada de convites (nunca implementada antes neste projeto):
// sem isso, um clique duplicado ou um bug de loop na UI poderia disparar
// dezenas de e-mails reais via Resend em segundos.
const MAX_INVITES_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MINUTES = 10;

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function createInvite(input: { email: string; role: MemberRole }) {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { error: "Informe um e-mail." };
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

  // Limite do Free conta membros atuais + convites pendentes (um convite
  // aceito vira membro) — o aceite (accept_invite, RPC) reconfirma esse
  // mesmo limite de novo, para o caso do workspace ganhar membros enquanto
  // o convite ainda está pendente (CLAUDE.md: limite sempre no servidor).
  if (workspace.plan === "free") {
    const [{ count: memberCount }, { count: inviteCount }] = await Promise.all([
      supabase
        .from("workspace_members")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id),
      supabase
        .from("invites")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString()),
    ]);

    if ((memberCount ?? 0) + (inviteCount ?? 0) >= FREE_PLAN_MEMBER_LIMIT) {
      return {
        error: `Limite de ${FREE_PLAN_MEMBER_LIMIT} colaboradores do plano Free atingido.`,
      };
    }
  }

  const { count: duplicateCount } = await supabase
    .from("invites")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id)
    .eq("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());
  if ((duplicateCount ?? 0) > 0) {
    return { error: "Já existe um convite pendente para este e-mail." };
  }

  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();
  const { count: recentCount } = await supabase
    .from("invites")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id)
    .gte("created_at", windowStart);
  if ((recentCount ?? 0) >= MAX_INVITES_PER_WINDOW) {
    return {
      error: "Muitos convites enviados recentemente. Aguarde alguns minutos e tente de novo.",
    };
  }

  const token = randomUUID();
  const expiresAt = new Date(
    Date.now() + INVITE_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error: insertError } = await supabase.from("invites").insert({
    workspace_id: workspace.id,
    email,
    role: input.role,
    token,
    invited_by: user.id,
    expires_at: expiresAt,
  });
  if (insertError) {
    return { error: "Não foi possível criar o convite. Verifique se você é admin do workspace." };
  }

  const inviteUrl = `${await getOrigin()}/invite/${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      // onboarding@resend.dev é o remetente de teste do Resend — funciona
      // sem verificar domínio, mas em contas sem domínio verificado só
      // entrega para o e-mail dono da própria conta Resend.
      from: "PiperFlow <onboarding@resend.dev>",
      to: [email],
      subject: `Você foi convidado para o workspace "${workspace.name}" no PiperFlow`,
      html: `
        <p>Você foi convidado para colaborar no workspace <strong>${workspace.name}</strong> como <strong>${ROLE_LABELS[input.role]}</strong>.</p>
        <p><a href="${inviteUrl}">Aceitar convite</a></p>
        <p>Este link expira em ${INVITE_EXPIRES_DAYS} dias.</p>
      `,
    });
  } catch {
    // O convite já está salvo no banco mesmo se o e-mail falhar — não
    // desfazemos o convite por isso, o admin pode reenviar depois.
    return { error: "Convite criado, mas o e-mail não pôde ser enviado. Tente reenviar depois." };
  }

  revalidatePath("/settings/team");
  return {};
}

export async function removeMember(memberId: string) {
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

  const { data: target } = await supabase
    .from("workspace_members")
    .select("id, user_id, role")
    .eq("workspace_id", workspace.id)
    .eq("id", memberId)
    .maybeSingle();
  if (!target) {
    return { error: "Membro não encontrado." };
  }

  if (target.user_id === user.id) {
    return { error: "Você não pode remover a si mesmo." };
  }

  if (target.role === "admin") {
    const { count: adminCount } = await supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .eq("role", "admin");
    if ((adminCount ?? 0) <= 1) {
      return { error: "Não é possível remover o único admin do workspace." };
    }
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", memberId);
  if (error) {
    return { error: "Não foi possível remover o membro." };
  }

  revalidatePath("/settings/team");
  return {};
}
