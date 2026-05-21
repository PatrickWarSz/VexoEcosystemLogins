export type AppKey = "hub" | "estoque" | "devolucoes";

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
