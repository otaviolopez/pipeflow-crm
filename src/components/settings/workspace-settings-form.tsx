"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateWorkspaceName } from "@/lib/workspace/actions";
import type { WorkspaceRole } from "@/lib/workspace/session";

const workspaceSchema = z.object({
  name: z.string().trim().min(2, "O nome do workspace é obrigatório."),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

export function WorkspaceSettingsForm({
  name,
  currentUserRole,
}: {
  name: string;
  currentUserRole: WorkspaceRole | null;
}) {
  const isAdmin = currentUserRole === "admin";
  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name },
  });

  async function onSubmit(values: WorkspaceValues) {
    const result = await updateWorkspaceName(values.name);
    if (result.error) {
      toast.error(result.error);
      return;
    }
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
              <Input id="workspace-name" disabled={!isAdmin} {...form.register("name")} />
              <FieldError errors={[form.formState.errors.name]} />
              {!isAdmin && (
                <FieldDescription>
                  Somente administradores podem renomear o workspace.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            type="submit"
            disabled={!isAdmin || !form.formState.isDirty || form.formState.isSubmitting}
          >
            Salvar alterações
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
