import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Piperflow CRM",
  description: "CRM simples de contatos e pipeline de vendas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: o next-themes ajusta a classe do <html> num
    // script antes da hidratação; sem isso o React acusa mismatch falso.
    <html
      lang="pt-BR"
      // overflow-x-hidden direto no <html> (elemento raiz de scroll de
      // verdade) — testado empiricamente: colocar só no <body> e confiar na
      // propagação body->viewport não bloqueou o scroll horizontal de fato
      // (window.scrollTo ainda conseguia rolar). Cards do ScrollReveal
      // ainda não revelados ficam deslocados ±64px pra fora da tela
      // esperando a hora de entrar; sem cortar isso, contam como largura
      // rolável da página.
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-hidden antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
