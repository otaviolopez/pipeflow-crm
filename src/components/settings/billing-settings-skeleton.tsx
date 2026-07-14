import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Espelha o layout real de billing-settings.tsx no plano Free (caminho mais
// comum): badge de preço, 2 barras de uso e o CTA de upgrade.
export function BillingSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          <span className="h-6 w-1 rounded-full bg-primary" aria-hidden />
          Plano
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie a assinatura deste workspace.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {["Colaboradores", "Leads"].map((label) => (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
          <Skeleton className="h-8 w-40" />
        </CardContent>
      </Card>
    </div>
  );
}
