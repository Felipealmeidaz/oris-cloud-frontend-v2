# Design System — Oris Cloud

## Identidade Visual

**Mood:** Gaming premium, minimalista, NVIDIA-inspired. Dark-first. Elegante sem ser frio. Futurista sem ser exagerado.

**Inspirações visuais:**
- https://www.nvidia.com/en-us/geforce/
- https://shadow.tech/
- https://www.vercel.com/
- https://linear.app/

**Anti-padrões** (o que evitar):
- Gradientes neon/cyberpunk saturados (tipo Twitch/Fiverr dos 2010s)
- Skeuomorfismo de qualquer tipo
- Sombras fortes ou border-radius grande (> 16px em cards principais)
- Emojis decorativos no site (contexto gaming aceita em casos pontuais, mas preferir ícones `lucide-react`)

## Paleta de Cores (CSS Variables)

Definida em `client/src/index.css`. Usar via Tailwind utilities (`bg-background`, `text-foreground`, etc.).

```css
:root {
  --background: 220 13% 5%;           /* quase preto, levemente azulado */
  --foreground: 210 10% 95%;          /* quase branco, levemente frio */
  --card: 220 13% 8%;                 /* cinza muito escuro */
  --card-foreground: 210 10% 95%;
  --border: 220 13% 15%;              /* border sutil */
  --input: 220 13% 12%;
  --primary: 210 10% 95%;             /* CTA principal = branco */
  --primary-foreground: 220 13% 5%;   /* texto em CTA = preto */
  --secondary: 220 13% 15%;
  --muted: 220 13% 15%;
  --muted-foreground: 210 10% 60%;
  --accent: 220 13% 15%;
  --destructive: 0 70% 50%;           /* vermelho de erro */
  --ring: 210 10% 95%;
  --radius: 0.5rem;                   /* 8px default */
}
```

### Cores de Acento (uso pontual)

- **Azul** `#3b82f6` (blue-500) — usado em gradientes e destaques de preço
- **Roxo** `#8b5cf6` (violet-500) — usado em gradientes junto com azul
- **Verde** `#22c55e` (green-500) — status "ativo", sucesso
- **Âmbar** `#f59e0b` (amber-500) — warnings, "em construção"
- **Vermelho** `#ef4444` (red-500) — destrutivo, erros, "sair"

**Nunca usar mais de 2 cores de acento** em uma mesma seção.

## Tipografia

Fonte padrão: **Inter** (sistema), com fallback sans-serif.

| Elemento | Classes Tailwind |
|---|---|
| Hero headline | `text-5xl md:text-7xl font-bold tracking-tight` |
| Section headline | `text-3xl md:text-4xl font-bold` |
| Subsection | `text-xl md:text-2xl font-semibold` |
| Body | `text-base text-foreground/80 leading-relaxed` |
| Small/caption | `text-sm text-foreground/60` |
| Eyebrow | `text-xs uppercase tracking-wider text-foreground/50` |

**Regra:** usar `text-foreground/XX` (com opacidade) em vez de cores cinza hardcoded, pra manter consistência com theme.

## Espaçamento

- **Container:** `container mx-auto px-4` (padding 16px em mobile, responsivo até max-width)
- **Gap entre seções:** `py-20 md:py-32`
- **Gap interno:** `gap-4`, `gap-6`, `gap-8` (seguir escala 4/8px)
- **Padding em cards:** `p-6` padrão, `p-8 md:p-12` em cards grandes

## Componentes UI Disponíveis (shadcn/ui)

Em `client/src/components/ui/`. Não editar. Uso via import:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { Tooltip } from '@/components/ui/tooltip';
```

Se precisar de um componente que não existe, adicionar via:

```powershell
corepack pnpm dlx shadcn@latest add <componente>
```

## Ícones (lucide-react)

**Única biblioteca de ícones permitida.** Importar os específicos:

```tsx
import { Menu, X, LogOut, User, Settings, Gamepad2, Server } from 'lucide-react';

