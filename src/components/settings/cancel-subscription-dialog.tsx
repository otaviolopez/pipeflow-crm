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
import { FREE_PLAN_LEAD_LIMIT } from "@/lib/leads/types";
import { FREE_PLAN_MEMBER_LIMIT } from "@/lib/settings/types";

// Microcopy exata da Seção 9.5 do PRD.
export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  expiresAtLabel,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expiresAtLabel: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
          <AlertDialogDescription>
            Você manterá acesso ao Pro até {expiresAtLabel}. Após essa data, o
            workspace volta ao plano Free ({FREE_PLAN_MEMBER_LIMIT} colaboradores,{" "}
            {FREE_PLAN_LEAD_LIMIT} leads).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Manter Pro</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Cancelando..." : "Cancelar assinatura"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
