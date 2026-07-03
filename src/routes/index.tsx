import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { EstoquePanel } from "@/components/auth/EstoquePanel";
import { DevolucoesPanel } from "@/components/auth/DevolucoesPanel";
import { FinanceiroPanel } from "@/components/auth/FinanceiroPanel";
import { AuthForm } from "@/components/auth/AuthForm";
import type { AppKey } from "@/components/auth/theme";

function detectAppFromHost(): AppKey {
  if (typeof window === "undefined") return "estoque";
  const host = window.location.hostname;
  if (host.includes("devolucoes")) return "devolucoes";
  if (host.includes("financeiro") || host.includes("focofin")) return "financeiro";
  return "estoque";
}

const searchSchema = z.object({
  app: fallback(
    z.enum(["estoque", "devolucoes", "financeiro"]),
    detectAppFromHost()
  ).default(detectAppFromHost()),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "VEXO — Acesso à plataforma" },
      { name: "description", content: "Acesse o ecossistema VEXO: Estoque PRO, Devoluções e FocoFinanceiro." },
    ],
  }),
});

function AuthPage() {
  const { app } = Route.useSearch();
  const currentApp = app as AppKey;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {currentApp === "estoque" && <EstoquePanel />}
      {currentApp === "devolucoes" && <DevolucoesPanel />}
      {currentApp === "financeiro" && <FinanceiroPanel />}
      <AuthForm currentApp={currentApp} />
    </div>
  );
}
