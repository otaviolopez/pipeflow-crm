import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Piperflow CRM</h1>
        <p className="text-sm text-gray-500">Entre ou crie sua conta</p>
      </div>

      {error && (
        <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-md bg-blue-100 p-3 text-sm text-blue-700">
          {notice}
        </p>
      )}

      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Senha
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded-md border px-3 py-2"
          />
        </label>

        <div className="mt-2 flex gap-3">
          <button
            formAction={login}
            className="flex-1 rounded-md bg-black px-3 py-2 text-white cursor-pointer"
          >
            Entrar
          </button>
          <button
            formAction={signup}
            className="flex-1 rounded-md border px-3 py-2 cursor-pointer"
          >
            Criar conta
          </button>
        </div>
      </form>
    </main>
  );
}
