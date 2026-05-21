import { Boxes, Package } from "lucide-react";

export function EstoquePanel() {
  return (
    <div className="relative lg:flex-1 text-white overflow-hidden flex flex-col justify-between p-10 lg:p-14 min-h-[280px]"
      style={{ background: "linear-gradient(135deg, #0a1f44 0%, #0f2d6b 50%, #1e3a8a 100%)" }}
    >
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      <FloatingBox className="top-16 right-12 w-20 h-20 rotate-12" />
      <FloatingBox className="bottom-32 right-32 w-14 h-14 -rotate-6" />
      <FloatingBox className="top-1/2 right-1/3 w-10 h-10 rotate-45" />

      <div className="relative flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-blue-400/20 border border-blue-300/30 flex items-center justify-center">
          <Boxes className="w-5 h-5 text-blue-200" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Estoque <span className="text-blue-300">PRO</span></span>
      </div>

      <div className="relative max-w-md">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-400/15 border border-blue-300/20 text-blue-200 mb-5">
          <Package className="w-3 h-3" /> by VEXO
        </div>
        <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]">
          Bem-vindo ao <br />Estoque <span className="text-blue-300">PRO</span>
        </h1>
        <p className="mt-4 text-blue-100/80 text-base leading-relaxed">
          Controle total do seu inventário com precisão de nível enterprise. Em tempo real, em todos os depósitos.
        </p>
      </div>

      <div className="relative grid grid-cols-3 gap-4 max-w-md">
        <Stat value="99.8%" label="Acurácia" />
        <Stat value="2.4M" label="SKUs ativos" />
        <Stat value="<50ms" label="Latência" />
      </div>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/60 mt-0.5">{label}</div>
    </div>
  );
}

export function FloatingBox({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Package className="w-1/2 h-1/2 text-white/40" strokeWidth={1.2} />
      </div>
    </div>
  );
}
