"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

// Única confirmação exigida no drag-and-drop do pipeline — mover entre
// etapas intermediárias não pede confirmação (PRD, Seção 6.2).
export function LostConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = React.useState("");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onCancel();
      setReason("");
    }
  }

  function handleConfirm() {
    onConfirm(reason);
    setReason("");
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Marcar este negócio como perdido?</AlertDialogTitle>
          <AlertDialogDescription>
            Você pode registrar o motivo (opcional).
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field>
          <FieldLabel htmlFor="lost-reason">Motivo (opcional)</FieldLabel>
          <Textarea
            id="lost-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ex.: Cliente optou por outro fornecedor."
          />
        </Field>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Marcar como perdido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
