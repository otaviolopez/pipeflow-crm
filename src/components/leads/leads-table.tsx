"use client";

import Link from "next/link";
import { Inbox, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeDate } from "@/lib/leads/format";
import type { Lead } from "@/lib/leads/types";

import { LeadStatusBadge } from "./lead-status-badge";

const COLUMNS = ["Nome", "Empresa", "Status", "Responsável", "Última atividade", "Criado em"];

export function LeadsTable({
  isLoading,
  leads,
  hasAnyLeads,
  search,
  onClearFilters,
}: {
  isLoading: boolean;
  leads: Lead[];
  hasAnyLeads: boolean;
  search: string;
  onClearFilters: () => void;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-primary/20">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                {COLUMNS.map((column) => (
                  <TableCell key={column}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Estado vazio (workspace novo, nenhum lead cadastrado) — PRD, Seção 9.3.
  if (!hasAnyLeads) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-12 text-center">
        <Inbox className="size-8 text-muted-foreground" />
        <p className="font-medium">Nenhum lead ainda.</p>
        <p className="text-sm text-muted-foreground">
          Cadastre seu primeiro lead para começar a vender.
        </p>
        <Button className="mt-2" render={<Link href="/leads/new" />}>
          Adicionar lead
        </Button>
      </div>
    );
  }

  // Busca/filtro sem resultado — mensagem exata da Seção 9.3 do PRD quando
  // há termo de busca; genérica quando só os filtros de status/responsável/
  // data estão ativos.
  if (leads.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-12 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <p className="font-medium">
          {search.trim() !== ""
            ? `Nenhum lead encontrado para "${search.trim()}".`
            : "Nenhum lead encontrado com os filtros aplicados."}
        </p>
        <Button variant="outline" className="mt-2" onClick={onClearFilters}>
          Limpar busca
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                  {lead.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{lead.company ?? "—"}</TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{lead.ownerName}</TableCell>
              <TableCell className="text-muted-foreground">
                {lead.lastActivityAt
                  ? formatRelativeDate(lead.lastActivityAt)
                  : "Nenhuma atividade"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeDate(lead.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
