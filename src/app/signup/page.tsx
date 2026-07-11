import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { signup } from "./actions";

export const metadata: Metadata = { title: "Criar conta — PiperFlow" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Criar conta"
      description="Comece a organizar suas vendas em poucos minutos."
      footer={
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4">
        {error && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
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
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
            <FieldDescription>Mínimo de 6 caracteres.</FieldDescription>
          </Field>
          <Button type="submit" formAction={signup} className="mt-1 w-full">
            Criar conta
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}
