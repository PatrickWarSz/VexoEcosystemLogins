import { RotateCcw, Truck } from "lucide-react";
import { Stat } from "./EstoquePanel";

export function DevolucoesPanel() {
  return (
    <div className="relative lg:flex-1 text-white overflow-hidden flex flex-col justify-between p-10 lg:p-14 min-h-[280px]"
      style={{ background: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)" }}
    >
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(ellipse at top right, rgba(255,200,100,.4), transparent 60%)",
      }} />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-2 border-white/10" />
      <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full border-2 border-white/10" />
      <RotateCcw className="absolute top-24 right-16 w-16 h-16 text-white/15 -rotate-12" strokeWidth={1.2} />
      <Truck className="absolute bottom-40 right-1/3 w-12 h-12 text-white/20" strokeWidth={1.5} />

      <div className="relative flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
          <RotateCcw className="w-5 h-5 text-orange-100" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Devoluções</span>
      </div>

      <div className="relative max-w-md">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-orange-50 mb-5">
          <Truck className="w-3 h-3" /> by VEXO
        </div>
        <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]">
          Logística Reversa <br />Inteligente
        </h1>
        <p className="mt-4 text-orange-50/90 text-base leading-relaxed">
          Automação completa do ciclo de devoluções — do pedido ao reembolso — com rastreio ponta a ponta.
        </p>
      </div>

      <div className="relative grid grid-cols-3 gap-4 max-w-md">
        <Stat value="-62%" label="Tempo de ciclo" />
        <Stat value="4.9★" label="CSAT pós-venda" />
        <Stat value="180+" label="Transportadoras" />
      </div>
    </div>
  );
}
