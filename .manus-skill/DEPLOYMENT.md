# Workflow de Deploy — Oris Cloud

## ⚠️ REALIDADE CRÍTICA QUE O MANUS DEVE ENTENDER

O Manus TEM MCP GitHub ativo e **consegue fazer commits + push diretamente no repositório** `Felipealmeidaz/oris-cloud-frontend-v2`. Mas **NÃO tem controle sobre o Vercel** — o Vercel deveria auto-deployar a cada push na `main`, mas às vezes o webhook falha silenciosamente (especialmente quando o commit vem via API em vez de git CLI).

### O Que O Manus PODE Fazer

- ✅ Gerar código correto com base nas outras seções desta skill
- ✅ Fazer commits + push via MCP GitHub no repo `oris-cloud-frontend-v2`
- ✅ Ler arquivos remotos do repositório via GitHub API
- ✅ Criar Pull Requests para revisão
- ✅ Verificar `x-vercel-id` e outros headers do site para detectar se deploy ocorreu

### O Que O Manus NÃO PODE Fazer

- ❌ Acessar `c:\Users\felip\Downloads\Projetos\...` (é o disco local do Felipe, diferente do repo)
- ❌ Rodar `vercel --prod --yes` (CLI não está no ambiente do Manus)
- ❌ Acessar o dashboard web do Vercel, Railway, GitHub
- ❌ Ver logs de build do Vercel (só o Felipe tem acesso)
- ❌ Forçar re-deploy no Vercel quando o webhook falha
- ❌ **PRETENDER** que o deploy completou só porque o commit foi feito

### Fluxo Real de Deploy (quando funciona)

```
1. Manus gera código localmente
2. Manus faz commit + push via MCP GitHub → branch main
3. GitHub webhook dispara para Vercel
4. Vercel builda e deploya em 30-90s
5. oriscloud.com.br recebe a nova versão
6. Felipe confirma visualmente (com hard refresh)
```

### Fluxo Quando o Webhook Falha (acontece)

```
1-2. Manus gera + commita + pusha (OK)
3. Webhook NÃO dispara (bug conhecido: commits via API às vezes não triggeram)
4. Vercel fica na versão antiga
5. Felipe reporta: "não mudou!"
6. Manus DEVE:
   - Pedir ao Felipe confirmar que o commit está no GitHub (link direto)
   - Se commit existe, orientar Felipe a rodar deploy manual:
       vercel --prod --yes
   - OU abrir o Vercel Dashboard → ultimo deploy → Redeploy
```

## 🔁 Arquitetura de Deploy

### Frontend

```
Felipe edita código local
    ↓
git commit + git push origin main
    ↓
GitHub: repo Felipealmeidaz/oris-cloud-frontend-v2
    ↓ (webhook)
Vercel detecta push na main
    ↓
Vercel build (pnpm run build → vite build)
    ↓
Deploy em oriscloud.com.br (auto-alias)
```

**Tempo total: 30 a 90 segundos** após o `git push`.

### Backend

```
Felipe edita código local em server/
    ↓
git commit + git push origin main
    ↓
GitHub: repo separado OU mesmo monorepo
    ↓ (webhook)
Railway detecta push
    ↓
Railway build + deploy
    ↓
API disponível em oris-backend-api-production.up.railway.app
```

## 📋 Protocolo Obrigatório de Entrega de Código

Toda vez que o Manus for fazer uma mudança de código, DEVE seguir estes passos:

### 1. Gerar o Código

Com base nas regras da skill. Código completo, sem "resto omitido", sem `any`, com imports corretos.

### 2. Identificar Cada Arquivo Modificado

Para cada arquivo, entregar em um bloco separado com cabeçalho claro:

```markdown
## Arquivo 1 de 3: `client/src/pages/Login.tsx` (substituição completa)

(código completo aqui)

## Arquivo 2 de 3: `client/src/components/Header.tsx` (modificação parcial)

(indicar linha exata da mudança ou fornecer trecho com contexto)
```

### 3. Instruir O Felipe Explicitamente

No final da resposta, incluir um bloco claro como este:

```markdown
## 🚀 Como aplicar essas mudanças

1. Abra o projeto local em: `c:\Users\felip\Downloads\Projetos\oris-cloud-railway`
2. Substitua o conteúdo do arquivo `client/src/pages/Login.tsx` pelo código acima
3. [se mais arquivos] Substitua `client/src/components/Header.tsx` pelo código da seção "Arquivo 2"
4. Abra o terminal PowerShell na raiz do projeto e rode:
   ```powershell
   corepack pnpm run build
   ```
   Confirme que o build passa sem erros TypeScript.
5. Commit e push:
   ```powershell
   git add -A
   git commit -m "feat(frontend): redesign login page"
   git push origin main
   ```
6. Aguarde 30-90 segundos. O Vercel auto-deploya em `oriscloud.com.br`.
7. Teste em janela anônima (Ctrl+Shift+N) para evitar cache.

**Me avise depois que o deploy completar para eu validar ou seguir com a próxima tarefa.**
```

### 4. NÃO Declarar "Pronto" Antes de Confirmação

O Manus **jamais** deve dizer coisas como:

- ❌ "Pronto, o deploy foi feito"
- ❌ "Já está ao ar em oriscloud.com.br"
- ❌ "Vou verificar o deploy pra você"
- ❌ "Mudança aplicada com sucesso no site"

Enquanto o Felipe não responder confirmando o push, o status real é "código entregue, aguardando deploy pelo Felipe".

