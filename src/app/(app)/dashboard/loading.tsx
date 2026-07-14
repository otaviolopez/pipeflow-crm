import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

// O App Router embrulha page.tsx num <Suspense> automático usando este
// arquivo como fallback: aparece na hora ao navegar pra /dashboard,
// enquanto o Server Component espera as queries do Supabase.
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
