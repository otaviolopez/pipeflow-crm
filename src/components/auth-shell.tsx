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
        <Link
          href="/"
          className="rounded-md text-center text-xl font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          PiperFlow CRM
        </Link>

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
