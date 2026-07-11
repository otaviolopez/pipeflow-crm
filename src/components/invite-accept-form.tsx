"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Papéis do banco ficam em inglês (CLAUDE.md); a tradução é só de exibição.
const roleLabels = { admin: "Admin", member: "Membro" } as const;

export function InviteAcceptForm({
  role,
}: {
  role: keyof typeof roleLabels;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function accept(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      // TODO(M9): trocar por Server Action que chama `accept_invite`
      // (supabase/schema.sql) e cria/loga o usuário de verdade.
      toast.success("Convite aceito. Bem-vindo ao workspace!");
      router.push("/pipeline");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Badge variant="secondary" className="w-fit">
        Papel: {roleLabels[role]}
      </Badge>

      <Tabs defaultValue="create">
        <TabsList className="w-full">
          <TabsTrigger value="create" className="flex-1">
            Criar conta
          </TabsTrigger>
          <TabsTrigger value="login" className="flex-1">
            Já tenho conta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <form onSubmit={accept} className="flex flex-col gap-4 pt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-email">E-mail</FieldLabel>
                <Input
                  id="create-email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-password">Senha</FieldLabel>
                <Input
                  id="create-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Entrando..." : "Criar conta e aceitar convite"}
              </Button>
            </FieldGroup>
          </form>
        </TabsContent>

        <TabsContent value="login">
          <form onSubmit={accept} className="flex flex-col gap-4 pt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="login-password">Senha</FieldLabel>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Entrando..." : "Entrar e aceitar convite"}
              </Button>
            </FieldGroup>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
