import type { Metadata } from "next";

import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";

export const metadata: Metadata = { title: "Perfil — PiperFlow" };

export default function SettingsProfilePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Seus dados e preferências pessoais.
        </p>
      </div>
      <ProfileSettingsForm />
    </div>
  );
}
