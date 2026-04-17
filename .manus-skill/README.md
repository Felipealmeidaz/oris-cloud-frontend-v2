# Oris Cloud — Skill do Manus

Esta pasta é uma **skill customizada** para o Manus AI, contendo todo o contexto, regras e padrões do projeto Oris Cloud. Quando ativada, ela faz o Manus entregar código com zero desvios da arquitetura escolhida e zero bugs dos que já causou antes.

## Como Subir no Manus

1. Abrir o painel **Habilidades** no Manus (o menu da imagem que você me mandou).
2. Clicar em **+ Adicionar** → **Fazer upload de habilidade**.
3. Selecionar a **pasta** `.manus-skill/` inteira (ou compactar em `.zip` antes se o uploader não aceitar pasta direto).
4. Aguardar o parse do `SKILL.md` (Manus lê o frontmatter YAML no topo).
5. Verificar se aparece na lista de habilidades ativas com nome `oris-cloud-dev`.

### Alternativa: via GitHub

Se preferir manter sincronizado com o repo:

1. No Manus, **+ Adicionar** → **Importar do GitHub**
2. Cole o link: `https://github.com/Felipealmeidaz/oris-cloud-frontend-v2/tree/main/.manus-skill` (ajustar se o caminho mudar)
3. Manus vai puxar automaticamente atualizações futuras

## Arquivos Incluídos

| Arquivo | Conteúdo |
|---|---|
| `SKILL.md` | Entrada principal. Metadata + resumo + comportamento esperado. |
| `CRITICAL_RULES.md` | Lista de arquivos intocáveis e bugs históricos a evitar. |
| `TECH_STACK.md` | Versões de libs, convenções de imports, comandos de build. |
| `PROJECT_STRUCTURE.md` | Mapa de pastas + fluxo de rotas + fluxo OAuth. |
| `DESIGN_SYSTEM.md` | Paleta, tipografia, animações, componentes aprovados. |
| `templates/page-template.tsx` | Template de página (rota). |
| `templates/component-template.tsx` | Template de componente reutilizável. |

## Quando o Manus Deve Ativar Esta Skill

Automaticamente, quando o usuário mencionar qualquer um destes termos:

- "oris cloud", "oriscloud", "oriscloud.com.br"
- "cloud gaming" (no contexto do projeto do Felipe)
- Nome dos repositórios: `oris-cloud-frontend-v2`, `oris-cloud-railway`
- Bibliotecas do stack: "better auth", "wouter"
- Arquivos específicos: "LoginButton.tsx", "AuthContext.tsx", etc.

## Como Manter Atualizada

Esta skill é versionada junto com o código-fonte no git. Quando houver mudança de arquitetura relevante (ex: nova lib adicionada, endpoint novo crítico, decisão de design nova), **atualizar os arquivos `.md` correspondentes** e fazer commit.

Checklist de atualização:

- [ ] Mudança em stack? Atualizar `TECH_STACK.md`
- [ ] Novo arquivo intocável? Atualizar `CRITICAL_RULES.md`
- [ ] Nova estrutura de pasta? Atualizar `PROJECT_STRUCTURE.md`
- [ ] Nova cor/animação padrão? Atualizar `DESIGN_SYSTEM.md`
- [ ] Bug do Manus recorrente? Adicionar seção em `CRITICAL_RULES.md` → "Histórico de Bugs"

Após atualizar, re-subir a skill no Manus (ou se estiver via GitHub, ele puxa automaticamente).

## Versão

**v1.0.0** — Criada em outubro de 2025 após debugging extenso da integração Better Auth + OAuth.

## Lint Warnings

Os arquivos `.md` podem ter warnings de `markdownlint` (espaçamento de tabelas, URLs sem `<>`). **Ignorar** — são cosméticos e não afetam a leitura pelo Manus. Não gaste tempo corrigindo.
