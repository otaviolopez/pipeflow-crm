"use client";

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
import type { Member } from "@/lib/settings/types";

// Microcopy exata da Seção 9.5 do PRD.
export function RemoveMemberDialog({
  member,
  onConfirm,
  onCancel,
}: {
  member: Member | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AlertDialog open={!!member} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover {member?.name} da equipe?</AlertDialogTitle>
          <AlertDialogDescription>
            Ele perderá acesso imediatamente a este workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
