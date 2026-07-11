"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { WORKSPACE_NAME_DEFAULT } from "@/lib/settings/mock-data";

const workspaceSchema = z.object({
  name: z.string().trim().min(2, "O nome do workspace é obrigatório."),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

export function WorkspaceSettingsForm() {
  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: WORKSPACE_NAME_DEFAULT },
  });

  function onSubmit(values: WorkspaceValues) {
    // Mock: Server Action de verdade só no M9 (createWorkspace/updateWorkspace).
    form.reset(values);
    toast.success("Workspace atualizado.");
  }

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="workspace-name">Nome do workspace</FieldLabel>
              <Input id="workspace-name" {...form.register("name")} />
              <FieldError errors={[form.formState.errors.name]} />
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
  );
}
