"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Check, LogOut, Monitor, Moon, Sun, SunMoon, UserRound } from "lucide-react"

import { logout } from "@/app/login/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const themeOptions = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const

export function AppTopbar({ userEmail }: { userEmail: string }) {
  const initials = userEmail.slice(0, 2).toUpperCase()
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="max-h-6" />
      <Link
        href="/pipeline"
        className="rounded-md px-1 text-base font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        PiperFlow
      </Link>

      <div className="ml-auto flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Menu do usuário"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            {/* Base UI exige GroupLabel dentro de Menu.Group */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings/profile" />}>
              <UserRound />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SunMoon />
                Tema
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {themeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                  >
                    <option.icon />
                    {option.label}
                    {theme === option.value && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
