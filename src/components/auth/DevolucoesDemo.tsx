import { useEffect, useState } from "react";
import { Check, MousePointer2, Plus, ShieldAlert, Sparkles } from "lucide-react";

/** DevolucoesDemo — simulação visual em loop do Devoluções PRO (sem backend). */
const STEPS = [
  { id: "idle", ms: 900 },
  { id: "toNew", ms: 900 },
  { id: "clickNew", ms: 350 },
  { id: "typeOrder", ms: 1500 },
  { id: "pickReason", ms: 900 },
  { id: "toSave", ms: 700 },
  { id: "saved", ms: 1400 },
  { id: "ai", ms: 1900 },
  { id: "toDispute", ms: 800 },
  { id: "dispute", ms: 1500 },
  { id: "recovered", ms: 2000 },
] as const;
type StepId = (typeof STEPS)[number]["id"];
const TOTAL = STEPS.reduce((a, s) => a + s.ms, 0);

function useTimeline() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setT((performance.now() - start) % TOTAL), 50);
    return () => clearInterval(id);
  }, []);
  let acc = 0;
  for (let i = 0; i < STEPS.length; i++) {
    if (t < acc + STEPS[i].ms) return { step: STEPS[i].id as StepId, index: i, progress: (t - acc) / STEPS[i].ms };
    acc += STEPS[i].ms;
  }
  return { step: "idle" as StepId, index: 0, progress: 0 };
}

const ORDER = "250918SHP7XK4Q";
const CURSOR: Record<StepId, [number, number]> = {
  idle: [60, 80], toNew: [86, 17], clickNew: [86, 17], typeOrder: [50, 42],
  pickReason: [50, 58], toSave: [66, 74], saved: [66, 74], ai: [60, 60],
  toDispute: [84, 80], dispute: [84, 80], recovered: [40, 30],
};
const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const ROWS = [
  { id: "250917ML3Q", plat: "Mercado Livre", motivo: "Arrependimento", v: "R$ 89,90", st: "Aprovada", c: "bg-emerald-100 text-emerald-700" },
  { id: "250916SHP9", plat: "Shopee", motivo: "Defeito", v: "R$ 142,00", st: "Em análise", c: "bg-amber-100 text-amber-700" },
];

