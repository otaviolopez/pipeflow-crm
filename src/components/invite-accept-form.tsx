"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginAndAcceptInvite, signupAndAcceptInvite } from "@/app/invite/[token]/actions";

// Papéis do banco ficam em inglês (CLAUDE.md); a tradução é só de exibição.
const roleLabels = { admin: "Admin", member: "Membro" } as const;

export function InviteAcceptForm({
  token,
  role,
}: {
  token: string;
  role: keyof typeof roleLabels;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function acceptWithSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await signupAndAcceptInvite(token, formData);
      if (result?.error) setError(result.error);
    });
  }

  function acceptWithLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await loginAndAcceptInvite(token, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Badge variant="secondary" className="w-fit">
        Papel: {roleLabels[role]}
      </Badge>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

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
          <form onSubmit={acceptWithSignup} className="flex flex-col gap-4 pt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-email">E-mail</FieldLabel>
                <Input
                  id="create-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-password">Senha</FieldLabel>
                <Input
                  id="create-password"
                  name="password"
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
          <form onSubmit={acceptWithLogin} className="flex flex-col gap-4 pt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="login-password">Senha</FieldLabel>
                <Input
                  id="login-password"
                  name="password"
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
