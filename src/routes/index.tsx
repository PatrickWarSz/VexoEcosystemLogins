import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { EstoquePanel } from "@/components/auth/EstoquePanel";
import { DevolucoesPanel } from "@/components/auth/DevolucoesPanel";
import { AuthForm } from "@/components/auth/AuthForm";
import type { AppKey } from "@/components/auth/theme";

function detectAppFromHost(): AppKey {
  const host = window.location.hostname;
  if (host.includes("devolucoes")) return "devolucoes";
  // O fallback agora será estoque ao invés de hub
  return "estoque"; 
}

const searchSchema = z.object({
  app: fallback(
    z.enum(["estoque", "devolucoes"]),
    detectAppFromHost()
  ).default(detectAppFromHost()),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "VEXO — Acesso à plataforma" },
      { name: "description", content: "Acesse o ecossistema VEXO: Estoque PRO e Devoluções." },
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
      <AuthForm currentApp={currentApp} />
    </div>
  );
}