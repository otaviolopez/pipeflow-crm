"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Chave padrão onde o next-themes persiste a escolha. A ausência dela é o
// nosso sinal de "nunca perguntou" — sem cookie nem tabela extra (plan.md M2).
const THEME_STORAGE_KEY = "theme"

function subscribe(onChange: () => void) {
  // O evento "storage" só dispara em outras abas; nesta aba o fechamento é
  // controlado pelo estado `dismissed` abaixo.
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

export function ThemePreferenceDialog() {
  const { setTheme } = useTheme()

  const neverChose = React.useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(THEME_STORAGE_KEY) === null,
    // No SSR renderiza fechado; o cliente reavalia após a hidratação.
    () => false
  )
  const [dismissed, setDismissed] = React.useState(false)
  const open = neverChose && !dismissed

  function choose(theme: "light" | "dark" | "system") {
    setTheme(theme)
    setDismissed(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      // Fechar sem escolher (Esc/X) = seguir o sistema, que já era o
      // comportamento em vigor — e persiste para não perguntar de novo.
      choose("system")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Como você prefere usar o PiperFlow?</DialogTitle>
          <DialogDescription>
            Detectamos a preferência do seu sistema. Você pode mudar de ideia a
            qualquer momento no menu do seu avatar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => choose("light")}
          >
            <Sun />
            Manter modo claro
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => choose("dark")}
          >
            <Moon />
            Usar modo escuro
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => choose("system")}
          >
            <Monitor />
            Seguir o sistema
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
