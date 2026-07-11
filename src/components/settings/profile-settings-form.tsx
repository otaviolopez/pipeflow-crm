"use client";

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
import { CURRENT_USER } from "@/lib/settings/mock-data";

const profileSchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório."),
});

type ProfileValues = z.infer<typeof profileSchema>;

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

export function ProfileSettingsForm() {
  const { theme, setTheme } = useTheme();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: CURRENT_USER.name },
  });

  function onSubmit(values: ProfileValues) {
    // Mock: Server Action de verdade só quando o perfil for conectado ao
    // Supabase (Fase 2).
    form.reset(values);
    toast.success("Perfil atualizado.");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{initials(form.watch("name") || CURRENT_USER.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{CURRENT_USER.name}</span>
                <span className="text-xs text-muted-foreground">{CURRENT_USER.email}</span>
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
                <Input id="profile-email" value={CURRENT_USER.email} disabled />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={!form.formState.isDirty}>
              Salvar alterações
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
