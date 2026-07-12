"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Direction = "left" | "right" | "bottom";

// Efeito de entrada: o filho aparece (opacidade + deslize) assim que entra
// no viewport ao rolar para baixo, e continua visível enquanto o usuário
// segue descendo — mesmo depois que o elemento sai da tela por cima. Ele só
// recolhe de novo quando o usuário está rolando de volta pro topo (manual
// ou pelo botão "voltar ao início") E o elemento já caiu abaixo de 30% de
// visibilidade — não a cada perda de interseção, só nesse cenário
// específico de "saindo de vista ao subir".
export function ScrollReveal({
  children,
  from = "left",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  from?: Direction;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const isVisibleRef = React.useRef(isVisible);
  isVisibleRef.current = isVisible;

  // Direção do scroll rastreada localmente por instância (ref, não estado
  // de módulo) — cada componente cuida do próprio listener e o limpa junto
  // com o efeito, então não fica listener órfão sobrevivendo a hot-reload
  // ou a remontagens do componente.
  const scrollDirectionRef = React.useRef<"up" | "down">("down");
  const lastScrollYRef = React.useRef(0);

  React.useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function handleScroll() {
      const current = window.scrollY;
      scrollDirectionRef.current = current < lastScrollYRef.current ? "up" : "down";
      lastScrollYRef.current = current;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisibleRef.current) {
          setIsVisible(true);
        } else if (
          isVisibleRef.current &&
          entry.intersectionRatio < 0.3 &&
          scrollDirectionRef.current === "up"
        ) {
          setIsVisible(false);
        }
      },
      { threshold: [0, 0.3] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenClass =
    from === "bottom"
      ? "translate-y-12 opacity-0"
      : from === "left"
        ? "-translate-x-16 opacity-0"
        : "translate-x-16 opacity-0";

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "translate-x-0 translate-y-0 opacity-100" : hiddenClass,
        className
      )}
      // O atraso escalonado (delay) só se aplica ao entrar — ao recolher,
      // some junto com o scroll, sem esperar a fila de outros blocos.
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
