"use client";

import { Cell, Funnel, FunnelChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { FunnelStagePoint } from "@/lib/dashboard/metrics";

// Etapa do funil é um dado ORDINAL (posição no processo), não categórico —
// a cor certa é um único tom em degradê claro→escuro, nunca hues distintos
// por etapa (dataviz skill, color-formula.md). O degradê usa opacidade sobre
// --foreground para se adaptar sozinho ao tema claro/escuro, sem precisar de
// uma rampa separada por modo.
const STAGE_FILL_OPACITY = [0.92, 0.76, 0.62, 0.5, 0.39, 0.3];

function stageFill(index: number): string {
  const opacity = Math.round((STAGE_FILL_OPACITY[index] ?? 0.3) * 100);
  return `color-mix(in oklch, var(--foreground) ${opacity}%, transparent)`;
}

const chartConfig: ChartConfig = {
  count: { label: "Negócios" },
};

export function SalesFunnelChart({ data }: { data: FunnelStagePoint[] }) {
  return (
    <div className="flex flex-col gap-4">
      <ChartContainer config={chartConfig} className="mx-auto aspect-[16/9] max-h-64 w-full">
        <FunnelChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
          <Funnel
            data={data}
            dataKey="count"
            nameKey="label"
            lastShapeType="rectangle"
            isAnimationActive
            stroke="var(--background)"
            strokeWidth={2}
          >
            {data.map((point, index) => (
              <Cell key={point.stage} fill={stageFill(index)} />
            ))}
          </Funnel>
        </FunnelChart>
      </ChartContainer>

      {/* Legenda em HTML: o Recharts Funnel não expõe uma forma confiável de
          rotular cada segmento com um dataKey customizado, então os valores
          exatos (a "tabela" da skill de dataviz) ficam aqui, sempre visíveis
          — não só no tooltip ao passar o mouse. */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {data.map((point, index) => (
          <li key={point.stage} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: stageFill(index) }}
              aria-hidden
            />
            <span className="truncate text-muted-foreground">{point.label}</span>
            <span className="ml-auto font-medium tabular-nums">{point.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
