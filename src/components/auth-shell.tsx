import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Wrapper visual compartilhado pelas telas públicas de autenticação
// (/login, /signup, /invite/[token]) — Seção 9.1 do PRD.
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Link "Voltar" separado do logo: o logo sozinho não é reconhecido
            como navegável (sem seta/underline), o que forçava o usuário a
            usar o botão "voltar" do navegador para sair da tela de auth. */}
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground visited:text-muted-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para o início
        </Link>

        <span className="text-center font-heading text-xl font-semibold tracking-tight">
          PiperFlow CRM
        </span>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer && <CardFooter className="justify-center">{footer}</CardFooter>}
        </Card>
      </div>
    </main>
  )
}
