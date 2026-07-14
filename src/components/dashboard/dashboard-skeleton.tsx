import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Cada KPI com a largura aproximada do valor real que vai ocupar o lugar
// (contagens curtas, moeda longa, percentual) — larguras variadas leem
// melhor que quatro barras idênticas.
const KPI_PLACEHOLDERS = [
  { label: "Total de leads", valueWidth: "w-12" },
  { label: "Negócios abertos", valueWidth: "w-12" },
  { label: "Valor total do pipeline", valueWidth: "w-36" },
  { label: "Taxa de conversão", valueWidth: "w-16" },
];

const DEAL_ROW_PLACEHOLDERS = [
  { title: "w-40", lead: "w-24" },
  { title: "w-32", lead: "w-28" },
  { title: "w-44", lead: "w-20" },
];

// Espelha o layout real de dashboard/page.tsx (mesmo grid, gaps e alturas)
// pra página não "pular" quando os dados chegarem. Texto estático (título,
// labels de KPI, títulos dos cards) renderiza de verdade — só o que vem do
// Supabase vira skeleton.
export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
        <span className="h-6 w-1 rounded-full bg-primary" aria-hidden />
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_PLACEHOLDERS.map(({ label, valueWidth }) => (
          <Card key={label} className="border-t-2 border-t-primary">
            <CardContent className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Skeleton className={`h-10 ${valueWidth}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-l-2 border-l-primary">
          <CardHeader>
            <CardTitle>Funil de vendas por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="mx-auto aspect-[16/9] max-h-64 w-full" />
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-primary">
          <CardHeader>
            <CardTitle>Meus negócios com prazo próximo</CardTitle>
            {/* CardDescription real traz o nome do usuário (dado dinâmico) */}
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {DEAL_ROW_PLACEHOLDERS.map((row, index) => (
                <li key={index}>
                  <Card size="sm">
                    <CardContent className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <Skeleton className={`h-4 ${row.title}`} />
                        <Skeleton className={`h-3 ${row.lead}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