export function DevolucoesDemo() {
  const { step, index, progress } = useTimeline();
  const at = (id: StepId) => STEPS.findIndex((s) => s.id === id);
  const after = (id: StepId) => index >= at(id);

  const modalOpen = after("clickNew") && !after("saved");
  const typed = step === "typeOrder" ? ORDER.slice(0, Math.ceil(progress * ORDER.length)) : after("pickReason") ? ORDER : "";
  const reason = after("pickReason");
  const newRow = after("saved");
  const aiOpen = step === "ai" || step === "toDispute" || step === "dispute";
  const disputed = after("dispute");
  const recovered = after("recovered");
  const clicking = step === "clickNew" || (step === "saved" && progress < 0.2) || (step === "dispute" && progress < 0.15);
  const zoom =
    step === "typeOrder" || step === "pickReason" ? { s: 1.12, o: "50% 50%" }
    : step === "recovered" ? { s: 1.15, o: "30% 20%" }
    : step === "saved" ? { s: 1.12, o: "50% 85%" } : { s: 1, o: "50% 50%" };
  const [cx, cy] = CURSOR[step];

  return (
    <div className="relative w-full max-w-[520px]">
      <div className="mb-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-orange-100/80" style={mono}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        {after("ai") ? (after("dispute") ? "Disputa aberta · perda recuperada" : "IA detectou perda contestável") : "Registro de devolução"}
      </div>

      <div className="relative rounded-xl border border-white/20 bg-black/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-1.5 px-3 h-7 border-b border-white/10 bg-white/[0.04]">
          <span className="w-2 h-2 rounded-full bg-red-400/80" />
          <span className="w-2 h-2 rounded-full bg-amber-300/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-[9px] text-orange-100/60" style={mono}>devolucoes.vexodev.com.br</span>
        </div>

        <div className="relative h-[270px] overflow-hidden bg-slate-50 text-slate-900">
          <div className="absolute inset-0 p-3.5 transition-transform duration-700 ease-out" style={{ transform: `scale(${zoom.s})`, transformOrigin: zoom.o }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-bold tracking-tight">Dashboard de Devoluções</div>
                <div className="text-[8.5px] text-slate-500">Perdas, disputas e produtos mais devolvidos</div>
              </div>
              <span className={`inline-flex items-center gap-1 h-6 px-2 rounded-md bg-orange-600 text-white text-[9px] font-medium transition-all ${step === "clickNew" ? "scale-95 ring-4 ring-orange-300" : ""}`}>
                <Plus className="w-2.5 h-2.5" /> Registrar
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { l: "Perda real", v: recovered ? "R$ 1.020" : "R$ 1.210", c: "text-red-600" },
                { l: "Recuperado", v: recovered ? "R$ 2.379" : "R$ 2.189", c: "text-emerald-600" },
                { l: "Em disputa", v: disputed ? "4" : "3", c: "text-orange-600" },
              ].map((k) => (
                <div key={k.l} className={`rounded-md border border-slate-200 bg-white p-2 transition-all ${recovered && k.l !== "Em disputa" ? "ring-2 ring-emerald-300" : ""}`}>
                  <div className="text-[8px] uppercase tracking-wide text-slate-500">{k.l}</div>
                  <div className={`text-[13px] font-bold ${k.c}`} style={{ fontFeatureSettings: "'tnum'" }}>{k.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-md border border-slate-200 bg-white overflow-hidden">
              <div className="grid grid-cols-[1.3fr_1fr_1fr_.8fr_.9fr] px-2 py-1.5 text-[8px] font-semibold uppercase text-slate-500 bg-slate-50 border-b border-slate-200">
                <span>Pedido</span><span>Plataforma</span><span>Motivo</span><span>Valor</span><span>Status</span>
              </div>
              {newRow && (
                <Row id={ORDER.slice(0, 10)} plat="Shopee" motivo="Produto danificado" v="R$ 189,90"
                  st={disputed ? "Disputa" : "Perda"} c={disputed ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"} highlight />
              )}
              {ROWS.map((r) => <Row key={r.id} {...r} />)}
            </div>
          </div>

          {modalOpen && (
            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
              <div className="w-[70%] rounded-lg bg-white shadow-xl border border-slate-200 p-3 animate-in zoom-in-95 fade-in duration-200">
                <div className="text-[11px] font-bold">Registrar devolução</div>
                <label className="block mt-2 text-[8px] font-medium text-slate-500">ID do pedido · Shopee</label>
                <div className="h-6 mt-0.5 rounded border border-orange-400 ring-2 ring-orange-100 px-2 flex items-center text-[10px]" style={mono}>
                  {typed}{step === "typeOrder" && <span className="w-px h-3 bg-slate-800 animate-pulse ml-px" />}
                </div>
                <label className="block mt-2 text-[8px] font-medium text-slate-500">Motivo</label>
                <div className="h-6 mt-0.5 rounded border border-slate-200 px-2 flex items-center text-[10px]">
                  {reason ? "Produto danificado" : <span className="text-slate-400">Selecione…</span>}
                </div>
                <div className="mt-3 flex justify-end">
                  <span className={`h-6 px-3 rounded-md bg-orange-600 text-white text-[9px] font-medium inline-flex items-center ${step === "toSave" ? "ring-4 ring-orange-200" : ""}`}>Salvar</span>
                </div>
              </div>
            </div>
          )}

          {step === "saved" && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-emerald-600 text-white text-[9px] font-medium px-2 py-1 shadow-lg animate-in slide-in-from-top-2 fade-in">
              <Check className="w-3 h-3" /> Devolução registrada
            </div>
          )}

          {aiOpen && (
            <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-white border border-orange-200 shadow-xl p-2.5 animate-in slide-in-from-bottom-3 fade-in">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-700">
                <Sparkles className="w-3 h-3" /> Insight da IA
              </div>
              <p className="text-[9px] text-slate-600 mt-1">
                Pedido {ORDER.slice(0, 10)} chegou danificado pela transportadora — perda de <b>R$ 189,90</b> é contestável.
              </p>
              <div className="mt-2 flex justify-end">
                <span className={`h-6 px-2.5 rounded-md text-[9px] font-medium inline-flex items-center gap-1 transition-all ${disputed ? "bg-emerald-600 text-white" : "bg-orange-600 text-white"} ${step === "dispute" && progress < 0.2 ? "scale-95 ring-4 ring-orange-200" : ""}`}>
                  {disputed ? <><Check className="w-2.5 h-2.5" /> Disputa aberta</> : <><ShieldAlert className="w-2.5 h-2.5" /> Abrir disputa</>}
                </span>
              </div>
            </div>
          )}

          {recovered && (
            <div className="absolute top-3 right-3 rounded-md bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 shadow-lg animate-in zoom-in-90 fade-in">
              + R$ 189,90 recuperados
            </div>
          )}

          <div className="absolute pointer-events-none transition-all duration-700 ease-in-out" style={{ left: `${cx}%`, top: `${cy}%` }}>
            {clicking && <span className="absolute -left-2 -top-2 w-5 h-5 rounded-full bg-orange-500/40 animate-ping" />}
            <MousePointer2 className="w-4 h-4 text-slate-900 fill-white drop-shadow" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ id, plat, motivo, v, st, c, highlight }: { id: string; plat: string; motivo: string; v: string; st: string; c: string; highlight?: boolean }) {
  return (
    <div className={`grid grid-cols-[1.3fr_1fr_1fr_.8fr_.9fr] items-center px-2 py-1.5 text-[9px] border-b border-slate-100 last:border-0 ${highlight ? "bg-orange-50 animate-in fade-in slide-in-from-top-1" : ""}`}>
      <span style={mono}>{id}</span><span>{plat}</span><span className="truncate">{motivo}</span>
      <span style={{ fontFeatureSettings: "'tnum'" }}>{v}</span>
      <span className={`justify-self-start rounded px-1.5 py-0.5 text-[8px] font-semibold ${c}`}>{st}</span>
    </div>
  );
}
