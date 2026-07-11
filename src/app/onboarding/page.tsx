import type { Metadata } from "next";

import { OnboardingWizard } from "@/components/onboarding-wizard";

export const metadata: Metadata = { title: "Criar workspace — PiperFlow" };

export default function OnboardingPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <OnboardingWizard />
    </main>
  );
}
