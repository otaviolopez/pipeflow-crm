import { Card, CardContent } from "@/components/ui/card";

// Stat tile (dataviz skill): label em sentence case sem dois-pontos, valor
// com números proporcionais (não tabulares — tabular é só para colunas de
// tabela) e 2-3x maior que o label, conforme PRD Seção 6.4.
export function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    // Acento de marca só na borda superior (não o card inteiro) — hierarquia
    // pontual pros 4 KPIs de topo, no padrão Linear/Stripe Dashboard: cor de
    // destaque pra marcar "isto é uma métrica-chave", não decoração.
    <Card className="border-t-2 border-t-primary">
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-4xl font-semibold tracking-tight">{value}</span>
      </CardContent>
    </Card>
  );
}
