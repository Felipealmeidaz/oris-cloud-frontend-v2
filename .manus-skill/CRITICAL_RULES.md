# Regras Críticas — Oris Cloud

## ⛔ Arquivos Intocáveis (NUNCA modificar sem autorização explícita do Felipe)

Estes arquivos contêm lógica crítica que já foi debugada e está em produção. **Qualquer alteração quebra o sistema**. Se a tarefa parece exigir modificá-los, **pare e peça confirmação**.

### Frontend (repositório `oris-cloud-frontend-v2`)

| Arquivo | Motivo |
|---|---|
| `client/src/components/LoginButton.tsx` | Bypass manual do SDK Better Auth. O SDK tenta fazer fetch AJAX para a URL de authorize do provider (GitHub/Google), o que retorna 404 por CORS. Este componente faz fetch direto pro backend e redirect via `window.location.href`. **Qualquer "melhoria" reintroduz o bug de 404**. |
| `client/src/lib/auth-client.ts` | Configuração do Better Auth client com `fetchOptions.credentials: 'include'` crítico para cookies cross-site. |
| `client/src/contexts/AuthContext.tsx` | Interface pública `useAuthContext()` é consumida por múltiplos componentes. Mudanças na API quebram Header, Dashboard, ProtectedRoute. |

### Backend (repositório `oris-cloud-railway`, pasta `server/`)

| Arquivo | Motivo |
|---|---|
| `server/src/lib/auth.ts` | Configuração do Better Auth com Drizzle adapter. `trustedOrigins`, `socialProviders`, `session cookieCache` e `advanced.defaultCookieAttributes.secure:true` foram ajustados após debugging extenso. **Modificar quebra o fluxo OAuth**. |
| `server/src/db/schema.ts` | Schema das tabelas `user`, `session`, `account`, `verification` seguindo spec exata do Better Auth. Adicionar/remover campos ou mudar constraints causa falha em runtime. |
| `server/src/main.ts` (middleware order) | `app.all('/api/auth/*', toNodeHandler(auth))` **DEVE** vir ANTES de `express.json()`. Better Auth precisa do raw body. Inverter quebra OAuth. |
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
// ❌ PROIBIDO (causa 404 em OAuth)
import { signIn } from '@/lib/auth-client';
await signIn.social({ provider: 'github' });

// ✅ CORRETO (usar o componente LoginButton existente)
import { LoginButton } from '@/components/LoginButton';
<LoginButton provider="github" className="w-full h-12" />

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
