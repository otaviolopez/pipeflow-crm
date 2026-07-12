"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDueDate } from "@/lib/pipeline/format";

const newDealSchema = z.object({
  title: z.string().trim().min(2, "Informe um título para o negócio."),
  // valueAsNumber (no register abaixo) já converte a string do input antes
  // da validação — evita o descompasso de tipos entre z.coerce e useForm.
  value: z.number("Informe um valor numérico válido.").positive("Informe um valor numérico válido."),
  leadId: z.string().trim().min(1, "Selecione o lead vinculado."),
});

type NewDealValues = z.infer<typeof newDealSchema>;

export function NewDealDialog({
  open,
  onOpenChange,
  onCreate,
  leadOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewDealValues & { dueDate: string | null }) => void;
  leadOptions: { id: string; name: string }[];
}) {
  const [dueDate, setDueDate] = React.useState<Date | undefined>();

  const form = useForm<NewDealValues>({
    resolver: zodResolver(newDealSchema),
    defaultValues: { title: "", value: 0, leadId: "" },
  });

  function onSubmit(values: NewDealValues) {
    onCreate({
      ...values,
      dueDate: dueDate ? dueDate.toISOString().slice(0, 10) : null,
    });
    form.reset();
    setDueDate(undefined);
    onOpenChange(false);
  }

  const hasLeads = leadOptions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo negócio</DialogTitle>
          <DialogDescription>
            O negócio entra na coluna &quot;Novo Lead&quot; do pipeline.
          </DialogDescription>
        </DialogHeader>

        {!hasLeads ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Cadastre um lead antes de criar um negócio — todo negócio precisa estar
              vinculado a um lead.
            </p>
            <Button render={<Link href="/leads/new" />}>Cadastrar lead</Button>
          </div>
        ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.title}>
              <FieldLabel htmlFor="deal-title">Título</FieldLabel>
              <Input id="deal-title" autoFocus {...form.register("title")} />
              <FieldError errors={[form.formState.errors.title]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.value}>
              <FieldLabel htmlFor="deal-value">Valor estimado (R$)</FieldLabel>
              <Input
                id="deal-value"
                type="number"
                step="0.01"
                min="0"
                {...form.register("value", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.value]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.leadId}>
              <FieldLabel htmlFor="deal-lead">Lead vinculado</FieldLabel>
              <Select
                value={form.watch("leadId")}
                onValueChange={(value) => form.setValue("leadId", value ?? "", { shouldValidate: true })}
              >
                <SelectTrigger id="deal-lead" aria-label="Lead vinculado">
                  <SelectValue>
                    {leadOptions.find((lead) => lead.id === form.watch("leadId"))?.name ??
                      "Selecionar lead"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {leadOptions.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.leadId]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="deal-due-date">Prazo (opcional)</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      id="deal-due-date"
                      type="button"
                      variant="outline"
                      className="w-full justify-start font-normal"
                    />
                  }
                >
                  <CalendarIcon />
                  {dueDate
                    ? formatDueDate(dueDate.toISOString().slice(0, 10))
                    : "Selecionar data"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Adicionar negócio</Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
