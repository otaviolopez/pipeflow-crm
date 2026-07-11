import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";
import { InviteAcceptForm } from "@/components/invite-accept-form";

export const metadata: Metadata = { title: "Aceitar convite — PiperFlow" };

// Mock: a busca real do convite (workspace, papel, validade) na tabela
// `invites` só é conectada à função `accept_invite` no M9 (plan.md) — aqui a
// tela é só visual, com dados de exemplo.
const MOCK_INVITE = {
  workspaceName: "Workspace Exemplo",
  role: "member" as const,
  invitedByEmail: "admin@empresa.com",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // O token não é usado ainda (dados mockados), mas mantemos a assinatura de
  // rota dinâmica já alinhada ao que o M9 vai precisar.
  await params;

  return (
    <AuthShell
      title="Você foi convidado"
      description={`${MOCK_INVITE.invitedByEmail} te convidou para colaborar no workspace "${MOCK_INVITE.workspaceName}".`}
    >
      <InviteAcceptForm role={MOCK_INVITE.role} />
    </AuthShell>
  );
}
