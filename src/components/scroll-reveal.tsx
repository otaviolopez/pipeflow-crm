"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Direction = "left" | "right" | "bottom";

// Abaixo desse delta (px) uma variação de scrollY é tratada como ruído, não
// como intenção real de subir/descer — existe pra ignorar o "quique" do
// overscroll elástico no fim da página, que senão fica alternando a
// direção detectada a cada frame e faz o último bloco tremer.
const SCROLL_NOISE_DEADZONE_PX = 4;

// Tempo que a proporção visível precisa ficar abaixo de 30% (rolando pra
// cima) antes de recolher de fato — filtra blips de 1 frame do observer
// (mesma causa do tremor: um quique momentâneo cruza o threshold e volta).
const HIDE_DEBOUNCE_MS = 120;

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

  const scrollDirectionRef = React.useRef<"up" | "down">("down");
  const lastScrollYRef = React.useRef(0);
  const hideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function handleScroll() {
      const current = window.scrollY;
      const delta = current - lastScrollYRef.current;
      if (Math.abs(delta) < SCROLL_NOISE_DEADZONE_PX) return;
      scrollDirectionRef.current = delta < 0 ? "up" : "down";
      lastScrollYRef.current = current;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function cancelPendingHide() {
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisibleRef.current) {
          cancelPendingHide();
          setIsVisible(true);
        } else if (
          isVisibleRef.current &&
          entry.intersectionRatio < 0.3 &&
          scrollDirectionRef.current === "up" &&
          hideTimeoutRef.current === null
        ) {
          hideTimeoutRef.current = setTimeout(() => {
            hideTimeoutRef.current = null;
            setIsVisible(false);
          }, HIDE_DEBOUNCE_MS);
        } else if (entry.intersectionRatio >= 0.3 || scrollDirectionRef.current === "down") {
          // A proporção voltou a subir (ou a direção virou "descendo") antes
          // do debounce terminar — cancela o recolhimento agendado.
          cancelPendingHide();
        }
      },
      { threshold: [0, 0.3] }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelPendingHide();
    };
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
