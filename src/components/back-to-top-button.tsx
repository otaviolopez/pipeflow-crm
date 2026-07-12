"use client";

import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BackToTopButton() {
  return (
    <Button
      variant="outline"
      size="icon-lg"
      // icon-lg é 36px (size-9); 50% maior = 54px. rounded-md = 8px, igual
      // ao --radius base do sistema (ver globals.css — escala de radius
      // em múltiplos de 8).
      className="size-[54px] rounded-md"
      aria-label="Voltar para o início"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp className="size-6" />
    </Button>
  );
}
