"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    // Nunca revelar se foi o e-mail ou a senha que errou (PRD, Seção 9.5).
    // "email_not_confirmed" é exceção: não indica qual campo está errado,
    // apenas o status da conta, então orienta o usuário a confirmar o e-mail.
    if (error.code === "email_not_confirmed") {
      redirect(
        `/login?notice=${encodeURIComponent(
          "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada."
        )}`
      );
    }
    redirect(`/login?error=${encodeURIComponent("E-mail ou senha incorretos.")}`);
  }

  revalidatePath("/", "layout");
  // Tela padrão ao logar é o pipeline, não o dashboard (PRD, Seção 9.4).
  redirect("/pipeline");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
