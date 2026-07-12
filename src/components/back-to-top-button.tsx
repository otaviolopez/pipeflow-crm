"use client";

import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

// A API nativa (behavior: "smooth") não expõe controle de duração — por
// isso a animação é feita manualmente aqui. Baseline de ~600ms (duração
// típica de um scroll suave) + 40% mais lento, pedido explicitamente pra
// dar tempo do usuário ver os blocos recolhendo enquanto a página sobe.
const SCROLL_DURATION_MS = 600 * 1.4;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollToTop(durationMs: number) {
  const startY = window.scrollY;
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / durationMs, 1);
    window.scrollTo(0, startY * (1 - easeInOutCubic(progress)));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

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
      onClick={() => smoothScrollToTop(SCROLL_DURATION_MS)}
    >
      <ArrowUp className="size-6" />
    </Button>
  );
}
