import { ArrowUpRight, CheckCircle2, LineChart, ShieldCheck, Wallet } from "lucide-react";

/**
 * FinanceiroPanel — Identidade FocoFinanceiro (VEXO Enterprise Clean).
 * Paleta: Emerald (crescimento) · Slate. Tipografia: Sora/Manrope.
 */
export function FinanceiroPanel() {
  return (
    <div
      className="relative lg:flex-1 overflow-hidden flex flex-col justify-between p-10 lg:p-14 min-h-[320px] text-white"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, #10b981 0%, #059669 38%, #047857 70%, #064e3b 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.16] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
        }}
      />

      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[280px] h-[280px] rounded-full bg-lime-300/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <Wallet className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">
              Foco<span className="font-bold">Financeiro</span>
            </span>
            <span
              className="text-[10px] text-emerald-100/70 mt-1 tracking-[0.18em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
            >
              by &gt; VEXO
            </span>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-emerald-50">
          <ShieldCheck className="w-3 h-3" />
          Dados criptografados
        </div>
      </div>

      <div className="relative z-10 max-w-md">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-emerald-50 mb-6 uppercase tracking-wider">
          <LineChart className="w-3 h-3" /> Personal Finance OS
        </div>
        <h1 className="text-[40px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.02]">
          Sua vida financeira
          <br />
          <span className="text-white/70">com clareza</span>
          <br />
          mês a mês.
        </h1>
        <p className="mt-5 text-emerald-50/80 text-[15px] leading-relaxed max-w-sm">
          Estimado vs real, metas, dívidas e calendário de contas — com um coach
          IA que entende os seus números.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-emerald-50/90">
          {[
            "Orçamento estimado vs real, sem planilhas",
            "Metas e dívidas com projeção automática",
            "Coach IA que te ajuda a decidir",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-lime-200 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 grid gap-4">
        <div className="rounded-lg bg-white/[0.06] border border-white/15 backdrop-blur-md p-4 max-w-sm shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/70"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
            >
              mês · novembro
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-lime-200">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-300 animate-pulse" />
              no azul
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Metric value="R$ 8.240" label="Receitas" />
            <Metric value="R$ 5.910" label="Despesas" delta="-4.2%" />
            <Metric value="28%" label="Poupado" />
          </div>
        </div>

        <p
          className="text-[10px] text-emerald-100/50 tracking-[0.22em] uppercase"
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
        className="text-[20px] font-semibold tracking-tight text-white"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-emerald-100/60 mt-1">
        {label}
      </div>
      {delta && (
        <div className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-lime-200">
          <ArrowUpRight className="w-2.5 h-2.5" />
          {delta}
        </div>
      )}
    </div>
  );
}
