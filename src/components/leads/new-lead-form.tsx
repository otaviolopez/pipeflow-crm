"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { addLead } from "@/lib/leads/store";

// Só o nome é obrigatório — PRD, Seção 6.1: "formulário com apenas nome
// obrigatório para não perder tempo antes de começar a vender" (User Story
// do Membro, Seção 13).
const newLeadSchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório."),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  roleTitle: z.string().trim().optional(),
});

type NewLeadValues = z.infer<typeof newLeadSchema>;

export function NewLeadForm() {
  const router = useRouter();

  const form = useForm<NewLeadValues>({
    resolver: zodResolver(newLeadSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", roleTitle: "" },
  });

  function onSubmit(values: NewLeadValues) {
    const lead = addLead({
      name: values.name,
      email: values.email || null,
      phone: values.phone || null,
      company: values.company || null,
      roleTitle: values.roleTitle || null,
    });
    toast.success("Lead adicionado.");
    router.push(`/leads/${lead.id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo lead</h1>
        <p className="text-sm text-muted-foreground">
          Só o nome é obrigatório — o resto você pode completar depois.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="lead-name">Nome</FieldLabel>
                <Input id="lead-name" autoFocus {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel htmlFor="lead-email">E-mail</FieldLabel>
                <Input id="lead-email" type="email" {...form.register("email")} />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="lead-phone">Telefone</FieldLabel>
                <Input id="lead-phone" {...form.register("phone")} />
              </Field>

              <Field>
                <FieldLabel htmlFor="lead-company">Empresa</FieldLabel>
                <Input id="lead-company" {...form.register("company")} />
              </Field>

              <Field>
                <FieldLabel htmlFor="lead-role">Cargo</FieldLabel>
                <Input id="lead-role" {...form.register("roleTitle")} />
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link href="/leads" />}>
                Cancelar
              </Button>
              <Button type="submit">Salvar lead</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
