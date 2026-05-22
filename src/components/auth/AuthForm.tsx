import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  FileText,
  User,
  Phone,
} from "lucide-react";
import { THEMES, type AppKey } from "./theme";

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

// URL do produto para redirect após login/cadastro
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

  // Campos extras de cadastro (espelho do LoginPage.tsx do Estoque)
  const [companyName, setCompanyName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [ownerCpf, setOwnerCpf] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // ── Validação ──────────────────────────────────────────────────────────────

  const validateLogin = (): boolean => {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = "Informe seu e-mail";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "E-mail inválido";
    if (!password) next.password = "Informe sua senha";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateSignup = (): boolean => {
    const next: Record<string, string> = {};
    if (!companyName.trim()) next.companyName = "Informe o nome da empresa";
    const cleanDoc = documentId.replace(/\D/g, "");
    if (!cleanDoc) next.documentId = "Informe o CNPJ ou CPF";
    else if (!isValidDocument(cleanDoc)) next.documentId = "CNPJ/CPF inválido";
    if (!email.trim()) next.email = "Informe seu e-mail profissional";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "E-mail inválido";
    if (!password) next.password = "Informe uma senha";
    else if (password.length < 4) next.password = "Mínimo de 4 caracteres";
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
      // Importação dinâmica do Supabase — mesmo client do Estoque
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      );

      // Busca o usuário pelo username/email para determinar tipo
      const { data: user, error: dbErr } = await supabase
        .from("usuarios")
        .select("*, workspaces(cnpj_cpf, status_assinatura, data_vencimento)")
        .eq("username", email.trim().toLowerCase())
        .single();

      let loginEmail = email.trim().toLowerCase();

      if (!dbErr && user && user.tipo === "funcionario") {
        const ws = Array.isArray(user.workspaces) ? user.workspaces[0] : user.workspaces;
        if (ws?.cnpj_cpf) {
          loginEmail = `${loginEmail}@${ws.cnpj_cpf}.vexo`;
        }
      }

      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authErr) {
        setGlobalError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      // Redirect para o produto correto
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
      );

      const cleanDoc = documentId.replace(/\D/g, "");
      const cleanCpf = ownerCpf ? ownerCpf.replace(/\D/g, "") : cleanDoc;
      const u = email.trim().toLowerCase();

      // Trial de 15 dias — espelho exato do setupAdmin() do auth-store.ts
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 15);

      // 1. Cria workspace
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

      // 2. Cria conta no Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: u,
        password,
      });

      if (authErr) throw new Error(authErr.message);

      // 3. Insere registro de usuário
      const { error: uErr } = await supabase.from("usuarios").insert([
        {
          id: authData.user?.id,
          workspace_id: workspace.id,
          nome: "Administrador",
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

      // 4. Cria cliente Asaas (Edge Function — não-crítico)
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
        // Não-crítico: log sem bloquear o fluxo
        console.warn("[asaas-customer] erro não-crítico:", err);
      }

      // 5. Cadastro OK → avisa e muda para login
      setMode("login");
      setPassword("");
      setGlobalError(null);
      // Pequena mensagem de sucesso via estado local
      setErrors({ _success: "Empresa criada! Faça login para continuar." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar empresa";
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = mode === "login" ? handleLogin : handleSignup;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 bg-white">
      <div className="w-full max-w-md">
        {/* Badge do produto + switcher */}
        <div className="flex items-center gap-2 mb-8">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${theme.badgeClass}`}
          >
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
            : "Inicie seu Workspace profissional. Sem cartão de crédito."}
        </p>

        {/* Toggle login / cadastro */}
        <div className="mt-8 inline-flex p-1 bg-neutral-100 rounded-lg">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErrors({});
                setGlobalError(null);
              }}
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

        {/* Mensagem de sucesso após cadastro */}
        {errors._success && (
          <p className="mt-4 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {errors._success}
          </p>
        )}

        {/* Erro global */}
        {globalError && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {globalError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {/* ── Campos exclusivos de CADASTRO ───────────────────────────────── */}
          {mode === "signup" && (
            <>
              {/* Nome da Empresa */}
              <Field
                label="Nome da Empresa / Marca"
                icon={<Building2 className="w-4 h-4" />}
                error={errors.companyName}
                ringClass={theme.ringClass}
              >
                <input
                  type="text"
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Delicatta Fit Store"
                  className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
                  autoFocus
                />
              </Field>

              {/* CNPJ / CPF */}
              <Field
                label="CNPJ da Empresa (ou seu CPF)"
                icon={<FileText className="w-4 h-4" />}
                error={errors.documentId}
                ringClass={theme.ringClass}
                hint={
                  documentId.replace(/\D/g, "").length >= 11
                    ? isValidDocument(documentId)
                      ? "✓ Documento válido"
                      : "✗ Documento inválido"
                    : undefined
                }
                hintValid={isValidDocument(documentId)}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={documentId}
                  onChange={(e) =>
                    setDocumentId(e.target.value.replace(/\D/g, "").slice(0, 14))
                  }
                  placeholder="Apenas números (CPF ou CNPJ)"
                  className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
                />
              </Field>

              {/* CPF Titular */}
              <Field
                label="CPF do Titular Responsável"
                icon={<User className="w-4 h-4" />}
                error={errors.ownerCpf}
                ringClass={theme.ringClass}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={ownerCpf}
                  onChange={(e) =>
                    setOwnerCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                  placeholder="Apenas números"
                  className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
                />
              </Field>

              {/* WhatsApp / Telefone */}
              <Field
                label="WhatsApp / Celular do Financeiro"
                icon={<Phone className="w-4 h-4" />}
                error={errors.phone}
                ringClass={theme.ringClass}
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
                />
              </Field>
            </>
          )}

          {/* ── Campos comuns ────────────────────────────────────────────────── */}

          {/* E-mail */}
          <Field
            label={
              mode === "signup"
                ? "E-mail Profissional (Para Login e Faturas)"
                : "E-mail"
            }
            icon={<Mail className="w-4 h-4" />}
            error={errors.email}
            ringClass={theme.ringClass}
          >
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                mode === "signup" ? "contato@suaempresa.com" : "voce@empresa.com"
              }
              className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
            />
          </Field>

          {/* Senha */}
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
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
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
              className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
            />
          </Field>

          {/* Lembrar-me / Esqueci senha (só no login) */}
          {mode === "login" && (
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-neutral-600 cursor-pointer">
                <input type="checkbox" className="rounded border-neutral-300" />
                Lembrar-me
              </label>
              <button
                type="button"
                className={`font-medium ${theme.linkClass}`}
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
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed ${theme.buttonClass}`}
          >
            {loading
              ? "Processando…"
              : mode === "login"
                ? "Entrar"
                : "Criar Empresa na VEXO"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <p className="text-xs text-neutral-400 text-center pt-2">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="underline hover:text-neutral-600">
              Termos
            </a>{" "}
            e{" "}
            <a href="#" className="underline hover:text-neutral-600">
              Política de Privacidade
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

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
      <label className="block text-xs font-medium text-neutral-700 mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-lg border bg-white transition-all ${
          error
            ? "border-red-400 ring-2 ring-red-100"
            : `border-neutral-200 focus-within:ring-2 ${ringClass}`
        }`}
      >
        <span className={error ? "text-red-500" : "text-neutral-400"}>{icon}</span>
        {children}
        {trailing}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {hint && !error && (
        <p className={`mt-1.5 text-xs ${hintValid ? "text-green-600" : "text-red-500"}`}>
          {hint}
        </p>
      )}
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