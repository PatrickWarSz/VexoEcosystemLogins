import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { HubPanel } from "@/components/auth/HubPanel";
import { EstoquePanel } from "@/components/auth/EstoquePanel";
import { DevolucoesPanel } from "@/components/auth/DevolucoesPanel";
import { AuthForm } from "@/components/auth/AuthForm";
import type { AppKey } from "@/components/auth/theme";

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

function AuthPage() {
  const { app } = Route.useSearch();
  const currentApp = app as AppKey;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {currentApp === "estoque" && <EstoquePanel />}
      {currentApp === "devolucoes" && <DevolucoesPanel />}
      {currentApp === "hub" && <HubPanel />}
      <AuthForm currentApp={currentApp} />
    </div>
  );
}
