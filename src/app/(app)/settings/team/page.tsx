import type { Metadata } from "next";

import { TeamSettings } from "@/components/settings/team-settings";

export const metadata: Metadata = { title: "Equipe — PiperFlow" };

export default function SettingsTeamPage() {
  return <TeamSettings />;
}
