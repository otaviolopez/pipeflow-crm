"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  ChartLine,
  Check,
  ChevronsUpDown,
  Settings,
  SquareKanban,
  Users,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { switchWorkspace } from "@/lib/workspace/actions"
import type { WorkspaceRole, WorkspaceSummary } from "@/lib/workspace/session"

const mainNav = [
  { title: "Pipeline", href: "/pipeline", icon: SquareKanban },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Dashboard", href: "/dashboard", icon: ChartLine },
]

// "Workspace" e "Equipe" são admin-only (PRD 6.5: gerenciar membros/dados do
// workspace); "Plano" fica de fora do filtro porque qualquer membro pode
// consultar o uso/plano atual (RLS "workspaces: select as member" já
// permite leitura pra todo mundo).
const settingsNav = [
  { title: "Workspace", href: "/settings/workspace", adminOnly: true },
  { title: "Equipe", href: "/settings/team", adminOnly: true },
  { title: "Plano", href: "/settings/billing", adminOnly: false },
]

export function AppSidebar({
  workspaces,
  activeWorkspaceId,
  currentUserRole,
}: {
  workspaces: WorkspaceSummary[]
  activeWorkspaceId: string
  currentUserRole: WorkspaceRole | null
}) {
  const pathname = usePathname()
  const [isPending, startTransition] = React.useTransition()
  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    workspaces[0]

  function handleSwitch(workspaceId: string) {
    if (workspaceId === activeWorkspace.id || isPending) return
    startTransition(async () => {
      await switchWorkspace(workspaceId)
    })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeWorkspace.name}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Workspace
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="bottom"
                className="w-(--anchor-width) min-w-48"
              >
                {/* Base UI exige GroupLabel dentro de Menu.Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Trocar workspace</DropdownMenuLabel>
                  {workspaces.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => handleSwitch(workspace.id)}
                    >
                      <Building2 />
                      {workspace.name}
                      {workspace.id === activeWorkspace.id && (
                        <Check className="ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    tooltip={item.title}
                    isActive={
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/settings/workspace" />}
                  tooltip="Configurações"
                  isActive={pathname.startsWith("/settings")}
                >
                  <Settings />
                  <span>Configurações</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {settingsNav
                    .filter((item) => !item.adminOnly || currentUserRole === "admin")
                    .map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          render={<Link href={item.href} />}
                          isActive={pathname === item.href}
                        >
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
