import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { InviteAcceptForm } from "@/components/invite-accept-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Aceitar convite — PiperFlow" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Página pública (sem sessão): a policy de RLS de `invites` só permite
  // leitura para admin do workspace, então a busca do convite pelo token
  // precisa do service role (server-only, nunca exposto ao client —
  // CLAUDE.md) em vez do client autenticado normal.
  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("invites")
    .select("workspace_id, role, invited_by, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  const isInvalid =
    !invite ||
    invite.accepted_at !== null ||
    new Date(invite.expires_at) <= new Date();

  if (isInvalid) {
    return (
      <AuthShell
        title="Convite inválido"
        description="Este link não existe, já foi usado ou expirou. Peça para o administrador do workspace enviar um novo convite."
      >
        <Link
          href="/login"
          className="text-sm font-medium text-foreground underline underline-offset-4"
        >
          Ir para o login
        </Link>
      </AuthShell>
    );
  }

  const [{ data: workspace }, { data: inviter }] = await Promise.all([
    admin
      .from("workspaces")
      .select("name")
      .eq("id", invite.workspace_id)
      .single(),
    admin.auth.admin.getUserById(invite.invited_by),
  ]);

  const invitedByEmail = inviter?.user?.email ?? "um administrador";

  return (
    <AuthShell
      title="Você foi convidado"
      description={`${invitedByEmail} te convidou para colaborar no workspace "${workspace?.name}".`}
    >
      <InviteAcceptForm token={token} role={invite.role as "admin" | "member"} />
    </AuthShell>
  );
}
