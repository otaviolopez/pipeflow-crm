"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const onboardingSchema = z.object({
  workspaceName: z.string().trim().min(2, "Informe um nome para o workspace."),
  invites: z.array(
    z.object({
      email: z.string().trim().email("E-mail inválido.").or(z.literal("")),
    })
  ),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { workspaceName: "", invites: [{ email: "" }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invites",
  });

  async function goToStep2() {
    const valid = await form.trigger("workspaceName");
    if (valid) setStep(2);
  }

  function finish(values: OnboardingValues) {
    startTransition(() => {
      // TODO(M9): trocar por Server Action que cria o workspace de verdade e
      // dispara os convites via Resend. Por enquanto a tela é só visual
      // (plan.md, Fase 1 — interface com dados mockados).
      const pendingInvites = values.invites.filter(
        (invite) => invite.email.trim() !== ""
      );
      toast.success(
        pendingInvites.length > 0
          ? `Workspace "${values.workspaceName}" criado. ${pendingInvites.length} convite(s) serão enviados.`
          : `Workspace "${values.workspaceName}" criado.`
      );
      router.push("/pipeline");
    });
  }

  function skipInvites() {
    finish(form.getValues());
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <p className="text-xs font-medium text-muted-foreground">
          Passo {step} de 2
        </p>
        <CardTitle className="text-xl">
          {step === 1 ? "Crie seu workspace" : "Convide colaboradores"}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? "O workspace é o espaço da sua empresa ou do seu cliente no PiperFlow."
            : "Convide quem também vai trabalhar nesse workspace. Você pode pular e convidar depois."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(finish)}>
        <CardContent>
          {step === 1 ? (
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.workspaceName}>
                <FieldLabel htmlFor="workspaceName">Nome do workspace</FieldLabel>
                <Input
                  id="workspaceName"
                  placeholder="Ex.: Minha Empresa"
                  autoFocus
                  {...form.register("workspaceName")}
                />
                <FieldError errors={[form.formState.errors.workspaceName]} />
              </Field>
            </FieldGroup>
          ) : (
            <FieldGroup>
              {fields.map((field, index) => (
                <Field
                  key={field.id}
                  orientation="horizontal"
                  data-invalid={!!form.formState.errors.invites?.[index]?.email}
                >
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="email@colaborador.com"
                      {...form.register(`invites.${index}.email` as const)}
                    />
                    <FieldError
                      errors={[form.formState.errors.invites?.[index]?.email]}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remover e-mail"
                      onClick={() => remove(index)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </Field>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => append({ email: "" })}
              >
                <Plus />
                Adicionar outro e-mail
              </Button>
              <FieldDescription>
                Opcional — você pode convidar colaboradores depois em
                Configurações.
              </FieldDescription>
            </FieldGroup>
          )}
        </CardContent>

        <CardFooter>
          {step === 1 ? (
            <Button type="button" className="ml-auto" onClick={goToStep2}>
              Continuar
            </Button>
          ) : (
            <div className="flex w-full items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={skipInvites}
                disabled={isPending}
              >
                Pular
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Criando..." : "Concluir"}
              </Button>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
