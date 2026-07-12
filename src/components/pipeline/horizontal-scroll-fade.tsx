"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Largura de uma coluna (w-72 = 288px) + gap-4 (16px) — um "passo" de
// scroll corresponde a exatamente uma coluna, alinhado ao scroll-snap.
const SCROLL_STEP_PX = 304;

// Envolve uma linha com overflow-x-auto (o board do pipeline) com as pistas
// visuais que faltavam pro usuário perceber que há mais colunas pra ver:
// gradiente nas bordas (só aparece do lado que ainda tem conteúdo pra
// rolar) + setas de navegação + scroll-snap pra cada coluna "encaixar"
// no lugar em vez de parar no meio. Sem isso, colunas fora da viewport
// pareciam simplesmente sumidas, não uma interação disponível.
export function HorizontalScrollFade({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  function scrollByStep(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * SCROLL_STEP_PX, behavior: "smooth" });
  }

  return (
    // min-w-0 é essencial aqui: sem isso, o item flex assume a largura
    // mínima do conteúdo (a soma de todas as colunas, ~1808px) em vez de
    // respeitar o espaço disponível — o scroll interno até funcionava, mas
    // a seta posicionada com "right-2" calculava a posição relativa a essa
    // largura inflada e acabava fora da área visível, cortada pelo
    // overflow-hidden do container pai (por isso ficava invisível).
    <div className="relative min-h-0 min-w-0 flex-1">
      <div
        ref={scrollRef}
        className={cn(
          "flex h-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2",
          className
        )}
      >
        {children}
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />

      {/* ghost + bg-background/60 + backdrop-blur: sutil (sem contorno
          sólido, entra em opacity-80) mas ainda com separação suficiente do
          conteúdo atrás pra continuar legível — reforça no hover. */}
      {canScrollLeft && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Rolar colunas para a esquerda"
          onClick={() => scrollByStep(-1)}
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-background/60 opacity-80 shadow-sm backdrop-blur-sm transition-all hover:bg-background/90 hover:opacity-100"
        >
          <ChevronLeft />
        </Button>
      )}
      {canScrollRight && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Rolar colunas para a direita"
          onClick={() => scrollByStep(1)}
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-background/60 opacity-80 shadow-sm backdrop-blur-sm transition-all hover:bg-background/90 hover:opacity-100"
        >
          <ChevronRight />
        </Button>
      )}
    </div>
  );
}
