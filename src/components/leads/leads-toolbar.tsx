"use client";

import { CalendarIcon, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadStatus } from "@/lib/leads/types";

const STATUS_LABELS: Record<"all" | LeadStatus, string> = {
  all: "Todos os status",
  active: "Ativo",
  inactive: "Inativo",
};

export function LeadsToolbar({
  disabled,
  search,
  onSearchChange,
  status,
  onStatusChange,
  owner,
  onOwnerChange,
  owners,
  createdFrom,
  onCreatedFromChange,
}: {
  disabled: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  status: "all" | LeadStatus;
  onStatusChange: (value: "all" | LeadStatus) => void;
  owner: string;
  onOwnerChange: (value: string) => void;
  owners: string[];
  createdFrom: Date | undefined;
  onCreatedFromChange: (value: Date | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, e-mail ou empresa"
          className="pl-8"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          disabled={disabled}
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as "all" | LeadStatus)}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Filtrar por status">
          {/* Children explícito: o Select só sabe o label do item selecionado
              depois que o popup abre ao menos uma vez (registra os itens) —
              sem isso, o trigger mostra o value cru ("all") no primeiro render. */}
          <SelectValue>{STATUS_LABELS[status]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="inactive">Inativo</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={owner}
        onValueChange={(value) => onOwnerChange(value ?? "all")}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Filtrar por responsável">
          <SelectValue>{owner === "all" ? "Todos os responsáveis" : owner}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os responsáveis</SelectItem>
          {owners.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger
          render={<Button variant="outline" className="font-normal" disabled={disabled} />}
        >
          <CalendarIcon />
          {createdFrom
            ? `Desde ${createdFrom.toLocaleDateString("pt-BR")}`
            : "Data de cadastro"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={createdFrom} onSelect={onCreatedFromChange} />
          {createdFrom && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onCreatedFromChange(undefined)}
              >
                Limpar data
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
