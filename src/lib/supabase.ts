import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis do Supabase ausentes no .env do Hub de Logins.");
}

// ─── ADAPTADOR DE COOKIES (COMPARTILHAMENTO DE SESSÃO) ────────────────────────
const getDomain = () => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  // Se estiver a rodar localmente, não força o domínio para não quebrar o cookie
  if (hostname === 'localhost' || hostname === '127.0.0.1') return '';
  return 'domain=.vexodev.com.br;';
};

const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=${encodeURIComponent(value)}; ${getDomain()} path=/; max-age=31536000; SameSite=Lax; secure`;
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=; ${getDomain()} path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

// ─── EXPORTANDO O CLIENTE ÚNICO ───────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: cookieStorage,
    flowType: 'pkce',
  },
});