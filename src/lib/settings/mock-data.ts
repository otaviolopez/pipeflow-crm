import type { Invite, Member } from "./types";

// Mock: até o M9 conectar workspace_members/invites de verdade ao Supabase.
export const CURRENT_USER: Member = {
  id: "current",
  name: "Você",
  email: "voce@piperflow.dev",
  role: "admin",
};

// Começa em 2/2 (limite do Free) de propósito: dá pra ver o estado
// "limite atingido" do convite direto, sem precisar de nenhuma ação antes.
// Remover a Ana libera uma vaga pra testar os outros estados do convite.
export const INITIAL_MEMBERS: Member[] = [
  CURRENT_USER,
  { id: "member-1", name: "Ana Souza", email: "ana.souza@empresa.com", role: "member" },
];

function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const INITIAL_INVITES: Invite[] = [
  {
    id: "invite-1",
    email: "bruno.lima@empresa.com",
    role: "member",
    createdAt: daysAgoISO(1),
  },
];

export const WORKSPACE_NAME_DEFAULT = "Minha Empresa";