Linguagem correta:

- ✅ "Código entregue. Quando fizer o push, me avise que continuo."
- ✅ "Após o deploy, teste X, Y, Z e me retorne o resultado."
- ✅ "Se o build falhar, cole o erro aqui que eu ajusto."

## 🔍 Debugging: "Minha Mudança Não Apareceu no Site"

Quando o Felipe reportar que algo não subiu, o Manus deve perguntar, na ordem:

### Checklist Diagnóstico

1. **O arquivo foi salvo localmente?**
   > "Você copiou o código que eu mandei e salvou em `[caminho do arquivo]`?"

2. **Houve commit?**
   > "Pode rodar `git log --oneline -3` e me mandar a saída? Preciso ver se o commit foi feito."

3. **Houve push?**
   > "O push foi pra branch `main`? Rode `git status` e confirme que não há commits não pushed (`Your branch is up to date with 'origin/main'`)."

4. **Build falhou no Vercel?**
   > "Dá pra abrir https://vercel.com e ver se o último deploy falhou? Se sim, cole aqui a mensagem de erro."

5. **Cache do browser?**
   > "Testou em janela anônima? Com Ctrl+Shift+R pra forçar reload?"

6. **Vercel integração quebrou?**
   > "Raro, mas se nenhuma das opções acima, a integração GitHub→Vercel pode ter caído. Rode `vercel --prod --yes` na raiz do projeto como deploy manual."

### Comandos Úteis pro Felipe Rodar

```powershell
# Ver últimos commits
git log --oneline -5

# Ver status do repo
git status

# Ver se há mudanças não commitadas
git diff --stat

# Forçar push se houver conflito (cuidado)
git push origin main

# Deploy manual no Vercel (se auto-deploy falhou)
vercel --prod --yes

# Ver deploys recentes do Vercel
vercel ls

# Ver logs do último deploy
vercel logs <deployment-url>

# Testar se o frontend responde
curl -I https://oriscloud.com.br

# Testar se o backend responde
curl https://oris-backend-api-production.up.railway.app/api/health
```

## 🧪 Como Validar Que Uma Mudança Foi Ao Ar

Depois do Felipe confirmar push e o Vercel deployar:

### Teste 1: Hash do Bundle Mudou

```powershell
# Antes do deploy
curl -s https://oriscloud.com.br | Select-String "assets/index-.*\.js"

# Depois do deploy
curl -s https://oriscloud.com.br | Select-String "assets/index-.*\.js"
# O hash deve ter mudado (arquivo novo)
```

### Teste 2: Conteúdo Específico

Se a mudança foi visual, abrir a URL em janela anônima e procurar o texto/elemento novo. Forçar reload com `Ctrl+Shift+R`.

### Teste 3: Headers Vercel

```powershell
curl -I https://oriscloud.com.br
# Verificar header x-vercel-id (muda a cada deploy)
# E x-vercel-cache (deve ser MISS após deploy novo)
```

## 🚨 Quando O Vercel Não Deploya Automaticamente

Causas comuns e soluções:

| Problema | Solução |
|---|---|
| Push foi pra branch errada (não `main`) | `git push origin main` explicitamente |
| Integração GitHub→Vercel quebrada | Ir em Vercel Dashboard → Project Settings → Git → Reconectar |
| Build error não reportado | Checar aba "Deployments" do Vercel, ver logs do último failed build |
| Limite de build minutes atingido | Plano Hobby tem limite. Upgrade ou esperar reset mensal |
| Protection rules no GitHub bloqueando push | Checar se há required reviews na branch `main` |
| Commit não foi pushado | `git status` mostra "Your branch is ahead of 'origin/main' by X commits" |

**Último recurso:** Felipe roda `vercel --prod --yes` manualmente. Isso bypassa GitHub completamente e faz upload direto.

## 🎯 Exemplo Correto de Entrega

> **Felipe:** "Manus, muda o texto 'Faça login para continuar' pra 'Bem-vindo ao seu arsenal' no login."
>
> **Manus (resposta correta):**
>
> Entendi. Vou modificar `client/src/pages/Login.tsx`, especificamente a linha 23. Preservando todas as regras de critical_rules.md (sem mexer em LoginButton, sem trocar dependências, sem modificar imports).
>
> ## Arquivo: `client/src/pages/Login.tsx`
>
> ```tsx
> (código completo aqui, 50 linhas)
> ```
>
> ## 🚀 Como aplicar
>
> 1. Abra `c:\Users\felip\Downloads\Projetos\oris-cloud-railway\client\src\pages\Login.tsx`
> 2. Substitua todo o conteúdo pelo código acima
> 3. Rode no terminal:
>    ```powershell
>    corepack pnpm run build
>    git add -A
>    git commit -m "feat(frontend): update login headline"
>    git push origin main
>    ```
> 4. Aguarde 30-60s pro Vercel deployar
> 5. Teste em https://oriscloud.com.br/login em janela anônima
>
> Me avise depois do deploy que eu valido ou sigo pro próximo passo.

---

## 📌 Resumo Curto Para Não Esquecer

1. **Manus entrega código completo em blocos claros**
2. **Felipe copia, salva, commita, pusha**
3. **Vercel deploya automático em 30-90s**
4. **Felipe testa em anônima e reporta**
5. **Manus só declara "pronto" após confirmação do Felipe**

Fingir que deployou quando não deployou **quebra a confiança** e **atrapalha o workflow inteiro**. É a pior coisa que o Manus pode fazer.
