import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { THEMES, type AppKey } from "./theme";

export function AuthForm({ currentApp }: { currentApp: AppKey }) {
  const theme = THEMES[currentApp];

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
    <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 bg-white">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${theme.badgeClass}`}>
            <Sparkles className="w-3 h-3" />
            {theme.name}
          </span>
          <SwitcherLinks current={currentApp} />
        </div>

        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {mode === "login"
            ? "Entre com seu e-mail corporativo para continuar."
            : "Comece em segundos. Sem cartão de crédito."}
        </p>

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
