import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16: a convenção `middleware.ts` foi renomeada para `proxy.ts` e, num
// projeto com diretório src/, o arquivo precisa ficar em src/ (mesmo nível do
// app/) — na raiz do repositório ele é ignorado silenciosamente.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
