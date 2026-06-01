import { useEffect, useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { THEMES, PRODUCT_URLS, type AppKey } from "./theme";

// ─── Cookie storage (mesmo padrão do AuthForm, para SSO entre subdomínios) ────
const getDomain = () => {
  if (typeof window === "undefined") return "";
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "";
  return "domain=.vexodev.com.br;";
};

const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + key + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${key}=${encodeURIComponent(value)}; ${getDomain()} path=/; max-age=31536000; SameSite=Lax; secure`;
  },
  removeItem: (key: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${key}=; ${getDomain()} path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

type TokenState = "checking" | "valid" | "invalid";

export function ResetPasswordForm({ currentApp }: { currentApp: AppKey }) {
  const theme = THEMES[currentApp];

  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [tokenErrorMsg, setTokenErrorMsg] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Detecção de token de recovery ─────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL as string,
          import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          { auth: { storage: cookieStorage, detectSessionInUrl: true } }
        );

        // Erro vindo do Supabase no hash (token expirado, etc.)
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.slice(1));
          const err = hashParams.get("error_description") || hashParams.get("error");
          if (err) {
            if (!mounted) return;
            setTokenErrorMsg(decodeURIComponent(err.replace(/\+/g, " ")));
            setTokenState("invalid");
            return;
          }
        }

        // Escuta evento de PASSWORD_RECOVERY (o SDK processa o hash automaticamente)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (!mounted) return;
          if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
            setTokenState("valid");
          }
        });

        // Fallback: tenta ler sessão atual após detecção do hash
        setTimeout(async () => {
          if (!mounted) return;
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setTokenState("valid");
          } else if (tokenState === "checking") {
            setTokenState("invalid");
            setTokenErrorMsg(
              "Link inválido ou expirado. Solicite um novo e-mail de recuperação."
            );
          }
        }, 1500);

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Erro ao validar o link.";
        setTokenErrorMsg(msg);
        setTokenState("invalid");
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Força da senha ────────────────────────────────────────────────────────
  const reqs = {
    length: password.length >= 8,
    hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\/;`~]/.test(password),
  };
  const reqsCount = Object.values(reqs).filter(Boolean).length;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!password) next.password = "Informe uma nova senha";
    else if (reqsCount < 4)
      next.password = "A senha não cumpre as políticas de segurança.";
    if (!confirm) next.confirm = "Confirme a nova senha";
    else if (confirm !== password) next.confirm = "As senhas não coincidem";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        { auth: { storage: cookieStorage } }
      );

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      // Sign out para forçar novo login com a nova senha no app de destino
      try {
        await supabase.auth.signOut();
      } catch {
        /* noop */
      }

      setTimeout(() => {
        window.location.href = PRODUCT_URLS[currentApp];
      }, 2200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao redefinir senha.";
      setGlobalError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16 bg-white">
      <div className="w-full max-w-[420px]">
        {/* Cabeçalho */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center shadow-sm">
              <span className="text-white text-[13px] font-semibold tracking-tight">V</span>
            </div>
            <span
              className={`inline-flex items-center text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.badgeClass}`}
            >
              {theme.name}
            </span>
          </div>

          <h2 className="text-[28px] leading-tight font-semibold tracking-tight text-neutral-900">
            {success ? "Senha redefinida" : "Redefinir senha"}
          </h2>
          <p className="mt-2 text-[14px] text-neutral-500 leading-relaxed">
            {success
              ? `Redirecionando para ${theme.name}…`
              : tokenState === "checking"
              ? "Validando seu link de recuperação…"
              : tokenState === "invalid"
              ? "Não foi possível validar este link."
              : "Crie uma nova senha forte para sua conta corporativa."}
          </p>
        </div>

        {/* Estado: verificando token */}
        {tokenState === "checking" && (
          <div className="flex items-center gap-3 text-[13px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5">
            <Loader2 className="w-4 h-4 animate-spin" />
            Aguardando confirmação do link…
          </div>
        )}

        {/* Estado: token inválido */}
        {tokenState === "invalid" && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 text-[13px] text-red-700 bg-red-50 border border-red-200/70 rounded-lg px-3.5 py-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">
                {tokenErrorMsg ?? "Link inválido ou expirado."}
              </span>
            </div>
            <a
              href={`/?app=${currentApp}`}
              className={`mt-2 w-full inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-[14px] font-medium tracking-tight transition-all shadow-sm hover:shadow-md ${theme.buttonClass}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Solicitar novo link
            </a>
          </div>
        )}

        {/* Estado: sucesso */}
        {success && (
          <div className="flex items-start gap-2.5 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-lg px-3.5 py-3">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">
              Sua senha foi atualizada com sucesso. Estamos te redirecionando para
              fazer login.
            </span>
          </div>
        )}

        {/* Estado: token válido — formulário */}
        {tokenState === "valid" && !success && (
          <>
            {globalError && (
              <div className="mb-5 flex items-start gap-2.5 text-[13px] text-red-700 bg-red-50 border border-red-200/70 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field
                label="Nova senha"
                icon={<Lock className="w-[15px] h-[15px]" />}
                error={errors.password}
                ringClass={theme.ringClass}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="flex-1 bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400"
                  autoComplete="new-password"
                />
              </Field>

              {/* Checklist de força */}
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 -mt-1 px-1">
                  <Req ok={reqs.length} label="8+ caracteres" />
                  <Req ok={reqs.hasUpperLower} label="Maiúscula + minúscula" />
                  <Req ok={reqs.hasNumber} label="Número" />
                  <Req ok={reqs.hasSpecial} label="Símbolo especial" />
                </div>
              )}

              <Field
                label="Confirmar nova senha"
                icon={<Lock className="w-[15px] h-[15px]" />}
                error={errors.confirm}
                ringClass={theme.ringClass}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                hint={
                  confirm.length > 0
                    ? confirm === password
                      ? "As senhas coincidem"
                      : "As senhas não coincidem"
                    : undefined
                }
                hintValid={confirm.length > 0 && confirm === password}
              >
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="flex-1 bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400"
                  autoComplete="new-password"
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className={`mt-2 w-full inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-[14px] font-medium tracking-tight transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${theme.buttonClass}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Atualizando…
                  </>
                ) : (
                  <>
                    Redefinir senha
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <a
                  href={`/?app=${currentApp}`}
                  className={`text-[13px] font-medium transition-colors ${theme.linkClass}`}
                >
                  Voltar para o login
                </a>
              </div>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="pt-8 space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Conexão criptografada · SSL 256-bit</span>
          </div>
          <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
            Recuperação de acesso protegida pelo ecossistema VEXO.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function Req({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] ${
        ok ? "text-emerald-600" : "text-neutral-400"
      }`}
    >
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {label}
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
  hint,
  hintValid,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  ringClass: string;
  hint?: string;
  hintValid?: boolean;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-neutral-700 mb-1.5">
        {label}
      </label>
      <div
        className={`group flex items-center gap-2.5 px-3.5 h-11 rounded-xl border bg-white transition-all ${
          error
            ? "border-red-300 ring-2 ring-red-100"
            : `border-neutral-200 hover:border-neutral-300 focus-within:ring-2 focus-within:border-transparent ${ringClass}`
        }`}
      >
        <span
          className={`flex-shrink-0 transition-colors ${
            error ? "text-red-400" : "text-neutral-400 group-focus-within:text-neutral-600"
          }`}
        >
          {icon}
        </span>
        {children}
        {trailing && <span className="flex-shrink-0">{trailing}</span>}
      </div>
      {error && (
        <p className="mt-1.5 text-[12px] text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          className={`mt-1.5 text-[12px] flex items-center gap-1 ${
            hintValid ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {hintValid ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          {hint}
        </p>
      )}
    </div>
  );
}
