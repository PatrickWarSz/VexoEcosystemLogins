import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { Check, MousePointer2, Plus, QrCode, ScanLine, Settings, Smartphone } from "lucide-react";

/**
 * EstoqueDemo — simulação animada (em loop) do Estoque PRO.
 * Mostra: cadastro de matéria-prima → etiqueta QR Code → leitura no celular → baixa no estoque.
 * Tudo visual, sem nenhuma chamada de backend.
 */

const STEPS = [
  { id: "idle", ms: 900 },
  { id: "toNew", ms: 900 },
  { id: "clickNew", ms: 350 },
  { id: "typeName", ms: 1500 },
  { id: "typeQty", ms: 800 },
  { id: "toSave", ms: 700 },
  { id: "saved", ms: 1400 },
  { id: "toQr", ms: 800 },
  { id: "label", ms: 1900 },
  { id: "scan", ms: 1700 },
  { id: "scanOk", ms: 1700 },
  { id: "updated", ms: 2000 },
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

const NAME = "Aço Inox 304 – Chapa";
const QTY = "120";

const CURSOR: Record<StepId, [number, number]> = {
  idle: [62, 78],
  toNew: [88, 17],
  clickNew: [88, 17],
  typeName: [50, 42],
  typeQty: [50, 58],
  toSave: [66, 74],
  saved: [66, 74],
  toQr: [91, 82],
  label: [91, 82],
  scan: [91, 82],
  scanOk: [91, 82],
  updated: [55, 82],
};

const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

export function EstoqueDemo() {
  const { step, index, progress } = useTimeline();
  const at = (id: StepId) => STEPS.findIndex((s) => s.id === id);
  const after = (id: StepId) => index >= at(id);

  const modalOpen = after("clickNew") && !after("saved");
  const typedName =
    step === "typeName" ? NAME.slice(0, Math.ceil(progress * NAME.length)) : after("typeQty") ? NAME : "";
  const typedQty = step === "typeQty" ? QTY.slice(0, Math.ceil(progress * QTY.length)) : after("toSave") ? QTY : "";
  const newRow = after("saved");
  const qty = after("updated") ? 100 : 120;
  const labelOpen = step === "label";
  const phoneOpen = step === "scan" || step === "scanOk";
  const clicking = step === "clickNew" || (step === "saved" && progress < 0.2) || (step === "label" && progress < 0.15);

  // Zoom "de câmera" focando nas ações
  const zoom =
    step === "typeName" || step === "typeQty"
      ? { s: 1.12, o: "50% 50%" }
      : step === "saved" || step === "updated"
        ? { s: 1.15, o: "50% 85%" }
        : { s: 1, o: "50% 50%" };

  const [cx, cy] = CURSOR[step];

  return (
    <div className="relative w-full max-w-[520px]">
      {/* Legenda da cena */}
      <div className="mb-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-blue-100/80" style={mono}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        {after("label") ? (after("scan") ? "Scanner · baixa pelo celular" : "Etiqueta QR Code gerada") : "Cadastro de matéria-prima"}
      </div>

      <div className="relative rounded-xl border border-white/20 bg-slate-950/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md">
        {/* Barra de janela */}
        <div className="flex items-center gap-1.5 px-3 h-7 border-b border-white/10 bg-white/[0.04]">
          <span className="w-2 h-2 rounded-full bg-red-400/80" />
          <span className="w-2 h-2 rounded-full bg-amber-300/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-[9px] text-blue-100/60" style={mono}>estoque.vexodev.com.br</span>
        </div>

        <div className="relative h-[270px] overflow-hidden bg-slate-50 text-slate-900">
          <div
            className="absolute inset-0 p-3.5 transition-transform duration-700 ease-out"
            style={{ transform: `scale(${zoom.s})`, transformOrigin: zoom.o }}
          >
            {/* Header da página (igual ao app) */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-bold tracking-tight">Controle de Estoque</div>
                <div className="text-[8.5px] text-slate-500">Gerencie seu estoque de matéria prima</div>
              </div>
              <div className="flex gap-1.5">
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-slate-200 bg-white text-[9px] font-medium">
                  <Settings className="w-2.5 h-2.5" /> Categorias
                </span>
                <span
                  className={`inline-flex items-center gap-1 h-6 px-2 rounded-md bg-blue-600 text-white text-[9px] font-medium transition-all ${
                    step === "clickNew" ? "scale-95 ring-4 ring-blue-300/60" : ""
                  }`}
                >
                  <Plus className="w-2.5 h-2.5" /> Novo Item
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <StatCard label="Total" value={newRow ? "48" : "47"} tone="slate" />
              <StatCard label="Garantido" value={newRow ? "39" : "38"} tone="emerald" />
              <StatCard label="Baixo" value="6" tone="amber" />
              <StatCard label="Zerado" value="3" tone="red" />
            </div>

            {/* Tabela */}
            <div className="mt-3 rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="grid grid-cols-[1fr_60px_56px_24px] px-2.5 py-1.5 text-[8px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <span>Item</span><span>Qtd.</span><span>Status</span><span />
              </div>
              <Row name="Parafuso Sextavado M8" qty="2.400 un" status="Garantido" />
              <Row name="Tinta Epóxi Cinza" qty="12 L" status="Baixo" />
              {newRow ? (
                <Row
                  name={NAME}
                  qty={`${qty} kg`}
                  status="Garantido"
                  highlight={step === "saved" || step === "updated"}
                  qrActive={step === "toQr" || step === "label"}
                  delta={step === "updated" ? "-20 kg" : undefined}
                />
              ) : (
                <Row name="Tubo Galvanizado 1”" qty="80 m" status="Garantido" />
              )}
            </div>
          </div>

          {/* Modal Novo Item */}
          <Overlay open={modalOpen}>
            <div className="w-[78%] rounded-lg bg-white shadow-2xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-semibold">Novo Item</div>
              <div className="text-[8.5px] text-slate-500 mb-2.5">Cadastre a matéria-prima no estoque</div>
              <Field label="Nome do item" value={typedName} active={step === "typeName"} />
              <Field label="Quantidade (kg)" value={typedQty} active={step === "typeQty"} />
              <div className="flex justify-end gap-1.5 mt-2.5">
                <span className="h-6 px-2.5 inline-flex items-center rounded-md border border-slate-200 text-[9px]">Cancelar</span>
                <span className={`h-6 px-2.5 inline-flex items-center rounded-md bg-blue-600 text-white text-[9px] font-medium transition ${step === "toSave" ? "ring-4 ring-blue-300/60" : ""}`}>
                  Salvar item
                </span>
              </div>
            </div>
          </Overlay>

          {/* Toast salvo */}
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-md bg-emerald-600 text-white text-[9px] font-medium px-2.5 py-1.5 shadow-lg transition-all duration-300 ${
              step === "saved" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            <Check className="w-3 h-3" /> Item salvo no estoque
          </div>

          {/* Etiqueta QR */}
          <Overlay open={labelOpen}>
            <div className="rounded-lg bg-white shadow-2xl border border-slate-200 p-3 flex gap-3 items-center scale-110">
              <FakeQR size={92} />
              <div className="text-[9px] leading-tight">
                <div className="text-[8px] uppercase tracking-wider text-slate-400" style={mono}>Etiqueta · Lote 0921</div>
                <div className="font-semibold text-[11px] mt-1">{NAME}</div>
                <div className="text-slate-500 mt-0.5">SKU-AI304 · 120 kg</div>
                <div className="mt-2 inline-flex items-center gap-1 rounded bg-blue-600 text-white px-1.5 py-0.5 text-[8px]">
                  <QrCode className="w-2.5 h-2.5" /> Pronta p/ imprimir
                </div>
              </div>
            </div>
          </Overlay>

          {/* Celular escaneando */}
          <Overlay open={phoneOpen} dark>
            <div className="relative w-[118px] h-[232px] rounded-[22px] bg-slate-900 border-[3px] border-slate-700 shadow-2xl p-1.5">
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-slate-700" />
              <div className="h-full w-full rounded-[16px] bg-slate-800 overflow-hidden flex flex-col items-center pt-5 px-2 text-white">
                <div className="flex items-center gap-1 text-[8px] text-blue-200" style={mono}>
                  <ScanLine className="w-2.5 h-2.5" /> Scanner
                </div>
                <div className="relative mt-2 rounded-md bg-white p-1.5">
                  <FakeQR size={66} />
                  {step === "scan" && (
                    <div
                      className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)]"
                      style={{ top: `${10 + progress * 80}%` }}
                    />
                  )}
                  <span className="absolute -inset-1 border-2 border-blue-400 rounded-md" />
                </div>
                {step === "scanOk" ? (
                  <div className="mt-2.5 w-full rounded-md bg-white text-slate-900 p-1.5 text-[7.5px] leading-tight animate-in fade-in zoom-in-95">
                    <div className="font-semibold text-[8px] truncate">{NAME}</div>
                    <div className="flex gap-1 mt-1">
                      <span className="flex-1 text-center rounded bg-slate-100 py-0.5">Entrada</span>
                      <span className="flex-1 text-center rounded bg-red-500 text-white py-0.5 font-semibold">Baixa</span>
                    </div>
                    <div className="mt-1 flex items-center gap-0.5 text-emerald-600 font-semibold">
                      <Check className="w-2.5 h-2.5" /> -20 kg registrado
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-[7.5px] text-slate-300 text-center">Aponte para a etiqueta</div>
                )}
              </div>
            </div>
            <div className="ml-3 max-w-[150px] text-[9px] text-white/90 leading-snug">
              <Smartphone className="w-3.5 h-3.5 mb-1 text-blue-300" />
              O funcionário escaneia a etiqueta e dá <b>baixa ou entrada</b> na hora, direto do celular.
            </div>
          </Overlay>

          {/* Cursor virtual */}
          <div
            className={`absolute z-30 pointer-events-none transition-all duration-700 ease-in-out ${phoneOpen ? "opacity-0" : "opacity-100"}`}
            style={{ left: `${cx}%`, top: `${cy}%` }}
          >
            {clicking && <span className="absolute -left-3 -top-3 w-7 h-7 rounded-full bg-blue-500/40 animate-ping" />}
            <MousePointer2
              className={`w-4 h-4 fill-slate-900 text-white drop-shadow transition-transform ${clicking ? "scale-75" : ""}`}
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Overlay({ open, dark, children }: { open: boolean; dark?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 ${
        dark ? "bg-slate-950/85" : "bg-slate-900/30 backdrop-blur-[1px]"
      } ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className={`flex items-center transition-transform duration-300 ${open ? "scale-100" : "scale-95"}`}>{children}</div>
    </div>
  );
}

function Field({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="mb-2">
      <div className="text-[8px] font-medium text-slate-600 mb-1">{label}</div>
      <div className={`h-6 rounded border px-2 flex items-center text-[9.5px] ${active ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`}>
        {value}
        {active && <span className="ml-px w-px h-3 bg-slate-900 animate-pulse" />}
      </div>
    </div>
  );
}

const TONES = {
  slate: "text-slate-900",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  red: "text-red-600",
};

function StatCard({ label, value, tone }: { label: string; value: string; tone: keyof typeof TONES }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
      <div className="text-[7.5px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`text-[13px] font-bold tabular-nums ${TONES[tone]}`}>{value}</div>
    </div>
  );
}

function Row({
  name, qty, status, highlight, qrActive, delta,
}: { name: string; qty: string; status: "Garantido" | "Baixo"; highlight?: boolean; qrActive?: boolean; delta?: string }) {
  return (
    <div
      className={`grid grid-cols-[1fr_60px_56px_24px] items-center px-2.5 py-1.5 text-[9.5px] border-b border-slate-100 last:border-0 transition-colors duration-500 ${
        highlight ? "bg-blue-50" : ""
      }`}
    >
      <span className="truncate font-medium pr-2">{name}</span>
      <span className="tabular-nums relative">
        {qty}
        {delta && <span className="absolute -top-2 left-8 text-[8px] font-bold text-red-500 animate-in fade-in slide-in-from-bottom-1">{delta}</span>}
      </span>
      <span>
        <span className={`rounded px-1.5 py-0.5 text-[8px] font-medium ${status === "Garantido" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {status}
        </span>
      </span>
      <span className={`justify-self-end rounded p-0.5 transition ${qrActive ? "bg-blue-600 text-white ring-4 ring-blue-200" : "text-slate-400"}`}>
        <QrCode className="w-3 h-3" />
      </span>
    </div>
  );
}

/** QR Code ilustrativo (padrão determinístico). */
function FakeQR({ size }: { size: number }) {
  const n = 21;
  const finder = (x: number, y: number) =>
    [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const finderOn = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      const dx = x - fx, dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7)
        return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    }
    return false;
  };
  const cells: React.ReactElement[] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const on = finder(x, y) ? finderOn(x, y) : ((x * 7 + y * 13 + x * y) % 5) < 2;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} className="fill-slate-900" shapeRendering="crispEdges">
      {cells}
    </svg>
  );
}
