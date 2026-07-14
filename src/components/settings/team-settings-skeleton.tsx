import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Espelha o layout real de team-settings.tsx: 2-3 linhas de membro (largura
// aproximada de nome/e-mail reais), mesmo grid e divisores.
const MEMBER_ROW_PLACEHOLDERS = [
  { name: "w-28", email: "w-40" },
  { name: "w-20", email: "w-32" },
];

export function TeamSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
            <span className="h-6 w-1 rounded-full bg-primary" aria-hidden />
            Equipe
          </h1>
          <Skeleton className="mt-1 h-4 w-48" />
        </div>
        <Button disabled>Convidar membro</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Membros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border px-0">
          {MEMBER_ROW_PLACEHOLDERS.map((row, index) => (
            <div key={index} className="flex items-center justify-between gap-3 px-6 py-2.5">
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback>
                    <Skeleton className="size-full rounded-full" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <Skeleton className={`h-4 ${row.name}`} />
                  <Skeleton className={`h-3 ${row.email}`} />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
