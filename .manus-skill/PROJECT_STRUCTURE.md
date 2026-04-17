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

POST /api/auth/*      → Better Auth (handled por toNodeHandler)
GET  /api/health      → health check
GET  /api/me          → dados do usuário atual (requer cookie)
```

## Fluxo de Auth OAuth (Google/GitHub)

```
1. User clica <LoginButton provider="google" />
2. Frontend POST /api/auth/sign-in/social { provider, callbackURL: "origin/dashboard" }
3. Backend (Better Auth) responde { url: "https://accounts.google.com/..." }
4. Frontend faz window.location.href = url (HARD REDIRECT, não SPA)
5. User autoriza no provider
6. Provider redireciona para backend: /api/auth/callback/google?code=xxx
7. Backend troca code por access_token, busca user info, cria/atualiza user na DB
8. Backend seta cookie de sessão e redireciona para callbackURL ("origin/dashboard")
9. Frontend carrega /dashboard, useAuthContext() lê cookie e mostra área logada
```

**Se quebrar em qualquer passo**, o fix quase sempre está em:
- CORS whitelist no backend (`server/src/main.ts`)
- Redirect URIs cadastradas no provider (Google/GitHub dashboard)
- Variáveis de ambiente `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, etc.
- Cookie settings em `server/src/lib/auth.ts` (`sameSite: 'none'`, `secure: true`)
