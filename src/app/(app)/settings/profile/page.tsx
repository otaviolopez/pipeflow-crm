import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { getProfilesByIds } from "@/lib/profiles/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Perfil — PiperFlow" };

export default async function SettingsProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const names = await getProfilesByIds([user.id]);
  const name = names.get(user.id) ?? "";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          <span className="h-6 w-1 rounded-full bg-primary" aria-hidden />
          Perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Seus dados e preferências pessoais.
        </p>
      </div>
      <ProfileSettingsForm name={name} email={user.email ?? ""} />
    </div>
  );
}
