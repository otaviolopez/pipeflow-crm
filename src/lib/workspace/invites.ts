import { createClient } from "@/lib/supabase/server";
import { setActiveWorkspaceCookie } from "@/lib/workspace/session";

// Só pode ser chamado depois que uma sessão válida já existe (login ou
// signup com e-mail já confirmado) — accept_invite (supabase/schema.sql)
// depende de auth.uid() para associar o convite ao usuário certo.
export async function acceptInviteForCurrentUser(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_invite", {
    _token: token,
  });

  if (error || !data) {
    throw new Error("Convite inválido ou expirado.");
  }

  await setActiveWorkspaceCookie(data);
}
