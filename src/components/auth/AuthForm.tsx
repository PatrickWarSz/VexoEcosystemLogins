import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  FileText,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { THEMES, type AppKey } from "./theme";

// ─── ADAPTADOR DE COOKIES (COMPARTILHAMENTO DE SESSÃO) ────────────────────────
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    // Salva no domínio base para que o estoque.vexodev.com.br possa ler
    document.cookie = `${key}=${encodeURIComponent(value)}; domain=.vexodev.com.br; path=/; max-age=31536000; SameSite=Lax; secure`;
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=; domain=.vexodev.com.br; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

// ─── Helpers (espelho do LoginPage.tsx do Estoque) ────────────────────────────

function isValidDocument(doc: string): boolean {
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) {
    if (/^(\d)\1+$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(digits.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(digits.charAt(10));
  }
  if (digits.length === 14) {
    if (/^(\d)\1+$/.test(digits)) return false;
    let size = digits.length - 2;
    let nums = digits.substring(0, size);
    const dig = digits.substring(size);
    let sum = 0,
      pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(nums.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(dig.charAt(0))) return false;
    size = size + 1;
    nums = digits.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(nums.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(dig.charAt(1));
  }
  return false;
}

function maskDocument(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

const PRODUCT_URLS: Record<AppKey, string> = {
  hub: "https://vexodev.com.br",
  estoque: "https://estoque.vexodev.com.br",
  devolucoes: "https://devolucoes.vexodev.com.br",
};

// ─── Componente principal ─────────────────────────────────────────────────────

export function AuthForm({ currentApp }: { currentApp: AppKey }) {
  const theme = THEMES[currentApp];

  const [mode, setMode] = useState<"login" | "signup">("login");

  // Campos login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Campos extras de cadastro
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [ownerCpf, setOwnerCpf] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // ── Validação Reativa de Requisitos da Senha ────────────────────────────────
  const passwordRequirements = {
    length: password.length >= 8,
    hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\/;`~]/.test(password),
  };

  const metRequirementsCount = Object.values(passwordRequirements).filter(Boolean).length;

  const getPasswordStrength = () => {
    if (password.length === 0) return { score: 0, label: "Em branco", color: "bg-neutral-200", text: "text-neutral-400" };
    if (password.length < 6 || metRequirementsCount <= 1) return { score: 1, label: "Fraca", color: "bg-red-500", text: "text-red-500" };
    if (metRequirementsCount === 2 || metRequirementsCount === 3) return { score: 2, label: "Média", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 3, label: "Forte e Segura", color: "bg-emerald-500", text: "text-emerald-600" };
  };

  const strength = getPasswordStrength();

  // ── Validação de Submissão ──────────────────────────────────────────────────

const validateLogin = (): boolean => {
  const next: Record<string, string> = {};
  if (!email.trim()) next.email = "Informe seu usuário ou e-mail";
  // Remove a validação de formato — aceita tanto "roberta" quanto "email@empresa.com"
  if (!password) next.password = "Informe sua senha";
  setErrors(next);
  return Object.keys(next).length === 0;
};

  const validateSignup = (): boolean => {
    const next: Record<string, string> = {};
    if (!ownerName.trim()) next.ownerName = "Informe seu nome de usuário";
    if (!companyName.trim()) next.companyName = "Informe o nome da empresa";
    const cleanDoc = documentId.replace(/\D/g, "");
    if (!cleanDoc) next.documentId = "Informe o CNPJ ou CPF";
    else if (!isValidDocument(cleanDoc)) next.documentId = "CNPJ/CPF inválido";
    if (!email.trim()) next.email = "Informe seu e-mail profissional";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "E-mail inválido";
    
    // Validação corporativa baseada no checklist de segurança
    if (!password) {
      next.password = "Informe uma senha";
    } else if (metRequirementsCount < 4) {
      next.password = "A senha não cumpre as políticas de segurança corporativa.";
    }
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    if (!validateLogin()) return;
    setLoading(true);

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        { auth: { storage: cookieStorage } }
      );

      const EMPLOYEE_LOGIN_FN =
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/employee-login`;

      const res = await fetch(EMPLOYEE_LOGIN_FN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        },
        body: JSON.stringify({ login: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setGlobalError(data.error ?? "E-mail/usuário ou senha incorretos.");
        setLoading(false);
        return;
      }

      // Injeta sessão no cookieStorage — SSO entre subdomínios vexodev.com.br
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      window.location.href = PRODUCT_URLS[currentApp] + "/app/estoque";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      setGlobalError(msg);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    if (!validateSignup()) return;
    setLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        { auth: { storage: cookieStorage } }
      );

      const cleanDoc = documentId.replace(/\D/g, "");
      const cleanCpf = ownerCpf ? ownerCpf.replace(/\D/g, "") : cleanDoc;
      const u = email.trim().toLowerCase();

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 15);

      const { data: workspace, error: wErr } = await supabase
        .from("workspaces")
        .insert([
          {
            cnpj_cpf: cleanDoc,
            nome_empresa: companyName.trim(),
            cpf_titular: cleanCpf,
            status_assinatura: "trialing",
            plano_atual: "estoque_pro",
            data_vencimento: trialEndDate.toISOString(),
          },
        ])
        .select()
        .single();

      if (wErr) throw new Error(wErr.message);

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: u,
        password,
      });

      if (authErr) throw new Error(authErr.message);

      const { error: uErr } = await supabase.from("usuarios").insert([
        {
          id: authData.user?.id,
          workspace_id: workspace.id,
          nome: ownerName.trim(),
          username: u,
          tipo: "admin",
          permissoes: {
            estoque: true,
            pedidos: true,
            fornecedores: true,
            historico: true,
            scanner: true,
            etiquetas: true,
            configuracoes: true,
          },
          ativo: true,
          senha_hash: "migrated_to_auth",
        },
      ]);

      if (uErr) throw new Error(uErr.message);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await supabase.functions.invoke("asaas-customer", {
          body: {
            workspaceId: workspace.id,
            companyName: companyName.trim(),
            documentId: cleanDoc,
            email: u,
            phone: phone.trim() || undefined,
          },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      } catch (err) {
        console.warn("[asaas-customer] erro não-crítico:", err);
      }

      setMode("login");
      setPassword("");
      setGlobalError(null);
      setErrors({ _success: "Empresa criada! Faça login para continuar." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar empresa";
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = mode === "login" ? handleLogin : handleSignup;
  const docDigits = documentId.replace(/\D/g, "");
  const docValid = docDigits.length >= 11 && isValidDocument(documentId);

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
            {mode === "login" ? "Bem-vindo de volta" : "Crie seu Workspace"}
          </h2>
          <p className="mt-2 text-[14px] text-neutral-500 leading-relaxed">
            {mode === "login"
              ? "Acesse sua conta corporativa para continuar."
              : "15 dias grátis. Sem cartão de crédito."}
          </p>
        </div>

        {/* Toggle login / cadastro */}
        <div className="relative grid grid-cols-2 p-1 bg-neutral-100/80 rounded-xl mb-7">
          <span
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm ring-1 ring-neutral-200/60 transition-transform duration-200 ease-out ${
              mode === "signup" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
            }`}
          />
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErrors({});
                setGlobalError(null);
              }}
              className={`relative z-10 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                mode === m ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {/* Mensagens */}
        {errors._success && (
          <div className="mb-5 flex items-start gap-2.5 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-lg px-3.5 py-2.5">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{errors._success}</span>
          </div>
        )}
        {globalError && (
          <div className="mb-5 flex items-start gap-2.5 text-[13px] text-red-700 bg-red-50 border border-red-200/70 rounded-lg px-3.5 py-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{globalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "signup" && (
            <>
              <SectionLabel>Empresa</SectionLabel>

              <Field
                label="Seu nome completo"
                icon={<User className="w-[15px] h-[15px]" />}
                error={errors.ownerName}
                ringClass={theme.ringClass}
              >
                <input
                  type="text"
                  autoComplete="name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400"
                  autoFocus
                />
              </Field>

              <Field
                label="Nome da empresa"
                icon={<Building2 className="w-[15px] h-[15px]" />}
                error={errors.companyName}
                ringClass={theme.ringClass}
              >
                <input
                  type="text"
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Delicatta Fit Store"
                  className="w-full bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400"
                />
              </Field>

              <Field
                label="CNPJ ou CPF"
                icon={<FileText className="w-[15px] h-[15px]" />}
                error={errors.documentId}
                ringClass={theme.ringClass}
                hint={
                  docDigits.length >= 11
                    ? docValid
                      ? "Documento válido"
                      : "Documento inválido"
                    : undefined
                }
                hintValid={docValid}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={maskDocument(documentId)}
                  onChange={(e) =>
                    setDocumentId(e.target.value.replace(/\D/g, "").slice(0, 14))
                  }
                  placeholder="00.000.000/0000-00"
                  className="w-full bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400 tabular-nums"
                />
              </Field>

              <Field
                label="CPF do titular responsável"
                icon={<User className="w-[15px] h-[15px]" />}
                error={errors.ownerCpf}
                ringClass={theme.ringClass}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={maskCpf(ownerCpf)}
                  onChange={(e) =>
                    setOwnerCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                  placeholder="000.000.000-00"
                  className="w-full bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400 tabular-nums"
                />
              </Field>

              <Field
                label="WhatsApp do financeiro"
                icon={<Phone className="w-[15px] h-[15px]" />}
                error={errors.phone}
                ringClass={theme.ringClass}
              >
                <input
                  type="tel"
                  value={maskPhone(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400 tabular-nums"
                />
              </Field>

              <SectionLabel className="pt-2">Conta de acesso</SectionLabel>
            </>
          )}

          {/* E-mail */}
          <Field
            label={mode === "signup" ? "E-mail profissional" : "E-mail"}
            icon={<Mail className="w-[15px] h-[15px]" />}
            error={errors.email}
            ringClass={theme.ringClass}
          >
            <input
              type={mode === "signup" ? "email" : "text"} 
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                mode === "signup" ? "contato@suaempresa.com" : "voce@empresa.com"
              }
              className="w-full bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400"
            />
          </Field>

          {/* Senha */}
          <Field
            label="Senha"
            icon={<Lock className="w-[15px] h-[15px]" />}
            error={errors.password}
            ringClass={theme.ringClass}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors p-0.5"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-[15px] h-[15px]" />
                ) : (
                  <Eye className="w-[15px] h-[15px]" />
                )}
              </button>
            }
          >
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400 tracking-wider"
            />
          </Field>

          {/* ─── CHECKOUT DE SEGURANÇA DA SENHA (APENAS NO CADASTRO) ─── */}
          {mode === "signup" && password.length > 0 && (
            <div className="mt-2 p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-neutral-500">Força da senha:</span>
                <span className={strength.text}>{strength.label}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1 h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-transparent"}`} />
                <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : "bg-transparent"}`} />
                <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-transparent"}`} />
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 text-[11px]">
                <div className={`flex items-center gap-1.5 transition-colors ${passwordRequirements.length ? "text-emerald-600 font-medium" : "text-neutral-400"}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${passwordRequirements.length ? "text-emerald-500 fill-emerald-50" : "text-neutral-300"}`} />
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${passwordRequirements.hasUpperLower ? "text-emerald-600 font-medium" : "text-neutral-400"}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${passwordRequirements.hasUpperLower ? "text-emerald-500 fill-emerald-50" : "text-neutral-300"}`} />
                  <span>Maiúsculas e minúsculas</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${passwordRequirements.hasNumber ? "text-emerald-600 font-medium" : "text-neutral-400"}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${passwordRequirements.hasNumber ? "text-emerald-500 fill-emerald-50" : "text-neutral-300"}`} />
                  <span>Ao menos um número</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${passwordRequirements.hasSpecial ? "text-emerald-600 font-medium" : "text-neutral-400"}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${passwordRequirements.hasSpecial ? "text-emerald-500 fill-emerald-50" : "text-neutral-300"}`} />
                  <span>Caractere especial</span>
                </div>
              </div>
            </div>
          )}

          {/* Esqueci senha */}
          {mode === "login" && (
            <div className="flex items-center justify-between text-[13px] pt-1">
              <label className="inline-flex items-center gap-2 text-neutral-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-1 focus:ring-neutral-400 focus:ring-offset-0"
                />
                Lembrar-me
              </label>
              <button
                type="button"
                className={`font-medium transition-colors ${theme.linkClass}`}
                onClick={async () => {
                  if (!email.trim() || !email.includes("@")) {
                    setErrors({ email: "Digite seu e-mail para recuperar a senha" });
                    return;
                  }
                  try {
                    const { createClient } = await import("@supabase/supabase-js");
                    const supabase = createClient(
                      import.meta.env.VITE_SUPABASE_URL as string,
                      import.meta.env.VITE_SUPABASE_ANON_KEY as string,
                      { auth: { storage: cookieStorage } }
                    );
                    await supabase.auth.resetPasswordForEmail(email.trim(), {
                      redirectTo: `${window.location.origin}/login`,
                    });
                    setErrors({
                      _success: "E-mail de recuperação enviado! Verifique sua caixa.",
                    });
                  } catch {
                    setGlobalError("Não foi possível enviar o e-mail.");
                  }
                }}
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {/* Botão principal */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-[14px] font-medium tracking-tight transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${theme.buttonClass}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando…
              </>
            ) : (
              <>
                {mode === "login" ? "Entrar" : "Criar Workspace"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Footer */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Conexão criptografada · SSL 256-bit</span>
            </div>
            <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
              Ao continuar, você concorda com nossos{" "}
              <a href="#" className="underline-offset-2 hover:underline hover:text-neutral-600">
                Termos
              </a>{" "}
              e{" "}
              <a href="#" className="underline-offset-2 hover:underline hover:text-neutral-600">
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {children}
      </span>
      <div className="flex-1 h-px bg-neutral-100" />
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