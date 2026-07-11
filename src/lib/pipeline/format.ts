import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { DealStage } from "./types";

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDueDate(dueDate: string): string {
  return format(parseISO(dueDate), "dd/MM", { locale: ptBR });
}

// Negócios já fechados (ganhos ou perdidos) nunca são exibidos como vencidos
// — o prazo só importa enquanto o negócio ainda está em aberto.
export function isOverdue(dueDate: string | null, stage: DealStage): boolean {
  if (!dueDate || stage === "won" || stage === "lost") return false;
  return isBefore(parseISO(dueDate), startOfDay(new Date()));
}
