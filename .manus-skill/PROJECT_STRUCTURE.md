# Estrutura do Projeto — Oris Cloud

## Repositórios

O projeto vive em **dois repositórios GitHub**:

1. **`Felipealmeidaz/oris-cloud-frontend-v2`** — apenas o frontend (ligado ao Vercel, auto-deploya)
2. **`oris-cloud-railway` (local apenas)** — workspace full-stack com frontend + backend. Usado pro desenvolvimento; o backend é deployado separadamente no Railway via CLI.

A pasta local `c:\Users\felip\Downloads\Projetos\oris-cloud-railway\` tem a estrutura unificada:

```
oris-cloud-railway/
├── client/                       # Frontend React (espelha oris-cloud-frontend-v2)
│   ├── public/
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   │   ├── ui/               # shadcn/ui (Button, Dialog, etc.) — NÃO editar
│   │   │   ├── Header.tsx        # Navegação + auth state
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Founders.tsx
│   │   │   ├── Plans.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LoginButton.tsx   # ⛔ INTOCÁVEL
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── dashboard/        # Subcomponentes do dashboard (futuro)
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx   # ⛔ INTERFACE INTOCÁVEL
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts        # wrapper de useSession
│   │   ├── lib/
│   │   │   ├── auth-client.ts    # ⛔ INTOCÁVEL (Better Auth client)
│   │   │   └── utils.ts          # cn() helper do shadcn
│   │   ├── mocks/                # Dados mockados (opcional)
│   │   ├── pages/
│   │   │   ├── Login.tsx         # Tela de login OAuth
│   │   │   └── Dashboard.tsx     # Área logada
│   │   ├── App.tsx               # Routing com wouter
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Tailwind base + theme vars
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                       # Backend Express
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client + Postgres connection
│   │   │   └── schema.ts         # ⛔ Tabelas Better Auth — não alterar sem cuidado
│   │   ├── lib/
│   │   │   └── auth.ts           # ⛔ Better Auth config
│   │   ├── scripts/
│   │   │   └── migrate.ts        # Runner de migrations Drizzle
│   │   ├── routes/               # (futuro) rotas custom
│   │   └── main.ts               # Express app + middleware + server
│   ├── drizzle/                  # Migrations geradas
│   ├── drizzle.config.ts
│   ├── package.json              # ⚠️ dotenv fixo em 16.4.5
│   └── tsconfig.json
│
├── .manus-skill/                 # Esta skill (auto-referência)
├── .gitignore
├── package.json                  # Scripts de workspace
├── vercel.json                   # Config Vercel (se existir)
└── README.md
```

## Responsabilidade de Cada Pasta

### `client/src/components/`

- **`ui/`** — Componentes primitivos do `shadcn/ui`. **NÃO editar diretamente**. Se precisar de um novo, usar o CLI `pnpm dlx shadcn@latest add <componente>`.
- **Arquivos raiz** — Seções da landing page (Hero, About, Plans, etc.) e componentes compartilhados (Header, Footer).
- **Subpastas temáticas** (ex: `dashboard/`) — Componentes específicos de uma área.

### `client/src/contexts/`

Context providers globais. Cada arquivo exporta um Provider e um hook. **Mudar a interface pública desses hooks quebra consumidores em cascata** — sempre adicionar, nunca remover campos.

### `client/src/hooks/`

Custom hooks reutilizáveis. Manter simples e com tipos explícitos.

### `client/src/lib/`

Utilitários e clients. Contém a instância do Better Auth client e o helper `cn()` do shadcn.

### `client/src/pages/`

Componentes de página (correspondem a rotas). Cada página é responsável por:
- Proteger a rota (redirect para `/login` se exigir auth)
- Renderizar Header + conteúdo + Footer
- Gerenciar state específico daquela página

### `server/src/db/`

- `schema.ts` — define tabelas do Postgres via Drizzle. Compatível com spec Better Auth.
- `index.ts` — cria conexão Postgres e exporta instância `db`.

### `server/src/lib/`

Configurações compartilhadas. Hoje só tem `auth.ts` (Better Auth).

### `server/src/routes/`

(Futuro) Endpoints custom além do que Better Auth expõe (ex: `/api/machines`, `/api/billing`).

### `server/src/scripts/`

Scripts utilitários executados fora do lifecycle normal do servidor (migrações, seeds).

## Fluxo de Rotas

```
GET /                 → HomePage (landing pública)
                        Se logado → redirect /dashboard
GET /login            → Login (OAuth buttons)
                        Se logado → redirect /dashboard
GET /dashboard        → Dashboard (área logada)
                        Se NÃO logado → redirect /login

GET  /api/auth/oauth-start → endpoint CUSTOM (antes do catch-all Better Auth)
                             inicia OAuth via top-level navigation (302 + Set-Cookie)
POST /api/auth/*      → Better Auth (handled por toNodeHandler) — catch-all
GET  /api/health      → health check
GET  /api/v1/users/me → dados do usuário atual (requer cookie de sessão)
```

## Fluxo de Auth OAuth (Google/GitHub)

Arquitetura atual usa **top-level navigation** pra garantir que o cookie de state do Better Auth persista em browsers modernos (sem depender de 3rd party cookies via AJAX).

```
1. User clica <LoginButton provider="google" />
2. Frontend faz window.location.href = `${API_URL}/api/auth/oauth-start?provider=google&callbackURL=...`
   (top-level navigation, NÃO AJAX — crítico pra cookie cross-site persistir)
3. Backend GET /api/auth/oauth-start:
   - Chama auth.handler() internamente (Web Request/Response Better Auth)
   - Copia Set-Cookie (__Secure-better-auth.state) pro response final
   - Responde 302 com Location: accounts.google.com/... + Set-Cookie no MESMO response
4. Browser segue o 302 → provider
5. User autoriza no provider (Google/GitHub)
6. Provider redireciona pra backend: /api/auth/callback/google?code=xxx&state=xxx
7. Better Auth lê cookie __Secure-better-auth.state e valida state
8. Backend troca code por access_token, busca user info, cria/atualiza user na DB
9. Backend seta cookie de SESSÃO (better-auth.session_token) e redireciona pra callbackURL
10. Frontend carrega /dashboard, useAuthContext() → useSession() busca /api/auth/session
    com credentials:'include', cookie vai junto, sessão reconhecida, área logada renderiza.
```

**Limitação conhecida:** passo 10 falha em browsers privacy-first (Comet, Brave, Chrome anônimo, Firefox strict) porque cookies cross-domain entre `oriscloud.com.br` e `oris-backend-api-production.up.railway.app` são bloqueados em AJAX. Funciona em Chrome normal, Edge, Firefox padrão, Safari padrão.

**Solução definitiva (pendente):** subdomínio `api.oriscloud.com.br` via DNS CNAME → cookies viram first-party, funciona em todo browser.

**Se quebrar em qualquer passo**, o fix quase sempre está em:

- Ordem de middlewares em `server/src/main.ts` — `/api/auth/oauth-start` ANTES de `app.all('/api/auth/*', ...)` senão catch-all intercepta
- CORS whitelist no backend com `credentials: true` + origin específico (não `*`)
- Redirect URIs cadastradas no provider (Google/GitHub dashboard) batem com `BETTER_AUTH_URL`
- Variáveis de ambiente `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`
- Cookie settings em `server/src/lib/auth.ts` (`sameSite: 'none'`, `secure: true`, `httpOnly: true`)
- Frontend `credentials: 'include'` no authClient (`client/src/lib/auth-client.ts`)
