"use client";

import * as React from "react";
import { MoreVertical, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeDate } from "@/lib/leads/format";
import { removeMember } from "@/lib/settings/actions";
import { FREE_PLAN_MEMBER_LIMIT, ROLE_LABELS } from "@/lib/settings/types";
import type { Invite, Member } from "@/lib/settings/types";

import { InviteMemberDialog } from "./invite-member-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TeamSettings({
  members,
  invites,
  currentUserId,
  isFreePlan,
}: {
  members: Member[];
  invites: Invite[];
  currentUserId: string;
  isFreePlan: boolean;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<Member | null>(null);

  const isAtLimit = isFreePlan && members.length + invites.length >= FREE_PLAN_MEMBER_LIMIT;

  function handleRemoveConfirm() {
    if (!memberToRemove) return;
    const target = memberToRemove;
    startTransition(async () => {
      const result = await removeMember(target.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Membro removido da equipe.");
    });
    setMemberToRemove(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equipe</h1>
          <p className="text-sm text-muted-foreground">
            {members.length}/{FREE_PLAN_MEMBER_LIMIT} colaboradores no plano Free.
          </p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)}>
          <UserPlus />
          Convidar membro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Membros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border px-0">
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            return (
              <div key={member.id} className="flex items-center justify-between gap-3 px-6 py-2.5">
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {member.name}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(você)</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                  {!isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Mais ações para ${member.name}`}
                          />
                        }
                      >
                        <MoreVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setMemberToRemove(member)}
                        >
                          Remover da equipe
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Empty state — microcopy exata da Seção 9.5 do PRD, mostrada quando
          só o Admin está no workspace. */}
      {members.length === 1 && (
        <p className="text-sm text-muted-foreground">
          Você está sozinho por enquanto. Convide colaboradores para vender junto.
        </p>
      )}

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Convites pendentes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border px-0">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-3 px-6 py-2.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{invite.email}</span>
                  <span className="text-xs text-muted-foreground">
                    Aguardando aceite · {formatRelativeDate(invite.createdAt)}
                  </span>
                </div>
                <Badge variant="outline">{ROLE_LABELS[invite.role]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <InviteMemberDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        isAtLimit={isAtLimit}
      />
      <RemoveMemberDialog
        member={memberToRemove}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setMemberToRemove(null)}
        isPending={isPending}
      />
    </div>
  );
}
