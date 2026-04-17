# Regras Críticas — Oris Cloud

## ⛔ Arquivos Intocáveis (NUNCA modificar sem autorização explícita do Felipe)

Estes arquivos contêm lógica crítica que já foi debugada e está em produção. **Qualquer alteração quebra o sistema**. Se a tarefa parece exigir modificá-los, **pare e peça confirmação**.

### Frontend (repositório `oris-cloud-frontend-v2`)

| Arquivo | Motivo |
|---|---|
| `client/src/components/LoginButton.tsx` | Usa `window.location.href` DIRETO para `${API_URL}/api/auth/oauth-start?provider=X&callbackURL=Y` (top-level navigation). **NÃO** fazer POST AJAX separado — quebra cookies cross-site em browsers privacy-first (Comet, Brave, Chrome anônimo). Qualquer mudança pra fetch AJAX reintroduz bug `state_mismatch`. |
| `client/src/lib/auth-client.ts` | Configuração do Better Auth client com `fetchOptions.credentials: 'include'` crítico para cookies cross-site. |
| `client/src/contexts/AuthContext.tsx` | Interface pública `useAuthContext()` é consumida por múltiplos componentes. Mudanças na API quebram Header, Dashboard, ProtectedRoute. |

### Backend (repositório `oris-cloud-railway`, pasta `server/`)

| Arquivo | Motivo |
|---|---|
| `server/src/lib/auth.ts` | Configuração do Better Auth com Drizzle adapter. `trustedOrigins`, `socialProviders`, `session cookieCache` e `advanced.defaultCookieAttributes.secure:true` foram ajustados após debugging extenso. **Modificar quebra o fluxo OAuth**. |
| `server/src/db/schema.ts` | Schema das tabelas `user`, `session`, `account`, `verification` seguindo spec exata do Better Auth. Adicionar/remover campos ou mudar constraints causa falha em runtime. |
| `server/src/main.ts` (middleware order) | Ordem obrigatória: 1) Helmet, 2) CORS, 3) rotas específicas `/api/auth/oauth-start` com express.json() inline, 4) `app.all('/api/auth/*', toNodeHandler(auth))` catch-all, 5) `express.json()` global, 6) resto das rotas, 7) 404 handler. **Rotas específicas SEMPRE antes do catch-all do Better Auth** (`/api/auth/*` intercepta TUDO). `toNodeHandler(auth)` precisa de raw body, por isso vem antes de express.json() global. |
| `server/src/scripts/migrate.ts` | Usa `fileURLToPath(import.meta.url)` para simular `__dirname` em ESM. Não trocar por `__dirname` direto (falha em runtime). |
| `server/package.json` (dependências) | `dotenv` está **fixo em 16.4.5** intencionalmente (v17+ tem breaking changes). Não dar "update" automático. |

### Infra e Deploy

| Arquivo | Motivo |
|---|---|
| `.env*` e `railway.json` | Contêm/referenciam credenciais. Nunca commitar valores reais. Nunca exibir no chat. |
| `vercel.json` (se existir) | Configuração de routing/redirects. |
| `drizzle.config.ts` | Path de schema e driver Postgres. |

## 🚫 Comandos Proibidos

Nunca execute sem autorização explícita:

- `rm -rf` em qualquer path do projeto
- `git reset --hard` ou `git push --force`
- `git push` para branch `main` diretamente (sempre PR se possível)
- `npm install` ou `yarn install` (usar **`corepack pnpm install`** sempre)
- Qualquer comando que envolva credenciais AWS (`aws configure`, `aws s3 rm`, etc.) sem confirmação
- `drizzle-kit drop` ou qualquer operação destrutiva no DB
- Rotações de secrets em Railway/Vercel sem aviso (isso é trabalho do Felipe)

## 🎯 Padrões Obrigatórios de Código

### TypeScript

```ts
// ❌ PROIBIDO
function handleUser(data: any) { ... }
const result: any = fetch(...);

// ✅ CORRETO
interface UserData { id: string; email: string; }
function handleUser(data: UserData) { ... }
const result: Response = await fetch(...);
```

### Imports no Backend (ESM)

```ts
// ❌ PROIBIDO (quebra em runtime)
import { auth } from './lib/auth';
import { db } from '../db';

// ✅ CORRETO
import { auth } from './lib/auth.js';
import { db } from '../db/index.js';
```

### Imports no Frontend (Vite resolve)

```ts
// ✅ Ambos funcionam, prefira o alias @/
import { Button } from '../../components/ui/button';
import { Button } from '@/components/ui/button';  // PREFERIDO
```

### Routing

```tsx
// ❌ PROIBIDO
import { Link, useNavigate } from 'react-router-dom';
const navigate = useNavigate();

// ✅ CORRETO
import { Link, useLocation } from 'wouter';
const [, navigate] = useLocation();
```

### Auth no Frontend

```tsx
// ❌ PROIBIDO (causa state_mismatch ou 404 em OAuth)
import { signIn } from '@/lib/auth-client';
await signIn.social({ provider: 'github' });

// ❌ TAMBÉM PROIBIDO (POST AJAX quebra cookies cross-site em Comet/Brave/anônimo)
const resp = await fetch(`${API_URL}/api/auth/sign-in/social`, {
  method: 'POST', credentials: 'include',
  body: JSON.stringify({ provider, callbackURL }),
});
window.location.href = (await resp.json()).url;

// ✅ CORRETO (top-level navigation direta)
import { LoginButton } from '@/components/LoginButton';
<LoginButton provider="github" className="w-full h-12" />

// LoginButton por dentro faz:
// window.location.href = `${API_URL}/api/auth/oauth-start?provider=X&callbackURL=Y`
// Backend seta cookie + 302 no MESMO navigation event, cookie persiste.

// ✅ CORRETO (verificar estado de auth)
import { useAuthContext } from '@/contexts/AuthContext';
const { user, isLoggedIn, isLoading, logout } = useAuthContext();
```

