export type AppKey = "estoque" | "devolucoes";

export const THEMES: Record<AppKey, {
  name: string;
  tagline: string;
  description: string;
  accentClass: string;
  buttonClass: string;
  ringClass: string;
  badgeClass: string;
  linkClass: string;
}> = {
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

// URLs de destino pós-login por aplicação
export const PRODUCT_URLS: Record<AppKey, string> = {
  estoque: "https://estoque.vexodev.com.br",
  devolucoes: "https://devolucoes.vexodev.com.br",
};

// Domínio central de autenticação. Em dev/preview cai para a origin atual.
export const AUTH_BASE_URL = (() => {
  if (typeof window === "undefined") return "https://auth.vexodev.com.br";
  const host = window.location.hostname;
  const isProdAuth = host === "auth.vexodev.com.br";
  const isVexoSubdomain = host.endsWith(".vexodev.com.br");
  if (isProdAuth || isVexoSubdomain) return "https://auth.vexodev.com.br";
  return window.location.origin; // localhost, preview lovable, etc.
})();