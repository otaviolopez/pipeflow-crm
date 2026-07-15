// Container estreito e consistente para todas as telas de /settings/* —
// inclui a tela de Perfil (acessada pelo dropdown do avatar na topbar, fora
// das abas) além das 3 telas administrativas em (with-tabs). O shell
// (sidebar/topbar) já vem do layout do grupo (app).
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </div>
  );
}
