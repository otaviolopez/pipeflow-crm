"use client";

import { Cell, Funnel, FunnelChart } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { FunnelStagePoint } from "@/lib/dashboard/metrics";

// Etapa do funil é um dado ORDINAL (posição no processo) — a cor certa é um
// único matiz em degradê escuro→claro, nunca hues distintos por etapa
// (dataviz skill, color-formula.md). O degradê usa opacidade sobre
// --chart-funnel (roxo da marca Elevate: violet-950 no tema claro,
// violet-300 no escuro) — degraus validados com o validador da skill:
// ΔL adjacente ≥ 0.06 e extremo claro ≥ 2:1 de contraste nos dois temas.
const STAGE_FILL_OPACITY = [0.95, 0.8, 0.66, 0.54, 0.44, 0.34];

function stageFill(index: number): string {
  const opacity = Math.round((STAGE_FILL_OPACITY[index] ?? 0.34) * 100);
  return `color-mix(in oklch, var(--chart-funnel) ${opacity}%, transparent)`;
}

const chartConfig: ChartConfig = {
  count: { label: "Negócios" },
};

// Espaço reservado à direita do plot pros rótulos laterais das barras.
const LABEL_COLUMN = 132;
const LABEL_GAP = 12;

// Subconjunto estrutural das props que o Recharts passa ao shape customizado
// (FunnelTrapezoidItem) — só os campos usados, tipados sem importar tipos
// internos do pacote.
type FlatFunnelBarProps = {
  x?: number;
  y?: number;
  upperWidth?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  name?: string;
  val?: number | ReadonlyArray<number>;
};

// Barra reta (retângulo centrado) no lugar do trapézio padrão do Recharts,
// com o rótulo da etapa ancorado na borda direita da própria barra — nome e
// valor sempre visíveis, dispensando legenda separada e tooltip de hover
// (todo mark é diretamente rotulado, que é o "relief" exigido pela skill
// pra valores legíveis sem interação).
function FlatFunnelBar({
  x = 0,
  y = 0,
  upperWidth = 0,
  height = 0,
  fill,
  stroke,
  strokeWidth,
  name,
  val,
}: FlatFunnelBarProps) {
  const width = Math.max(upperWidth, 2);
  const count = typeof val === "number" ? val : (Array.isArray(val) ? val[val.length - 1] : 0);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Texto usa tokens de texto, nunca a cor da série (dataviz skill) */}
      <text x={x + width + LABEL_GAP} y={y + height / 2} dominantBaseline="central" className="text-xs">
        <tspan fill="var(--muted-foreground)">{name}</tspan>
        <tspan dx="0.5em" fontWeight={600} fill="var(--foreground)">
          {count}
        </tspan>
      </text>
    </g>
  );
}

export function SalesFunnelChart({ data }: { data: FunnelStagePoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-[16/9] max-h-64 w-full">
      <FunnelChart margin={{ top: 4, right: LABEL_COLUMN, bottom: 4, left: 0 }}>
        <Funnel
          data={data}
          dataKey="count"
          nameKey="label"
          isAnimationActive
          stroke="var(--background)"
          strokeWidth={2}
          shape={(props: FlatFunnelBarProps) => <FlatFunnelBar {...props} />}
        >
          {data.map((point, index) => (
            <Cell key={point.stage} fill={stageFill(index)} />
          ))}
        </Funnel>
      </FunnelChart>
    </ChartContainer>
  );
}
