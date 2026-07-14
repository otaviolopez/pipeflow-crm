"use client"

import * as React from "react"
import { Eye, EyeOff, Lock } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Envolve o Input padrão com ícone de cadeado (indicativo, não interativo) e
// o botão de mostrar/ocultar (ícone de olho) — convenção universal em campos
// de senha, ausente até agora em signup/login/troca de senha deste projeto.
function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <Lock
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-2.5 my-auto size-4 text-muted-foreground"
      />
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-8 pl-8", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-8 items-center justify-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export { PasswordInput }
