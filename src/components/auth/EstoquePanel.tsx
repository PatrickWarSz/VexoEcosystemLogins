import { ArrowUpRight, Boxes, CheckCircle2, Package, ShieldCheck } from "lucide-react";

/**
 * EstoquePanel — Identidade VEXO "Enterprise Clean"
 * Paleta: Azul Confiança #2563EB · Slate #64748B · Surface #F8FAFC
 * Tipografia: Inter (UI) · JetBrains Mono (tagline/dados)
 * Border radius: 4px (inputs) · 8px (módulos)
 */
export function EstoquePanel() {
  return (
    <div
      className="relative lg:flex-1 overflow-hidden flex flex-col justify-between p-10 lg:p-14 min-h-[320px] text-white"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, #2f6df0 0%, #2563EB 38%, #1d4ed8 70%, #1e3a8a 100%)",
      }}
    >
      {/* Grid técnico sutil */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
        }}
      />

      {/* Brilho luminoso (Enterprise Clean) */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[280px] h-[280px] rounded-full bg-cyan-300/15 blur-3xl pointer-events-none" />

      {/* Header / Logo */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <Boxes className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">
              Estoque <span className="font-bold">PRO</span>
            </span>
            <span
              className="text-[10px] text-blue-100/70 mt-1 tracking-[0.18em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
            >
              by &gt; VEXO
            </span>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-blue-50">
          <ShieldCheck className="w-3 h-3" />
          SOC 2 · ISO 27001
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 max-w-md">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-blue-50 mb-6 uppercase tracking-wider">
          <Package className="w-3 h-3" /> Inventory OS
        </div>
        <h1 className="text-[40px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.02]">
          Controle de estoque
          <br />
          <span className="text-white/70">com precisão</span>
          <br />
          de engenharia.
        </h1>
        <p className="mt-5 text-blue-50/80 text-[15px] leading-relaxed max-w-sm">
          A plataforma que substitui planilhas por inteligência operacional —
          em tempo real, em todos os depósitos.
        </p>

        {/* Lista de provas */}
        <ul className="mt-6 space-y-2 text-sm text-blue-50/90">
          {[
            "Sincronização multi-canal em < 50ms",
            "Auditoria contínua e logs imutáveis",
            "Integrações nativas com seu ERP",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-cyan-200 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card de dados (mockup) */}
      <div className="relative z-10 grid gap-4">
        <div className="rounded-lg bg-white/[0.06] border border-white/15 backdrop-blur-md p-4 max-w-sm shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-blue-100/70"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
            >
              live · warehouse_01
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              online
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Metric value="99.8%" label="Acurácia" />
            <Metric value="2.4M" label="SKUs ativos" delta="+12.4%" />
            <Metric value="<50ms" label="Latência" />
          </div>
        </div>

        <p
          className="text-[10px] text-blue-100/50 tracking-[0.22em] uppercase"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          powered by &gt; VEXO &lt;
        </p>
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  delta,
}: {
  value: string;
  label: string;
  delta?: string;
}) {
  return (
    <div>
      <div
        className="text-[22px] font-semibold tracking-tight text-white"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-blue-100/60 mt-1">
        {label}
      </div>
      {delta && (
        <div className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-emerald-200">
          <ArrowUpRight className="w-2.5 h-2.5" />
          {delta}
        </div>
      )}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/60 mt-0.5">
        {label}
      </div>
    </div>
  );
}

export function FloatingBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Package className="w-1/2 h-1/2 text-white/40" strokeWidth={1.2} />
      </div>
    </div>
  );
}
