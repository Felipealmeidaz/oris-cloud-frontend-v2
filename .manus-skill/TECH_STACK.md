# Tech Stack — Oris Cloud

## Visão Geral

| Camada | Tecnologia | Versão | Notas |
|---|---|---|---|
| **Frontend Framework** | React | 18.x | Com hooks, sem class components |
| **Build Tool** | Vite | 5.x | HMR, build otimizado |
| **Linguagem** | TypeScript | 5.x | Strict mode ligado |
| **Routing** | Wouter | 3.x | **NÃO usar react-router-dom** |
| **Styling** | TailwindCSS | 3.x | Com CSS variables para theming |
| **Component Library** | shadcn/ui | latest | Copy-paste, não é pacote npm |
| **Animações** | framer-motion | 11.x | Uso extenso no projeto |
| **Ícones** | lucide-react | latest | **Único pacote de ícones autorizado** |
| **Backend Framework** | Express | 4.x | Com TypeScript |
| **Módulo Sistema** | ESM (`"type": "module"`) | - | Imports locais exigem `.js` |
| **ORM** | Drizzle ORM | latest | Com driver `postgres-js` |
| **Database** | PostgreSQL | 15+ | Railway managed |
| **Cache / Session** | Redis | 7+ | Railway managed |
| **Auth** | Better Auth | latest | OAuth Google, GitHub, Discord |
| **Package Manager** | pnpm via corepack | latest | **NÃO usar npm/yarn** |
| **Deploy Frontend** | Vercel | - | Auto-deploy de `main` |
| **Deploy Backend** | Railway | - | Dois serviços: API + DB/Redis |
| **Cloud Gaming Infra** | AWS EC2 GPU | - | São Paulo region |

## Comandos Essenciais

```powershell
# Na raiz do repo oris-cloud-railway:
corepack pnpm install              # Instalar dependências
corepack pnpm run dev              # Dev server (frontend em 5173)
corepack pnpm run build            # Build de produção
corepack pnpm run build:server     # Só backend
corepack pnpm run start            # Start servidor de produção (migração + node)

# Deploy manual (raramente necessário, Vercel auto-deploya):
vercel --prod --yes                # Deploy frontend produção
railway up                         # Deploy backend (na pasta /server)
```

## Convenções de Imports

### Frontend (`client/`)

```ts
// Preferir alias @/
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';

// Third-party sem mudança
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
```

### Backend (`server/`)

```ts
// ⚠️ OBRIGATÓRIO: extensão .js em imports locais
import { auth } from './lib/auth.js';
import { db } from './db/index.js';
import * as schema from './db/schema.js';

// Third-party sem extensão
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/postgres-js';
```

## Variáveis de Ambiente

### Frontend (Vercel + `.env.local` para dev)

| Variável | Uso |
|---|---|
| `VITE_API_URL` | URL do backend (ex: `https://oris-backend-api-production.up.railway.app`) |

### Backend (Railway + `.env` para dev)

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Postgres connection string (Railway auto-injeta) |
| `REDIS_URL` | Redis connection string (Railway auto-injeta) |
| `BETTER_AUTH_SECRET` | Secret de 32+ chars para assinar cookies |
| `BETTER_AUTH_URL` | URL pública do backend |
| `GOOGLE_CLIENT_ID` | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GITHUB_CLIENT_ID` | OAuth GitHub |
| `GITHUB_CLIENT_SECRET` | OAuth GitHub |
| `NODE_ENV` | `production` em Railway |
| `PORT` | Railway injeta automaticamente |

**Nunca commitar valores reais destas variáveis.** Templates `.env.example` podem ter nomes, nunca valores.

## Dependências Principais (package.json)

### Frontend (`/package.json`)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "wouter": "^3.3.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "@radix-ui/react-*": "shadcn primitives",
    "tailwindcss": "^3.4.0",
    "better-auth": "latest"
  }
}
```

### Backend (`server/package.json`)

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/scripts/migrate.js && node dist/main.js",
    "migrate": "tsx src/scripts/migrate.ts"
  },
  "dependencies": {
    "express": "^4.19.0",
    "cors": "^2.8.5",
    "dotenv": "16.4.5",               // ⚠️ FIXO nesta versão
    "better-auth": "latest",
    "drizzle-orm": "latest",
    "postgres": "latest"
  }
}
```

**Não fazer upgrade automático do `dotenv`** — v17+ tem breaking changes.

## Regras de Adição de Dependências

Antes de adicionar qualquer pacote novo, verifique:

1. **Já existe algo no stack** que resolve? (Ex: não adicionar `date-fns` se `Intl.DateTimeFormat` resolve)
2. **Peso no bundle?** Evitar libs > 50KB gzipped no frontend
3. **Manutenção ativa?** Verificar last publish < 6 meses
4. **Licença permissiva?** MIT, Apache 2.0, BSD. Evitar GPL/AGPL
5. **Tem tipos TypeScript?** Se não, verificar `@types/*` ou evitar

**Pacotes BLOQUEADOS** (não adicionar):

- `react-router-dom`, `react-router` → usar `wouter`
- `redux`, `@reduxjs/toolkit`, `mobx`, `zustand`, `jotai` → usar `useState`/`useContext`
- `axios` → usar `fetch` nativo
- `moment` → usar `date-fns` ou `Intl`
- `lodash` (completo) → importar funções individuais se absolutamente necessário
- `styled-components`, `emotion` → usar TailwindCSS
- Qualquer lib de ícones além de `lucide-react`
