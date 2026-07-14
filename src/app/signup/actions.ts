"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name) {
    redirect(`/signup?error=${encodeURIComponent("Informe seu nome completo.")}`);
  }

  // Validado aqui (não só no client): o form usa action={signup} direto, sem
  // JS interceptando o submit, então a única barreira real é o servidor.
  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("As senhas não coincidem.")}`);
  }

  const supabase = await createClient();

  // options.data vira auth.users.raw_user_meta_data — é dali que o trigger
  // handle_new_user (supabase/schema.sql) lê o nome pra criar o profile já
  // com o nome certo, em vez do fallback (parte do e-mail antes do @).
  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password,
    options: { data: { name } },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(
    `/login?notice=${encodeURIComponent(
      "Verifique seu e-mail para confirmar a conta antes de entrar."
    )}`
  );
}
