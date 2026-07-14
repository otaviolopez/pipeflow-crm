"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { updateProfileName } from "@/lib/settings/actions";
import { createClient } from "@/lib/supabase/client";

const profileSchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório."),
});

type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    password: z.string().min(6, "Mínimo de 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileSettingsForm({ name, email }: { name: string; email: string }) {
  const { theme, setTheme } = useTheme();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ProfileValues) {
    const result = await updateProfileName(values.name);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    form.reset(values);
    toast.success("Perfil atualizado.");
  }

  async function onSubmitPassword(values: PasswordValues) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      toast.error("Não foi possível atualizar a senha. Tente novamente.");
      return;
    }
    passwordForm.reset();
    toast.success("Senha atualizada.");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{initials(form.watch("name") || name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
              </div>
            </div>

            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="profile-name">Nome</FieldLabel>
                <Input id="profile-name" {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="profile-email">E-mail</FieldLabel>
                <Input id="profile-email" value={email} disabled />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              disabled={!form.formState.isDirty || form.formState.isSubmitting}
            >
              Salvar alterações
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alterar senha</CardTitle>
        </CardHeader>
        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!passwordForm.formState.errors.password}>
                <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  {...passwordForm.register("password")}
                />
                <FieldError errors={[passwordForm.formState.errors.password]} />
              </Field>

              <Field data-invalid={!!passwordForm.formState.errors.confirmPassword}>
                <FieldLabel htmlFor="confirm-password">Confirmar nova senha</FieldLabel>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirmPassword")}
                />
                <FieldError errors={[passwordForm.formState.errors.confirmPassword]} />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              Atualizar senha
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tema</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => setTheme(option.value)}
            >
              <option.icon />
              {option.label}
              {theme === option.value && <Check className="ml-auto" />}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
