// Conteúdo provisório das telas do shell (M1). Cada página troca este
// placeholder pela tela real no seu milestone (M4-M7).
export function PagePlaceholder({
  title,
  milestone,
}: {
  title: string
  milestone: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">
        Tela em construção — será implementada no {milestone}.
      </p>
    </div>
  )
}
