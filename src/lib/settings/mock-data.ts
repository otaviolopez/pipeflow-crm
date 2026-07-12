import type { Member } from "./types";

// Mock: /settings/profile só conecta ao Supabase de verdade no M13.
export const CURRENT_USER: Member = {
  id: "current",
  userId: "current",
  name: "Você",
  email: "voce@piperflow.dev",
  role: "admin",
};

export const WORKSPACE_NAME_DEFAULT = "Minha Empresa";
