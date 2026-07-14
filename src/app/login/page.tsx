import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

import { login } from "./actions";

export const metadata: Metadata = { title: "Entrar — PiperFlow" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; inviteToken?: string }>;
}) {
  const { error, notice, inviteToken } = await searchParams;

  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta para continuar."
      footer={
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4">
        {inviteToken && (
          <input type="hidden" name="inviteToken" value={inviteToken} />
        )}
        {error && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground"
          >
            {notice}
          </p>
        )}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              minLength={6}
              required
            />
          </Field>
          <Button type="submit" formAction={login} className="mt-1 w-full">
            Entrar
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}
