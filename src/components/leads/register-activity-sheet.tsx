"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ACTIVITY_TYPES } from "@/lib/leads/types";
import type { Activity, ActivityType } from "@/lib/leads/types";
import { cn } from "@/lib/utils";

const registerActivitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "note"]),
  description: z.string().trim().min(1, "Descreva o que aconteceu."),
});

type RegisterActivityValues = z.infer<typeof registerActivitySchema>;

export function RegisterActivitySheet({
  open,
  onOpenChange,
  onRegister,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (input: { type: ActivityType; description: string }) => Activity;
}) {
  const form = useForm<RegisterActivityValues>({
    resolver: zodResolver(registerActivitySchema),
    defaultValues: { type: "call", description: "" },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  }

  function onSubmit(values: RegisterActivityValues) {
    onRegister(values);
    toast.success("Atividade registrada.");
    form.reset();
    onOpenChange(false);
  }

  const selectedType = form.watch("type");

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Registrar atividade</SheetTitle>
          <SheetDescription>
            Fica salvo na timeline deste lead, visível para todo o workspace.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_TYPES.map((activityType) => (
                  <button
                    key={activityType.id}
                    type="button"
                    onClick={() => form.setValue("type", activityType.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selectedType === activityType.id
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-input text-muted-foreground hover:bg-muted"
                    )}
                    aria-pressed={selectedType === activityType.id}
                  >
                    {activityType.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="activity-description">Descrição</FieldLabel>
              <Textarea
                id="activity-description"
                placeholder="O que aconteceu nessa interação?"
                autoFocus
                {...form.register("description")}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>
          </FieldGroup>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit">Registrar</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
