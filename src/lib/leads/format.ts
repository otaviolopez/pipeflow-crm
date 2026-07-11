import { formatDistanceToNow, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatRelativeDate(isoDate: string): string {
  return formatDistanceToNow(parseISO(isoDate), { locale: ptBR, addSuffix: true });
}

export function isCreatedOnOrAfter(createdAt: string, from: Date): boolean {
  return isAfter(parseISO(createdAt), from) || parseISO(createdAt).toDateString() === from.toDateString();
}
