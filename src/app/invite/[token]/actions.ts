"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { acceptInviteForCurrentUser } from "@/lib/workspace/invites";

export async function loginAndAcceptInvite(token: string, formData: FormData) {
  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (signInError) {
    // Mesma mensagem genérica do /login (PRD, Seção 9.5) — nunca revelar
    // qual campo está errado.
    return { error: "E-mail ou senha incorretos." };
  }

  try {
    await acceptInviteForCurrentUser(token);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Convite inválido ou expirado." };
  }

  revalidatePath("/", "layout");
  redirect("/pipeline");
}

export async function signupAndAcceptInvite(token: string, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!data.session) {
    // Confirmação de e-mail obrigatória (mesmo comportamento do /signup): sem
    // sessão ainda não dá pra chamar accept_invite, que depende de
    // auth.uid(). O token segue para o /login, que aceita o convite depois
    // que o usuário confirmar o e-mail e entrar.
    redirect(
      `/login?notice=${encodeURIComponent(
        "Confirme seu e-mail para concluir o cadastro. Depois de confirmar, faça login para entrar no workspace."
      )}&inviteToken=${encodeURIComponent(token)}`
    );
  }

  try {
    await acceptInviteForCurrentUser(token);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Convite inválido ou expirado." };
  }

  revalidatePath("/", "layout");
  redirect("/pipeline");
}
