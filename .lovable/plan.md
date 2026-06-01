
## Objetivo

Criar uma rota única `/reset-password` neste projeto de auth (VEXO) que sirva todos os apps do ecossistema (Estoque PRO, Devoluções, Hub e futuros). O usuário pede reset em qualquer app → recebe o e-mail → cai sempre aqui → define a nova senha → é redirecionado de volta pro app de origem.

## Fluxo end-to-end

```text
[App Estoque/Devoluções/Hub]
        │  usuário clica "Esqueceu a senha?"
        ▼
[AuthForm já existente]
   resetPasswordForEmail(email, {
     redirectTo: https://auth.vexodev.com.br/reset-password?app=estoque
   })
        │
        ▼
[E-mail do Supabase]  link com token de recovery
        │
        ▼
[/reset-password?app=estoque]  ← NOVA ROTA (este projeto)
   • Detecta sessão de recovery
   • Form: nova senha + confirmar
   • supabase.auth.updateUser({ password })
   • Sucesso → redireciona pra PRODUCT_URLS[app]
```

## Mudanças

### 1. `src/components/auth/AuthForm.tsx` (ajuste pequeno)
No `handleResetPassword`, mudar o `redirectTo` para apontar sempre para o domínio central de auth, carregando o app de origem como query param:

```ts
redirectTo: `${AUTH_BASE_URL}/reset-password?app=${currentApp}`
```

Onde `AUTH_BASE_URL` é:
- Em produção: `https://auth.vexodev.com.br`
- Em dev/preview: `window.location.origin` (fallback)

Isso garante que mesmo quando o usuário pede reset estando em `estoque.vexodev.com.br`, o link do e-mail traga ele pra cá.

### 2. Nova rota `src/routes/reset-password.tsx`
Rota pública (sem guard de auth) com:
- `validateSearch` via Zod aceitando `app: "hub" | "estoque" | "devolucoes"` (fallback `hub`).
- Painel esquerdo: reusa o `EstoquePanel` / `DevolucoesPanel` / `HubPanel` conforme `app` (mesma lógica do `index.tsx`) — mantém identidade visual coerente.
- Painel direito: novo componente `ResetPasswordForm`.
- `head()` com title "VEXO — Redefinir senha".

### 3. Novo componente `src/components/auth/ResetPasswordForm.tsx`
Responsabilidades:
- No mount, escuta `supabase.auth.onAuthStateChange` aguardando evento `PASSWORD_RECOVERY` (Supabase processa o token do hash automaticamente e dispara esse evento).
- Estados: `checkingToken`, `tokenValid`, `tokenError`.
- Se token inválido/expirado: mostra mensagem + botão "Solicitar novo link" que volta pra `/?app={app}`.
- Se token válido: formulário com:
  - Nova senha (mínimo 8 chars, validação de força visual igual ao signup atual)
  - Confirmar nova senha (precisa bater)
  - Botão "Redefinir senha" com loading
- Ao submeter: `supabase.auth.updateUser({ password })`.
- Sucesso: banner verde "Senha redefinida com sucesso. Redirecionando…" + após 2s `window.location.href = PRODUCT_URLS[app]` (mesmo mapa já usado no AuthForm — vou importar dele ou extrair pra `theme.ts`).
- Visualmente: mesma linguagem do `AuthForm` atual (mesmo `theme`, mesmos componentes `Field`, `SectionLabel`, badges SSL/footer) — não cria design novo.

### 4. Pequena extração (opcional, mas limpa)
Mover `PRODUCT_URLS` de dentro do `AuthForm.tsx` para `src/components/auth/theme.ts` para que tanto `AuthForm` quanto `ResetPasswordForm` consumam a mesma fonte.

## Configuração que VOCÊ precisa fazer no Supabase (fora do código)

Para o link do e-mail funcionar, no painel Supabase → **Authentication → URL Configuration → Redirect URLs**, adicionar (allowlist):
- `https://auth.vexodev.com.br/reset-password`
- `https://auth.vexodev.com.br/reset-password?app=*` (ou só a base — o Supabase faz match por prefixo)
- `http://localhost:*/reset-password` (dev)

E em **Site URL**: `https://auth.vexodev.com.br` (recomendado).

## O que NÃO vou mexer
- Backend / integração Supabase em si (você liga depois conforme já combinado).
- Design dos painéis laterais (Estoque/Devoluções/Hub) — apenas reuso.
- Lógica do `AuthForm` exceto a linha do `redirectTo`.

## Resultado
Qualquer app do ecossistema usa o mesmo fluxo de reset. Para adicionar um novo app no futuro, basta:
1. Incluir a chave em `AppKey` no `theme.ts`.
2. Adicionar a URL em `PRODUCT_URLS`.
3. Criar o painel lateral (se quiser identidade própria).

Nenhuma duplicação de página `/reset-password` por app.
