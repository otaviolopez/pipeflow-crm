"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

// Wrapper client do next-themes: aplica a classe `.dark` no <html> (casa com
// o @custom-variant de globals.css) e detecta o prefers-color-scheme do SO.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
