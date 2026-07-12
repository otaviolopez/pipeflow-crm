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
    // Propaga a mensagem específica da exception do accept_invite (ex.:
    // limite de colaboradores do Free atingido) — sem isso, todo erro de
    // aceite viraria "Convite inválido ou expirado.", inclusive quando a
    // causa real é outra (CLAUDE.md, Seção 9.3: erros devem ser específicos).
    throw new Error(error?.message || "Convite inválido ou expirado.");
  }

  await setActiveWorkspaceCookie(data);
}
