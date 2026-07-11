"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string
  children: React.ReactNode
}) {
  // PRD Seção 9.4: sidebar colapsa para ícones em telas < 1280px. O toggle
  // manual (SidebarTrigger / Ctrl+B) sobrepõe o breakpoint até a tela cruzar
  // a faixa de novo — aí o override é descartado e a regra volta a valer.
  const isWide = useMediaQuery("(min-width: 1280px)", true)
  const [manualOpen, setManualOpen] = React.useState<boolean | null>(null)
  const [prevIsWide, setPrevIsWide] = React.useState(isWide)

  if (prevIsWide !== isWide) {
    setPrevIsWide(isWide)
    setManualOpen(null)
  }

  const open = manualOpen ?? isWide

  return (
    <TooltipProvider>
      <SidebarProvider
        open={open}
        onOpenChange={setManualOpen}
        style={{ "--sidebar-width": "220px" } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset>
          <AppTopbar userEmail={userEmail} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