### Logs (backend)

```ts
// ❌ PROIBIDO
console.log('🎉 Server started!');
console.log(`👤 User logged in: ${user.email}`);

// ✅ CORRETO (emojis quebram em alguns loggers/terminais do Railway)
console.log('Server started on port', PORT);
console.log('User authenticated', { userId: user.id });
```

## 🔐 Segurança Inegociável

1. **Nunca logar emails, senhas, tokens, ou PII completo**. Use prefixo/hash quando precisar debugar.
2. **Nunca exibir** conteúdo de `.env` no chat, mesmo se pedido. Responder: "Esse arquivo contém credenciais e não pode ser exibido."
3. **Nunca fazer hard-code** de credenciais. Sempre `process.env.NOME_DA_VAR`.
4. **Nunca desabilitar** validação de CORS, mesmo temporariamente ("só pra testar").
5. **Nunca usar** `cors({ origin: '*' })` ou `cors({ origin: true })`. Manter whitelist com regex.
6. **Sempre validar inputs** com checks básicos (tipo, null, length) antes de usar.

## 🚨 Regras de Arquitetura Inegociáveis

### Rota `/` DEVE ser a Landing Page Pública

```tsx
// ❌ PROIBIDO (quebra SEO e primeira impressão do visitante)
<Route path="/" component={SplashScreen} />  // força login
<Route path="/" component={() => <Redirect to="/login" />} />
<Route path="/" component={Dashboard} />  // exige auth

// ✅ CORRETO
<Route path="/" component={LandingPage} />  // Hero, About, Plans, FAQ, etc.
// Dentro do LandingPage: useEffect que redireciona se isLoggedIn → /dashboard
```

**Por quê:** o site é uma plataforma pública de cloud gaming. A rota `/` é o que Google indexa, o que marketing divulga, o que visitantes novos veem. Transformar em splash/redirect destrói:
- SEO (spider vê página vazia)
- Marketing (link compartilhado não mostra o produto)
- Conversão (visitante não vê Plans, Features antes de decidir criar conta)

**Fluxo híbrido correto:**
- `/` (anônimo) → LandingPage completa (Hero + About + Founders + Plans + HowItWorks + Features + FAQ + Footer)
- `/` (logado) → redirect automático pra `/dashboard` via `useEffect`
- `/login` → tela de OAuth (não é a landing)
- `/dashboard` → área logada, com proteção de rota

### Imports SEMPRE no Topo do Arquivo

```tsx
// ❌ PROIBIDO
export function Dashboard() { /* ... */ }

// Import Calendar icon
import { Calendar } from 'lucide-react';  // <-- no final, feio e bug-prone

// ✅ CORRETO
import { Calendar, Clock, Settings } from 'lucide-react';

export function Dashboard() { /* ... */ }
```

JavaScript hoist imports silenciosamente, mas o código fica:
- Difícil de revisar (reviewer não sabe o que o arquivo depende sem ler tudo)
- Fonte de bugs (se mover o export, import pode ficar órfão)
- Anti-pattern universal de ESM

### OAuth: Cookies Cross-Site e Subdomínio

**Problema:** frontend em `oriscloud.com.br` e backend em `oris-backend-api-production.up.railway.app` = **domínios totalmente diferentes**. Browsers privacy-first (Comet, Brave, Chrome anônimo, Firefox strict) bloqueiam cookies cross-site → sessão Better Auth não persiste → user volta pra `/login` mesmo após OAuth.

**Mitigação atual (parcial):**
- Endpoint `GET /api/auth/oauth-start` no backend faz redirect 302 com Set-Cookie no MESMO navigation event (resolve state_mismatch em 90%+ dos browsers)
- `advanced.defaultCookieAttributes` do Better Auth tem `secure: true, sameSite: 'none'`
- CORS tem `credentials: true` + origin específico

**Solução definitiva (pendente):** mover backend pra subdomínio `api.oriscloud.com.br` via DNS CNAME. Aí cookies viram first-party (mesma SLD `oriscloud.com.br`) e funcionam em TODO browser.

**Status:** funciona em Chrome normal, Edge, Firefox padrão, Safari padrão. Não funciona em Comet, Brave, Chrome anônimo. Decisão do Felipe: aceitar limitação atual até migração pra subdomínio.

### Componentes de Ícone PRECISAM Ser Importados Explicitamente

TypeScript permite `icon: Calendar` mesmo sem import porque `Calendar` pode existir como tipo DOM (`window.Calendar` em alguns navegadores). Mas em runtime o React tenta renderizar `<Calendar />` e crasha com `ReferenceError`.

**Regra:** toda referência a componente de ícone (`Calendar`, `Clock`, `User`, etc.) exige import explícito de `lucide-react`. Não confiar no TypeScript pra pegar esse bug.

## 🧪 Checklist Pré-Entrega

Antes de entregar código para o usuário, responda mentalmente:

- [ ] Nenhum arquivo da tabela "Intocáveis" foi modificado?
- [ ] Todos os imports do backend têm extensão `.js`?
- [ ] Nenhum `any` no código?
- [ ] Usando `wouter` para routing, não `react-router-dom`?
- [ ] Todos os textos visíveis ao usuário estão em pt-BR?
- [ ] Sem emojis em logs de servidor?
- [ ] Sem credenciais hardcoded?
- [ ] Código completo, sem placeholders tipo `// ...`?
- [ ] Build passaria com `corepack pnpm run build`?

Se qualquer resposta for "não", **corrija antes de entregar**.
