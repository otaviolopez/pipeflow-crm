"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
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
import { ROLE_LABELS } from "@/lib/settings/types";
import type { Invite, Member, MemberRole } from "@/lib/settings/types";

const inviteSchema = z.object({
  email: z.string().trim().min(1, "Informe um e-mail.").email("E-mail inválido."),
  role: z.enum(["admin", "member"]),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function InviteMemberDialog({
  open,
  onOpenChange,
  members,
  invites,
  isAtLimit,
  onInvite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  invites: Invite[];
  isAtLimit: boolean;
  onInvite: (email: string, role: MemberRole) => void;
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
    const normalizedEmail = values.email.trim().toLowerCase();

    // Estados de erro exatos da Seção 9.3 do PRD — checados antes de
    // "enviar", com o campo de e-mail marcado inválido.
    const memberExists = members.some(
      (member) => member.email.toLowerCase() === normalizedEmail
    );
    if (memberExists) {
      form.setError("email", { message: "Este e-mail já faz parte da sua equipe." });
      return;
    }

    const inviteExists = invites.some(
      (invite) => invite.email.toLowerCase() === normalizedEmail
    );
    if (inviteExists) {
      form.setError("email", {
        message: "Já existe um convite pendente para este e-mail.",
      });
      return;
    }

    setIsSending(true);
    // Mock: envio real via Resend só no M12.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSending(false);

    onInvite(values.email.trim(), values.role);
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
