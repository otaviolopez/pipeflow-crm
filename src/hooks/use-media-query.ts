import * as React from "react"

// Versão genérica de use-mobile.ts: observa qualquer media query via
// useSyncExternalStore. `serverFallback` é o valor assumido no SSR, onde não
// existe viewport para consultar.
export function useMediaQuery(query: string, serverFallback = false) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query]
  )

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverFallback
  )
}
