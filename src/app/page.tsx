import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  History,
  KanbanSquare,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "PiperFlow CRM — pipeline visual e CRM gratuito para pequenos negócios",
  description:
    "CRM genuinamente gratuito para pequenos negócios e freelancers: pipeline visual, leads organizados e o histórico completo de cada conversa.",
};

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "Pipeline visual de verdade",
    description:
      "Arraste negócios entre as etapas do funil e veja o estado da sua carteira num relance — sem planilha, sem adivinhação.",
  },
  {
    icon: History,
    title: "Timeline de cada relacionamento",
    description:
      'Ligação, e-mail, reunião ou nota: toda interação fica registrada no perfil do lead. Nunca mais "onde anotei isso mesmo?"',
  },
  {
    icon: Building2,
    title: "Um workspace por cliente",
    description:
      "Atende mais de uma empresa? Cada workspace isola os dados por completo — feito pra freelancers e consultores.",
  },
  {
    icon: Sparkles,
    title: "Freemium genuíno",
    description:
      "O plano Free não é um trial disfarçado: dá pra operar de verdade com 2 colaboradores e 50 leads, sem cartão de crédito.",
  },
] as const;

const PLANS = [
  {
    name: "Free",
    price: "R$ 0",
    period: "por mês",
    description: "Pra validar o processo de vendas sem fricção.",
    features: [
      "Até 2 colaboradores",
      "Até 50 leads",
      "Pipeline completo",
      "Timeline de atividades",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "por mês, por workspace",
    description: "Pra quando o time e a carteira de clientes crescem.",
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Tudo do plano Free",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingNav />
      <Hero />
      <Features />
      <Pricing />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}

function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="rounded-md font-heading text-lg font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          PiperFlow
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
          <a href="#funcionalidades" className="transition-colors hover:text-foreground">
            Funcionalidades
          </a>
          <a href="#precos" className="transition-colors hover:text-foreground">
            Preços
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/login" />}>
            Entrar
          </Button>
          <Button render={<Link href="/signup" />}>Criar conta</Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,black_35%,transparent_100%)]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 16%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-16 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-32">
        <div className="flex flex-col gap-6">
          <span
            className="w-fit animate-in fade-in-0 slide-in-from-bottom-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground fill-mode-both duration-700"
            style={{ animationDelay: "0ms" }}
          >
            CRM para pequenos negócios e freelancers
          </span>

          <h1
            className="animate-in fade-in-0 slide-in-from-bottom-3 text-balance font-heading text-4xl leading-[1.05] font-semibold tracking-tight fill-mode-both duration-700 sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Sua próxima venda não devia morar numa planilha.
          </h1>

          <p
            className="max-w-lg animate-in fade-in-0 slide-in-from-bottom-3 text-lg text-muted-foreground fill-mode-both duration-700"
            style={{ animationDelay: "160ms" }}
          >
            PiperFlow é o CRM genuinamente gratuito pra quem vende de verdade:
            pipeline visual, leads organizados e o histórico de cada conversa —
            sem os módulos que você nunca vai usar.
          </p>

          <div
            className="flex animate-in fade-in-0 slide-in-from-bottom-3 flex-wrap items-center gap-3 fill-mode-both duration-700"
            style={{ animationDelay: "240ms" }}
          >
            <Button size="lg" render={<Link href="/signup" />}>
              Criar conta grátis
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" render={<a href="#precos" />}>
              Ver planos
            </Button>
          </div>
        </div>

        <div
          className="animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both duration-1000"
          style={{ animationDelay: "200ms" }}
        >
          <PipelinePreview />
        </div>
      </div>
    </section>
  );
}

// Representação abstrata do Kanban — não é um screenshot real, só sugere o
// produto (3 colunas, cards de larguras variadas) na paleta neutra do app.
function PipelinePreview() {
  const columns = [
    { label: "Novo Lead", cards: [70, 45] },
    { label: "Proposta Enviada", cards: [55, 80, 40] },
    { label: "Fechado Ganho", cards: [60] },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/5 sm:p-5">
      <div className="grid grid-cols-3 gap-3">
        {columns.map((column) => (
          <div key={column.label} className="flex flex-col gap-2">
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              {column.label}
            </span>
            {column.cards.map((width, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/70 bg-muted/40 p-2"
              >
                <div
                  className="h-2 rounded-full bg-foreground/15"
                  style={{ width: `${width}%` }}
                />
                <div className="mt-2 h-4 w-10 rounded-full bg-foreground/10" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="funcionalidades" className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Feito só pra vender
        </h2>
        <p className="mt-3 text-muted-foreground">
          Sem os módulos de marketing e service que deixam os CRMs grandes
          complicados demais pra um time pequeno.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <feature.icon className="size-5 text-foreground" />
              </div>
              <h3 className="font-heading text-lg font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="precos" className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Planos e preços
          </h2>
          <p className="mt-3 text-muted-foreground">
            Comece de graça. Faça upgrade quando o time e a carteira de
            clientes crescerem — o limite é por workspace, não por conta.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            // O badge fica num wrapper à parte porque o Card tem
            // overflow-hidden embutido e cortaria o badge poking para fora
            // no topo (-top-3).
            <div key={plan.name} className="relative">
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  Mais popular
                </span>
              )}
              <Card className={cn(plan.highlighted && "ring-2 ring-foreground")}>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-heading text-lg font-medium">{plan.name}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-semibold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 shrink-0 text-muted-foreground" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    render={<Link href="/signup" />}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 text-center">
      <h2 className="mx-auto max-w-lg text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Organize suas vendas em menos de 5 minutos.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Sem cartão de crédito. Sem trial disfarçado. É Free de verdade.
      </p>
      <Button size="lg" className="mt-8" render={<Link href="/signup" />}>
        Criar conta grátis
        <ArrowRight />
      </Button>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <span className="font-heading font-semibold text-foreground">PiperFlow</span>
        <span>© {new Date().getFullYear()} PiperFlow CRM.</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="transition-colors hover:text-foreground">
            Entrar
          </Link>
          <Link href="/signup" className="transition-colors hover:text-foreground">
            Criar conta
          </Link>
        </div>
      </div>
    </footer>
  );
}
