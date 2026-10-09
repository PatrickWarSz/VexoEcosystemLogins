import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { DevolucoesDemo } from "./DevolucoesDemo";

const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

export function DevolucoesPanel() {
  return (
    <div
      className="relative lg:flex-1 overflow-hidden flex flex-col justify-between p-10 lg:p-14 min-h-[320px] text-white"
      style={{ background: "radial-gradient(120% 80% at 0% 0%, #fb923c 0%, #ea580c 38%, #c2410c 70%, #7c2d12 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.16] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
        }}
      />
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[280px] h-[280px] rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <RotateCcw className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">Devoluções <span className="font-bold">PRO</span></span>
            <span className="text-[10px] text-orange-100/70 mt-1 tracking-[0.18em] uppercase" style={mono}>by &gt; VEXO</span>
          </div>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-orange-50">
          <ShieldCheck className="w-3 h-3" /> Dados criptografados
        </div>
      </div>

      <div className="relative z-10 max-w-md">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-orange-50 mb-6 uppercase tracking-wider">
          <Truck className="w-3 h-3" /> Logística Reversa
        </div>
        <h1 className="text-[34px] lg:text-[42px] font-semibold tracking-[-0.03em] leading-[1.05]">
          Logística Reversa Inteligente
          <br />
          <span className="text-white/70">cada devolução, sob controle.</span>
        </h1>
        <p className="mt-5 text-orange-50/85 text-[15px] leading-relaxed max-w-sm">
          Registre devoluções, identifique perdas contestáveis com IA e recupere dinheiro em disputas.
        </p>
      </div>

      <div className="relative z-10 grid gap-4 my-8">
        <DevolucoesDemo />
        <p className="text-[10px] text-orange-100/50 tracking-[0.22em] uppercase" style={mono}>powered by &gt; VEXO &lt;</p>
      </div>
    </div>
  );
}