<LogOut size={16} className="text-foreground/60" />
```

**Tamanhos padrão:** 14, 16, 18, 20, 24, 32. Usar `strokeWidth={1.5}` para visual mais leve.

## Padrão de Animações (framer-motion)

Todas as seções principais usam `motion` do `framer-motion`. Exemplos aprovados:

### Entrada de seção (fade + slide up)

```tsx
import { motion } from 'framer-motion';

<motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5 }}
>
  {/* conteúdo */}
</motion.section>
```

### Stagger em listas

```tsx
{items.map((item, idx) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: idx * 0.05 }}
  >
    {item.content}
  </motion.div>
))}
```

### Hover em botão/card

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15 }}
>
  Botão
</motion.button>
```

### Header fixo

```tsx
<motion.header
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ duration: 0.5 }}
  className="fixed top-0 w-full z-50"
>
```

**Regras de animação:**
- Duração máxima: 0.6s (nunca passar disso em microinterações)
- Easing: deixar o default do framer (`easeOut`). Só customizar se tiver bom motivo
- Nunca animar `box-shadow` ou `filter` diretamente (performance ruim) — usar opacidade + transform
- `whileInView` com `once: true` em seções (não reanima ao scrollar)

## Padrões de Layout

### Card padrão

```tsx
<div className="rounded-lg border border-border bg-card/40 p-6 hover:bg-card/70 hover:border-white/20 transition-all">
  {/* conteúdo */}
</div>
```

### Card destacado (com gradient)

```tsx
<div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent p-8 md:p-12">
  {/* conteúdo */}
</div>
```

### Avatar

```tsx
{user?.image ? (
  <img
    src={user.image}
    alt={displayName}
    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
  />
) : (
  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
    {initial}
  </div>
)}
```

### Badge de status

```tsx
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
  Ativo
</span>
```

### CTA primário (branco sobre preto)

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-6 py-3 bg-white text-black font-semibold rounded-sm hover:bg-gray-200 transition-colors"
>
  Ver Planos
</motion.button>
```

### CTA secundário (outline)

```tsx
<button className="px-6 py-3 border border-white/20 text-white font-semibold rounded-sm hover:bg-white/5 hover:border-white/40 transition-all">
  Saiba Mais
</button>
```

## Responsividade

**Mobile-first.** Breakpoints do Tailwind:

| Breakpoint | Tamanho | Uso |
|---|---|---|
| (default) | < 640px | Smartphones |
| `sm:` | ≥ 640px | Smartphones grandes |
| `md:` | ≥ 768px | Tablets |
| `lg:` | ≥ 1024px | Laptops |
| `xl:` | ≥ 1280px | Desktops |
| `2xl:` | ≥ 1536px | Monitores grandes |

**Regra geral:**
- Navegação colapsa em menu hamburger `< md`
- Grids multi-coluna só `≥ md` (ex: `grid md:grid-cols-2 lg:grid-cols-4`)
- Sidebars viram drawers `< md`
- Textos Hero reduzem: `text-5xl md:text-7xl`

## Acessibilidade

- Todo elemento interativo tem `aria-label` se não tiver texto visível
- `role="button"` em divs clicáveis (ou melhor, usar `<button>`)
- Contraste mínimo AA (checker: https://webaim.org/resources/contrastchecker/)
- Focus visível com `focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`
- `<html lang="pt-BR">` obrigatório

## Exemplos de Seções Aprovadas

Ver arquivos já existentes no projeto como referência canônica:

- **`client/src/components/Hero.tsx`** — estrutura de headline + CTAs + stats
- **`client/src/components/Plans.tsx`** — cards de pricing com destaque no "recomendado"
- **`client/src/components/Features.tsx`** — grid de benefícios com ícones
- **`client/src/components/Header.tsx`** — navegação com auth state integrado

Quando em dúvida sobre estilo, copiar a estrutura desses arquivos e adaptar o conteúdo.
