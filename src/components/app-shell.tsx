"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { ThemePreferenceDialog } from "@/components/theme-preference-dialog"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { WorkspaceRole, WorkspaceSummary } from "@/lib/workspace/session"

export function AppShell({
  userEmail,
  workspaces,
  activeWorkspaceId,
  currentUserRole,
  children,
}: {
  userEmail: string
  workspaces: WorkspaceSummary[]
  activeWorkspaceId: string
  currentUserRole: WorkspaceRole | null
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
        <AppSidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          currentUserRole={currentUserRole}
        />
        <SidebarInset>
          <AppTopbar userEmail={userEmail} />
          {children}
        </SidebarInset>
        {/* Pergunta a preferência de tema uma única vez após o login (PRD 6.8) */}
        <ThemePreferenceDialog />
      </SidebarProvider>
    </TooltipProvider>
  )
}
