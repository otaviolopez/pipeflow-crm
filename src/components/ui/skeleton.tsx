import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // Shimmer custom no lugar do animate-pulse padrão do shadcn — a
      // animação (e o fallback de prefers-reduced-motion) vive na @utility
      // skeleton-shimmer em globals.css.
      className={cn("skeleton-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
