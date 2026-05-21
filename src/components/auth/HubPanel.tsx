export function HubPanel() {
  return (
    <div className="relative lg:flex-1 bg-neutral-950 text-white overflow-hidden flex flex-col justify-between p-10 lg:p-14 min-h-[280px]">
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-white text-neutral-950 flex items-center justify-center font-bold">V</div>
        <span className="text-lg font-semibold tracking-tight">VEXO</span>
      </div>

      <div className="relative max-w-md">
        <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]">
          A plataforma que conecta sua operação.
        </h1>
        <p className="mt-4 text-neutral-400 text-base leading-relaxed">
          Um ecossistema unificado para gestão, logística e inteligência operacional — projetado para times que não aceitam o suficiente.
        </p>
      </div>

      <div className="relative flex items-center gap-6 text-xs text-neutral-500">
        <span>© 2026 VEXO</span>
        <span className="w-px h-3 bg-neutral-800" />
        <span>Enterprise Grade</span>
      </div>
    </div>
  );
}
