import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { EstoquePanel } from "@/components/auth/EstoquePanel";
import { DevolucoesPanel } from "@/components/auth/DevolucoesPanel";
import { FinanceiroPanel } from "@/components/auth/FinanceiroPanel";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import type { AppKey } from "@/components/auth/theme";

const searchSchema = z.object({
  app: fallback(z.enum(["estoque", "devolucoes", "financeiro"]), "estoque").default("estoque"),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: zodValidator(searchSchema),
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "VEXO — Redefinir senha" },
      {
        name: "description",
        content:
          "Crie uma nova senha para acessar sua conta no ecossistema VEXO.",
      },
    ],
  }),
});

function ResetPasswordPage() {
  const { app } = Route.useSearch();
  const currentApp = app as AppKey;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {currentApp === "estoque" && <EstoquePanel />}
      {currentApp === "devolucoes" && <DevolucoesPanel />}
      {currentApp === "financeiro" && <FinanceiroPanel />}
      <ResetPasswordForm currentApp={currentApp} />
    </div>
  );
}
