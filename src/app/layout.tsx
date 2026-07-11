import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {isLoggedIn && (
          <header className="flex items-center justify-between border-b px-6 py-3">
            <nav className="flex gap-4 text-sm font-medium">
              <Link href="/contatos">Contatos</Link>
              <Link href="/pipeline">Pipeline</Link>
            </nav>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-500 cursor-pointer">
                Sair
              </button>
            </form>
          </header>
        )}
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
