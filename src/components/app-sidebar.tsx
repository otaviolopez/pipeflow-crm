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

// Workspaces mockados até o M9 conectar o switcher aos dados reais do usuário.
const mockWorkspaces = ["Minha Empresa", "Agência Demo"]

const mainNav = [
  { title: "Pipeline", href: "/pipeline", icon: SquareKanban },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Dashboard", href: "/dashboard", icon: ChartLine },
]

const settingsNav = [
  { title: "Workspace", href: "/settings/workspace" },
  { title: "Equipe", href: "/settings/team" },
  { title: "Plano", href: "/settings/billing" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [activeWorkspace, setActiveWorkspace] = React.useState(
    mockWorkspaces[0]
  )

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
                    {activeWorkspace}
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
                  {mockWorkspaces.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace}
                      onClick={() => setActiveWorkspace(workspace)}
                    >
                      <Building2 />
                      {workspace}
                      {workspace === activeWorkspace && (
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
                  {settingsNav.map((item) => (
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
