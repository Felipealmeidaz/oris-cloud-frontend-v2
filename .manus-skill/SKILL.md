---
name: oris-cloud-dev
description: Skill para desenvolvimento do projeto Oris Cloud (plataforma brasileira de cloud gaming). Ative sempre que o usuário mencionar Oris Cloud, oriscloud.com.br, cloud gaming, ou solicitar modificações em qualquer arquivo dos repositórios oris-cloud-frontend-v2 / oris-cloud-railway. Contém regras críticas, stack técnico, estrutura e design system que DEVEM ser seguidos sem exceção.
version: 1.0.0
author: Felipe (Z2ky)
triggers:
  - oris cloud
  - oriscloud
  - cloud gaming
  - oris-cloud-frontend
  - oris-cloud-railway
  - better auth
  - oriscloud.com.br
---

# Oris Cloud — Skill de Desenvolvimento

## Resumo do Projeto

**Oris Cloud** é uma plataforma brasileira de **cloud gaming** (competindo com GeForce NOW e Shadow.tech). Oferece máquinas virtuais AWS com GPU para gamers que não querem investir em hardware caro.

- **Site em produção:** https://oriscloud.com.br
- **Stack:** React 18 + Vite + TypeScript (frontend), Express + TypeScript (backend), PostgreSQL + Redis, Better Auth (OAuth), AWS (infra gaming), Vercel (deploy frontend), Railway (deploy backend)
- **Mercado:** Brasil, São Paulo
- **Fundadores:** Adryan (S2) e Felipe (Z2ky)

## Arquivos Obrigatórios a Ler ANTES de Qualquer Edição

Sempre consulte estes documentos de referência **antes** de gerar ou modificar código:

1. **CRITICAL_RULES.md** — Lista de arquivos que NUNCA devem ser modificados e comportamentos proibidos. Violar isso quebra produção.
2. **TECH_STACK.md** — Versões exatas, libs permitidas, convenções de imports (incluindo a regra crítica de extensão `.js` no backend ESM).
3. **PROJECT_STRUCTURE.md** — Mapa de diretórios e responsabilidades de cada pasta.
4. **DESIGN_SYSTEM.md** — Paleta de cores, padrões de animação `framer-motion`, componentes `shadcn/ui` disponíveis, exemplos de código aprovados.

## Comportamento Esperado

### ✅ Sempre fazer

- Escrever em **português do Brasil** nos comentários e documentação (idioma do projeto)
- Usar **`wouter`** para routing (nunca `react-router-dom`)
- Usar **`corepack pnpm`** para comandos de package manager (nunca `npm` ou `yarn`)
- Adicionar extensão **`.js`** em imports locais do backend (ESM requirement)
- Preservar a configuração de **CORS whitelist com regex** em `server/src/main.ts`
- Entregar código **completo, sem placeholders** do tipo `// resto do código aqui`
- Validar mentalmente um `pnpm run build` antes de entregar
- Manter todos os tipos TypeScript **explícitos** (zero `any` implícito)
- Usar **Better Auth** via SDK `@/lib/auth-client.ts` e contexto `useAuthContext()`
- Seguir a convenção de imports com alias **`@/`** (mapeado para `client/src/`)

### ❌ Nunca fazer

- Modificar `client/src/components/LoginButton.tsx` (tem bypass crítico do SDK Better Auth)
- Modificar `client/src/lib/auth-client.ts`, `server/src/lib/auth.ts`, `server/src/db/schema.ts` sem ler CRITICAL_RULES.md
- Trocar a stack (React Router, Next.js, styled-components, Redux, Zustand, etc.)
- Adicionar dependências pesadas sem justificativa (gráficos complexos, state libs, etc.)
- Usar `any` explícito ou implícito em TypeScript
- Fazer `fetch` direto para URLs de providers OAuth (Google/GitHub) — sempre via backend `/api/auth/*`
- Commitar credenciais, tokens, chaves API ou `.env` files
- Criar arquivos `.md` de "progresso" ou "relatório" espalhados pelo projeto
- Usar emojis dentro de código, logs de servidor ou commits (apenas UI se solicitado)
- Renomear exports públicos existentes sem aviso explícito

## Workflow de Entrega

Quando o usuário pedir uma modificação:

1. **Ler CRITICAL_RULES.md** primeiro e verificar se a tarefa toca em algum arquivo proibido
2. **Identificar o escopo mínimo** da mudança (evitar refactor desnecessário)
3. **Gerar código completo** de cada arquivo modificado — nada de "resto omitido"
4. **Entregar em blocos de código** organizados por arquivo, com caminho absoluto no cabeçalho
5. **Listar explicitamente** o que foi alterado e o que foi preservado
6. **Sugerir comando de build** (`corepack pnpm run build`) para validação

## Histórico de Bugs Causados Por Mudanças Indevidas

Respeitar esta lista — são erros reais cometidos em sessões anteriores que quebraram produção:

- **404 em OAuth GitHub**: causado por mudança no `LoginButton.tsx` que reintroduziu o fetch via SDK em vez do redirect manual. **FIX**: deixar `LoginButton.tsx` intocado.
- **CORS blocking em Railway**: causado por reordenação de middleware. **FIX**: `toNodeHandler(auth)` DEVE vir ANTES de `express.json()`.
- **`ReferenceError: __dirname is not defined`**: causado por uso de `__dirname` direto em módulo ESM. **FIX**: sempre usar `fileURLToPath(import.meta.url)`.
- **Build falha com `Cannot find module`**: causado por import sem extensão `.js` em backend ESM. **FIX**: imports locais SEMPRE com `.js` no backend (frontend não precisa, Vite resolve).
- **Runtime error `reflect-metadata`**: causado por import deixado por engano. **FIX**: não importar bibliotecas que não são usadas.

## Contato com o Desenvolvedor Principal

Qualquer dúvida crítica sobre arquitetura ou decisão de negócio, **pare e pergunte** ao Felipe antes de prosseguir. O Manus não tem autoridade para:

- Trocar provider de deploy (Vercel/Railway)
- Trocar banco de dados
- Trocar biblioteca de auth (Better Auth foi decisão arquitetural)
- Alterar preços ou conteúdo de marketing sem aprovação
- Modificar credenciais OAuth (Google, GitHub, Discord)
