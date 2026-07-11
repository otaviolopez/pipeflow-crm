"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isCreatedOnOrAfter } from "@/lib/leads/format";
import { getLeads } from "@/lib/leads/store";
import { FREE_PLAN_LEAD_LIMIT, LEADS_PAGE_SIZE } from "@/lib/leads/types";
import type { Lead, LeadStatus } from "@/lib/leads/types";

import { LeadsPagination } from "./leads-pagination";
import { LeadsTable } from "./leads-table";
import { LeadsToolbar } from "./leads-toolbar";

const LOADING_DELAY_MS = 600;

export function LeadsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [leads] = React.useState<Lead[]>(() => getLeads());
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | LeadStatus>("all");
  const [owner, setOwner] = React.useState<string>("all");
  const [createdFrom, setCreatedFrom] = React.useState<Date | undefined>();
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const filteredLeads = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        term === "" ||
        lead.name.toLowerCase().includes(term) ||
        (lead.email?.toLowerCase().includes(term) ?? false) ||
        (lead.company?.toLowerCase().includes(term) ?? false);
      const matchesStatus = status === "all" || lead.status === status;
      const matchesOwner = owner === "all" || lead.ownerName === owner;
      const matchesDate = !createdFrom || isCreatedOnOrAfter(lead.createdAt, createdFrom);
      return matchesSearch && matchesStatus && matchesOwner && matchesDate;
    });
  }, [leads, search, status, owner, createdFrom]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * LEADS_PAGE_SIZE,
    currentPage * LEADS_PAGE_SIZE
  );

  function updateFilter<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setOwner("all");
    setCreatedFrom(undefined);
    setPage(1);
  }

  const isAtFreeLimit = leads.length >= FREE_PLAN_LEAD_LIMIT;

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>

        {isAtFreeLimit ? (
          <Tooltip>
            <TooltipTrigger render={<span tabIndex={0} className="inline-flex" />}>
              <Button disabled>
                <Plus />
                Adicionar lead
              </Button>
            </TooltipTrigger>
            <TooltipContent>Limite do plano Free atingido.</TooltipContent>
          </Tooltip>
        ) : (
          <Button disabled={isLoading} render={<Link href="/leads/new" />}>
            <Plus />
            Adicionar lead
          </Button>
        )}
      </div>

      {isAtFreeLimit && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-600/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-800 dark:text-yellow-400">
          <TriangleAlert className="size-4 shrink-0" />
          <span>
            Você atingiu o limite de 50 leads do plano Free.{" "}
            <Link href="/settings/billing" className="font-medium underline underline-offset-4">
              Fazer upgrade
            </Link>
          </span>
        </div>
      )}

      <LeadsToolbar
        disabled={isLoading}
        search={search}
        onSearchChange={(value) => updateFilter(setSearch, value)}
        status={status}
        onStatusChange={(value) => updateFilter(setStatus, value)}
        owner={owner}
        onOwnerChange={(value) => updateFilter(setOwner, value)}
        createdFrom={createdFrom}
        onCreatedFromChange={(value) => updateFilter(setCreatedFrom, value)}
      />

      <LeadsTable
        isLoading={isLoading}
        leads={paginatedLeads}
        hasAnyLeads={leads.length > 0}
        search={search}
        onClearFilters={clearFilters}
      />

      {!isLoading && filteredLeads.length > 0 && (
        <LeadsPagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={(value) => setPage(value)}
        />
      )}
    </div>
  );
}
