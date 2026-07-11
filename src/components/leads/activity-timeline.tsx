import { Mail, MessageSquareText, Phone, StickyNote, Users } from "lucide-react";

import { formatRelativeDate } from "@/lib/leads/format";
import type { Activity, ActivityType } from "@/lib/leads/types";

const ICONS: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: StickyNote,
};

const LABELS: Record<ActivityType, string> = {
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  note: "Nota",
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
        <MessageSquareText className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Nenhuma atividade registrada.</p>
        <p className="text-sm text-muted-foreground">
          Registre a primeira interação com este lead.
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {activities.map((activity) => {
        const Icon = ICONS[activity.type];
        return (
          <li key={activity.id} className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium">{LABELS[activity.type]}</span>
                <span className="text-xs text-muted-foreground">
                  {activity.authorName} · {formatRelativeDate(activity.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
