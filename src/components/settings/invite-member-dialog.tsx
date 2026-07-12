"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvite } from "@/lib/settings/actions";
import { ROLE_LABELS } from "@/lib/settings/types";
import type { MemberRole } from "@/lib/settings/types";

const inviteSchema = z.object({
  email: z.string().trim().min(1, "Informe um e-mail.").email("E-mail inválido."),
  role: z.enum(["admin", "member"]),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function InviteMemberDialog({
  open,
  onOpenChange,
  isAtLimit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAtLimit: boolean;
}) {
  const [isSending, setIsSending] = React.useState(false);

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member" },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  }

  async function onSubmit(values: InviteValues) {
    setIsSending(true);
    const result = await createInvite({ email: values.email.trim(), role: values.role });
    setIsSending(false);

    if (result.error) {
      // Erros de duplicidade/limite voltam como mensagem genérica do
      // servidor — mostramos no campo de e-mail por ser o mais relevante
      // visualmente, já que quase todo erro de criação de convite se refere
      // a ele (duplicado, limite atingido, etc.).
      form.setError("email", { message: result.error });
      return;
    }

    toast.success(`Convite enviado para ${values.email.trim()}.`);
    form.reset();
    onOpenChange(false);
  }

  const role = form.watch("role");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          {!isAtLimit && (
            <DialogDescription>
              Envie um convite por e-mail com o papel já definido.
            </DialogDescription>
          )}
        </DialogHeader>

        {isAtLimit ? (
          <>
            <p className="text-sm text-muted-foreground">
              Plano Free permite até 2 colaboradores.
            </p>
            <DialogFooter>
              <Button render={<Link href="/settings/billing" />}>Ver planos</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel htmlFor="invite-email">E-mail</FieldLabel>
                <Input
                  id="invite-email"
                  type="email"
                  autoFocus
                  disabled={isSending}
                  {...form.register("email")}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-role">Papel</FieldLabel>
                <Select
                  value={role}
                  onValueChange={(value) => form.setValue("role", value as MemberRole)}
                  disabled={isSending}
                >
                  <SelectTrigger id="invite-role" className="w-full">
                    <SelectValue>{ROLE_LABELS[role]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Membro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button type="submit" disabled={isSending}>
                {isSending ? "Enviando..." : "Enviar convite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
