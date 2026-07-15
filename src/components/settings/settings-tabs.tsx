"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkspaceRole } from "@/lib/workspace/session";

// "Workspace" e "Equipe" são admin-only (PRD 6.5: gerenciar membros/dados do
// workspace); "Plano" fica de fora do filtro porque qualquer membro pode
// consultar o uso/plano atual (RLS "workspaces: select as member" já
// permite leitura pra todo mundo) — mesma regra que existia no submenu da
// sidebar antes desta tela virar abas.
const TABS = [
  { title: "Workspace", href: "/settings/workspace", adminOnly: true },
  { title: "Membros", href: "/settings/team", adminOnly: true },
  { title: "Assinatura", href: "/settings/billing", adminOnly: false },
];

export function SettingsTabs({ currentUserRole }: { currentUserRole: WorkspaceRole | null }) {
  const pathname = usePathname();
  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || currentUserRole === "admin");

  // value é só decorativo aqui — a navegação real acontece via <Link> em
  // cada TabsTrigger (render prop), não via onValueChange; isso mantém cada
  // aba como uma URL própria (/settings/workspace, /settings/team,
  // /settings/billing), então F5 preserva a aba ativa e cada uma continua
  // linkável/compartilhável diretamente.
  const activeTab = visibleTabs.find((tab) => pathname.startsWith(tab.href))?.href;

  return (
    <Tabs value={activeTab}>
      <TabsList>
        {visibleTabs.map((tab) => (
          <TabsTrigger key={tab.href} value={tab.href} render={<Link href={tab.href} />}>
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
