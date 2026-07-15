"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// O componente <Table> (shadcn) já embrulha a tabela num
// data-slot="table-container" com overflow-x-auto próprio — diferente do
// board do pipeline, aqui não dá pra duplicar esse container (colocar outro
// overflow-x-auto por fora não redimensiona o de dentro, então o scroll real
// acontece só no elemento interno). Este componente observa esse elemento
// interno diretamente (querySelector no filho) em vez de gerenciar seu
// próprio scroll, só para desenhar o fade nas bordas quando há colunas
// escondidas fora da viewport (Status/Responsável/Última atividade/Criado
// em, em telas estreitas) — sem isso, a tabela rolava horizontalmente, mas
// nada indicava que havia mais conteúdo pra ver.
export function TableScrollFade({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  React.useEffect(() => {
    const scrollEl = wrapperRef.current?.querySelector<HTMLElement>(
      '[data-slot="table-container"]'
    );
    if (!scrollEl) return;

    function updateScrollState() {
      if (!scrollEl) return;
      setCanScrollLeft(scrollEl.scrollLeft > 4);
      setCanScrollRight(scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 4);
    }

    updateScrollState();
    scrollEl.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(scrollEl);

    return () => {
      scrollEl.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {children}

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
