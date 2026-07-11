// Container estreito e consistente para as 4 telas de /settings/* — o
// shell (sidebar/topbar) já vem do layout do grupo (app).
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
