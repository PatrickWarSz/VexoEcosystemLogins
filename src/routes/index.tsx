import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Package, Truck, Boxes, RotateCcw, Sparkles } from "lucide-react";

const searchSchema = z.object({
  app: fallback(z.enum(["hub", "estoque", "devolucoes"]), "hub").default("hub"),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "VEXO — Acesso à plataforma" },
      { name: "description", content: "Acesse o ecossistema VEXO: Estoque PRO, Devoluções e Hub corporativo." },
    ],
  }),
});

type AppKey = "hub" | "estoque" | "devolucoes";

const THEMES: Record<AppKey, {
  name: string;
  tagline: string;
  description: string;
  accentClass: string;
  buttonClass: string;
  ringClass: string;
  badgeClass: string;
  linkClass: string;
}> = {
  hub: {
    name: "VEXO",
    tagline: "A plataforma que conecta sua operação",
    description: "Um ecossistema unificado para gestão, logística e inteligência operacional.",
    accentClass: "text-neutral-900",
    buttonClass: "bg-neutral-900 hover:bg-neutral-800 text-white",
    ringClass: "focus:ring-neutral-900/20 focus:border-neutral-900",
    badgeClass: "bg-neutral-100 text-neutral-700 border-neutral-200",
    linkClass: "text-neutral-900 hover:text-neutral-700",
  },
  estoque: {
    name: "Estoque PRO",
    tagline: "Bem-vindo ao Estoque PRO",
    description: "Controle total do seu inventário com precisão de nível enterprise.",
    accentClass: "text-blue-700",
    buttonClass: "bg-blue-700 hover:bg-blue-800 text-white",
    ringClass: "focus:ring-blue-700/20 focus:border-blue-700",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    linkClass: "text-blue-700 hover:text-blue-800",
  },
  devolucoes: {
    name: "Devoluções",
    tagline: "Logística Reversa Inteligente",
    description: "Automação completa do ciclo de devoluções, do pedido ao reembolso.",
    accentClass: "text-orange-600",
    buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
    ringClass: "focus:ring-orange-600/20 focus:border-orange-600",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    linkClass: "text-orange-600 hover:text-orange-700",
  },
};

function AuthPage() {
  const { app } = Route.useSearch();
  const theme = THEMES[app as AppKey];

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email) next.email = "Informe seu e-mail";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "E-mail inválido";
    if (!password) next.password = "Informe sua senha";
    else if (password.length < 6) next.password = "Mínimo de 6 caracteres";
    setErrors(next);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* LEFT — themed panel */}
      <BrandPanel app={app} />

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 bg-white">
        <div className="w-full max-w-md">
          {/* Switcher */}
          <div className="flex items-center gap-2 mb-8">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${theme.badgeClass}`}>
              <Sparkles className="w-3 h-3" />
              {theme.name}
            </span>
            <SwitcherLinks current={app} />
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            {mode === "login"
              ? "Entre com seu e-mail corporativo para continuar."
              : "Comece em segundos. Sem cartão de crédito."}
          </p>

          {/* Tab toggle */}
          <div className="mt-8 inline-flex p-1 bg-neutral-100 rounded-lg">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          <form onSubmit={validate} className="mt-6 space-y-4" noValidate>
            <Field
              label="E-mail"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email}
              ringClass={theme.ringClass}
            >
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
                className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
              />
            </Field>

            <Field
              label="Senha"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password}
              ringClass={theme.ringClass}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label="Mostrar senha"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            >
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
              />
            </Field>

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-neutral-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-neutral-300" />
                  Lembrar-me
                </label>
                <a href="#" className={`font-medium ${theme.linkClass}`}>
                  Esqueceu a senha?
                </a>
              </div>
            )}

            <button
              type="submit"
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow ${theme.buttonClass}`}
            >
              {mode === "login" ? "Entrar" : "Criar conta"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-neutral-400 text-center pt-2">
              Ao continuar, você concorda com nossos{" "}
              <a href="#" className="underline hover:text-neutral-600">Termos</a> e{" "}
              <a href="#" className="underline hover:text-neutral-600">Política de Privacidade</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  error,
  children,
  trailing,
  ringClass,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  ringClass: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1.5">{label}</label>
      <div
        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-lg border bg-white transition-all ${
          error ? "border-red-400 ring-2 ring-red-100" : `border-neutral-200 focus-within:ring-2 ${ringClass}`
        }`}
      >
        <span className={error ? "text-red-500" : "text-neutral-400"}>{icon}</span>
        {children}
        {trailing}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SwitcherLinks({ current }: { current: AppKey }) {
  const items: { key: AppKey; label: string }[] = [
    { key: "hub", label: "Hub" },
    { key: "estoque", label: "Estoque" },
    { key: "devolucoes", label: "Devoluções" },
  ];
  return (
    <div className="flex items-center gap-1 text-xs text-neutral-400">
      {items
        .filter((i) => i.key !== current)
        .map((i) => (
          <Link
            key={i.key}
            to="/"
            search={{ app: i.key }}
            className="px-2 py-1 rounded hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            {i.label}
          </Link>
        ))}
    </div>
  );
}

function BrandPanel({ app }: { app: AppKey }) {
  if (app === "estoque") return <EstoquePanel />;
  if (app === "devolucoes") return <DevolucoesPanel />;
  return <HubPanel />;
}

function HubPanel() {
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

function EstoquePanel() {
  return (
    <div className="relative lg:flex-1 text-white overflow-hidden flex flex-col justify-between p-10 lg:p-14 min-h-[280px]"
      style={{ background: "linear-gradient(135deg, #0a1f44 0%, #0f2d6b 50%, #1e3a8a 100%)" }}
    >
      {/* grid overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      {/* floating boxes */}
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

function DevolucoesPanel() {
  return (
    <div className="relative lg:flex-1 text-white overflow-hidden flex flex-col justify-between p-10 lg:p-14 min-h-[280px]"
      style={{ background: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)" }}
    >
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(ellipse at top right, rgba(255,200,100,.4), transparent 60%)",
      }} />
      {/* circular reverse arrows motif */}
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/60 mt-0.5">{label}</div>
    </div>
  );
}

function FloatingBox({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Package className="w-1/2 h-1/2 text-white/40" strokeWidth={1.2} />
      </div>
    </div>
  );
}
