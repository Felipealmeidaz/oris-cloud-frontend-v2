# Arquitetura de Segurança Kyven Cloud

**Documentação Completa do Sistema de Segurança**  
Versão: 1.0 | Data: 15 de Novembro de 2025

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação (better-auth)](#autenticação-better-auth)
3. [Rate Limiting](#rate-limiting)
4. [Validação de Entrada (Zod)](#validação-de-entrada-zod)
5. [Logging Seguro](#logging-seguro)
6. [Segurança de API Routes](#segurança-de-api-routes)
7. [Proteção de Dados Sensíveis](#proteção-de-dados-sensíveis)
8. [Segurança de Pagamentos](#segurança-de-pagamentos)
9. [Segurança de VMs Azure](#segurança-de-vms-azure)
10. [Endpoints Internos](#endpoints-internos)
11. [Validação de Email](#validação-de-email)
12. [Práticas de Deploy Seguro](#práticas-de-deploy-seguro)

---

## Visão Geral

O Kyven Cloud implementa múltiplas camadas de segurança para proteger:
- **Dados do usuário** (credenciais, emails, informações de pagamento)
- **Recursos Azure** (VMs, discos, redes)
- **Transações financeiras** (PIX via EfiBank)
- **Tokens de compra** (geração, resgate, expiração)
- **Sessões de usuário** (autenticação, autorização)

### Princípios de Segurança

1. **Defense in Depth** - Múltiplas camadas de proteção
2. **Least Privilege** - Usuários só acessam seus próprios recursos
3. **Fail Secure** - Erros resultam em negação de acesso
4. **Secure by Default** - Configurações seguras por padrão
5. **Zero Trust** - Sempre validar entrada, nunca confiar

---

## Autenticação (better-auth)

### Implementação

O sistema usa **better-auth v1.3+** (não NextAuth.js) com duas configurações:

#### Servidor (`src/lib/auth.ts`)
```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Verificação opcional
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 604800,      // 7 dias
    updateAge: 86400,        // Atualiza a cada 24h
  },
  advanced: {
    cookiePrefix: "kyven",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
```

#### Cliente (`src/lib/auth-client.ts`)
```typescript
export const { signIn, signOut, signUp, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});
```

### Middleware de Autenticação

**OBRIGATÓRIO em todas as rotas protegidas:**

```typescript
// src/lib/middleware/auth.ts
export async function requireAuth(): Promise<AuthenticatedUser | NextResponse> {
  const session = await auth.api.getSession({ headers: headers() });

  if (!session?.user) {
    logger.warn('Tentativa de acesso não autenticado');
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
```

**Padrão de Uso Correto:**
```typescript
const user = await requireAuth();
if (user instanceof NextResponse) return user; // Early return em caso de falha

// user.id, user.email, user.name disponíveis aqui
```

### Segurança de Sessão

- **Cookies HttpOnly** - JavaScript não pode acessar
- **Secure Flag** - Apenas HTTPS em produção
- **SameSite=Lax** - Proteção contra CSRF
- **Prefixo customizado** - `kyven_*` para evitar conflitos
- **Expiração automática** - 7 dias de inatividade
- **Renovação periódica** - A cada 24 horas de uso ativo

---

## Rate Limiting

### Implementação In-Memory

Sistema de rate limiting baseado em Map para single-instance deployments:

```typescript
// src/lib/ratelimit.ts
class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval?: NodeJS.Timeout;

  check(identifier: string, limit: number, windowMs: number) {
    const key = `${identifier}:${limit}:${windowMs}`;
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      // Nova janela de tempo
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    if (entry.count >= limit) {
      // Limite excedido
      return { success: false, remaining: 0, resetAt: entry.resetAt };
    }

    // Incrementa contador
    entry.count++;
    this.store.set(key, entry);
    return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.store.clear();
  }
}
```

### Configurações Pré-definidas

```typescript
export const RateLimitConfig = {
  LOGIN: { limit: 20, windowMs: 5 * 60 * 1000 },           // 20 tentativas/5min
  API: { limit: 150, windowMs: 60 * 1000 },                // 150 req/min
  TOKEN_REDEEM: { limit: 10, windowMs: 60 * 60 * 1000 },   // 10 tentativas/hora
  PAYMENT_CREATE: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 pagamentos/hora
  EMAIL_SEND: { limit: 10, windowMs: 60 * 60 * 1000 },     // 10 emails/hora
};
```

### Padrão de Uso em API Routes

**SEMPRE primeiro passo (antes de autenticação):**

```typescript
export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting (PRIMEIRO - antes de qualquer processamento)
    const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
    if (rateLimitResult) return rateLimitResult;

    // 2. Autenticação
    const user = await requireAuth();
    if (user instanceof NextResponse) return user;

    // 3. Lógica de negócio...
  } catch (error) {
    logger.error('Erro na rota', { error });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
```

### Headers de Rate Limit

Respostas incluem headers informativos:

```http
X-RateLimit-Limit: 150
X-RateLimit-Remaining: 142
X-RateLimit-Reset: 1699999999
```

Quando limite excedido (429 Too Many Requests):
```http
Retry-After: 45
```

### Identificadores de Rate Limit

- **IP Address** - Requisições não autenticadas
- **User ID** - Requisições autenticadas (mais preciso)
- **Combinado** - `${userId}:${route}` para limites por endpoint

---

## Validação de Entrada (Zod)

### Schemas Organizados

Todos os schemas Zod estão em `src/lib/validations/`:

```
src/lib/validations/
├── auth.ts          # Login, signup, verificação de email
├── payment.ts       # Criação de pagamento, webhook
├── token.ts         # Geração, resgate, verificação
├── vm.ts            # Operações de VM (start, stop, restart)
├── subscription.ts  # Gerenciamento de assinaturas
└── index.ts         # Exportações centralizadas
```

### Exemplo de Schema

```typescript
// src/lib/validations/payment.ts
export const paymentCreateSchema = z.object({
  customId: z.string().uuid().trim(),
  planName: z.enum(['Semanal', 'Quinzenal', 'Mensal', 'Trimestral']),
  email: z.string().email().toLowerCase().trim(),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
```

### Padrão de Validação em API Routes

```typescript
import { paymentCreateSchema } from '@/lib/validations/payment';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting + Auth...

    // 3. Validação com Zod
    const body = await req.json();
    const validation = paymentCreateSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Validação falhou', { errors: validation.error.format() });
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { customId, planName, email } = validation.data; // Type-safe!

    // 4. Lógica de negócio com dados validados...
  } catch (error) {
    logger.error('Erro interno', { error });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
```

### Benefícios de Type Safety

```typescript
// ❌ ERRADO - Sem validação
const { planName } = await req.json();
const price = getPlanPrice(planName); // planName pode ser qualquer coisa!

// ✅ CORRETO - Com Zod
const validation = paymentCreateSchema.safeParse(body);
if (!validation.success) return errorResponse();

const { planName } = validation.data; 
// planName é garantidamente um dos valores do enum
const price = getPlanPrice(planName); // Type-safe!
```

### Validações Customizadas

```typescript
// Validação de disk name com Azure naming rules
export const diskNameSchema = z.string()
  .min(1, 'Nome do disco é obrigatório')
  .max(80, 'Nome do disco não pode exceder 80 caracteres')
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/, {
    message: 'Nome inválido. Deve começar e terminar com letra/número.',
  })
  .refine(
    (name) => !['disk', 'snapshot', 'vm'].includes(name.toLowerCase()),
    { message: 'Nome reservado não pode ser usado' }
  );
```

---

## Logging Seguro

### Implementação Winston

Sistema de logging com **redação automática de dados sensíveis**:

```typescript
// src/lib/logger.ts
import winston from 'winston';

const sensitiveFields = [
  'password', 'token', 'secret', 'apiKey', 'authorization',
  'cookie', 'accessToken', 'refreshToken', 'privateKey', 'cert'
];

function redactSensitiveData(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in redacted) {
    if (sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'azure-service.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### Níveis de Log

```typescript
logger.error('Erro crítico', { error, userId });   // Erros que quebram funcionalidade
logger.warn('Ação suspeita', { userId, action }); // Segurança, validação falha
logger.info('Operação concluída', { userId });    // Eventos importantes
logger.debug('Detalhes técnicos', { data });      // Apenas em desenvolvimento
```

### Logging de Segurança

**Eventos que SEMPRE devem ser logados:**

1. **Falhas de autenticação**
```typescript
logger.warn('Tentativa de acesso não autenticado', {
  endpoint: req.url,
  ip: req.headers.get('x-forwarded-for'),
});
```

2. **Violações de ownership**
```typescript
logger.warn('Tentativa de acesso a recurso de outro usuário', {
  userId: user.id,
  resourceId,
  ownerId: resource.userId,
});
```

3. **Rate limit excedido**
```typescript
logger.warn('Rate limit excedido', {
  userId: user.id,
  endpoint: req.url,
  limit: config.limit,
});
```

4. **Tokens inválidos/expirados**
```typescript
logger.warn('Token inválido usado', {
  token: token.substring(0, 4) + '****', // Parcialmente redacted
  userId: user.id,
});
```

5. **Operações críticas de Azure**
```typescript
logger.info('VM deletada', { vmName, userId });
logger.warn('Falha ao criar disco', { error, userId });
```

### Redação Automática em Ação

```typescript
// Input
logger.info('Usuário autenticado', {
  email: 'user@example.com',
  password: 'secret123',        // ⚠️ Sensível
  authToken: 'abc123xyz',       // ⚠️ Sensível
  userId: '12345',
});

// Output no log
{
  "level": "info",
  "message": "Usuário autenticado",
  "email": "user@example.com",
  "password": "[REDACTED]",     // ✅ Protegido
  "authToken": "[REDACTED]",    // ✅ Protegido
  "userId": "12345",
  "timestamp": "2025-11-15T12:00:00.000Z"
}
```

---

## Segurança de API Routes

### Padrão Obrigatório (5 Camadas)

Toda rota de API deve seguir esta estrutura:

```typescript
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { someSchema } from '@/lib/validations/*';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (PRIMEIRO - proteção DDoS)
    const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
    if (rateLimitResult) return rateLimitResult;

    // 2. Autenticação (requireAuth retorna NextResponse em falha)
    const user = await requireAuth();
    if (user instanceof NextResponse) return user;

    // 3. Validação de Entrada (Zod)
    const body = await req.json();
    const validation = someSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Validação falhou', { errors: validation.error.format() });
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // 4. Ownership Check (queries user-scoped)
    const resource = await prisma.model.findFirst({
      where: { id: validation.data.id, userId: user.id }
    });
    if (!resource) {
      logger.warn('Recurso não encontrado ou não autorizado', {
        userId: user.id,
        resourceId: validation.data.id,
      });
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    // 5. Lógica de Negócio (dados validados e autorizados)
    // ...

    logger.info('Operação concluída', { userId: user.id });
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Erro interno', { error });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
```

### Ownership Enforcement

**SEMPRE verificar userId em queries:**

```typescript
// ❌ ERRADO - Qualquer usuário pode acessar qualquer disco
const disk = await prisma.disk.findUnique({ where: { id: diskId } });

// ✅ CORRETO - Apenas o dono pode acessar
const disk = await prisma.disk.findFirst({
  where: { id: diskId, userId: user.id }
});

// ✅ CORRETO - Subscription do usuário
const subscription = await prisma.subscription.findFirst({
  where: {
    userId: user.id,
    status: 'active',
    expiresAt: { gt: new Date() }
  }
});
```

### Sanitização de Erros

**NUNCA expor stack traces ou detalhes internos ao cliente:**

```typescript
// ❌ ERRADO - Vaza informações
catch (error) {
  return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
}

// ✅ CORRETO - Mensagem genérica, log detalhado
catch (error) {
  logger.error('Erro ao criar VM', { error, userId: user.id });
  return NextResponse.json({ error: 'Erro ao criar VM' }, { status: 500 });
}
```

### CORS e Headers de Segurança

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

---

## Proteção de Dados Sensíveis

### Dados que NUNCA devem vazar

1. **Senhas** - Nunca armazenadas em plaintext (bcrypt automático via better-auth)
2. **Tokens de API** - Azure, Discord, EfiBank, Resend
3. **Certificados** - EfiBank .p12, chaves privadas
4. **Secrets internos** - `INTERNAL_WEBHOOK_SECRET`, `BETTER_AUTH_SECRET`
5. **Credenciais de VM** - `AZURE_VM_PASSWORD`

### Variáveis de Ambiente (.env)

**CRÍTICO**: `.env` está no `.gitignore` para prevenir commit acidental

```bash
# ❌ NUNCA committar
.env
.env.local
.env.production

# ✅ Committar (template sem valores reais)
.env.example
```

### Geração Segura de Tokens

```typescript
import crypto from 'crypto';

// ❌ ERRADO - Previsível
const token = `${Date.now()}-${Math.random()}`;

// ✅ CORRETO - Criptograficamente seguro
const token = crypto.randomBytes(4).toString('hex').toUpperCase();
// Resultado: "A3F9B2C1" (8 caracteres hexadecimais)
```

### Disk Name Generation

```typescript
// ❌ ERRADO - Vazamento de informações do usuário
const diskName = `disk-${user.name.toLowerCase()}-${Date.now()}`;

// ✅ CORRETO - Opaco e seguro
const diskName = `disk-${user.id.substring(0, 8)}-${crypto.randomBytes(8).toString('hex')}`;
// Resultado: "disk-12345678-a3f9b2c1d4e5f6a7"
```

### Proteção de Preços

**NUNCA confiar em preços enviados pelo frontend:**

```typescript
// ❌ ERRADO - Cliente pode manipular
const { planName, price } = await req.json();
await criarCobranca(price); // ⚠️ Vulnerável!

// ✅ CORRETO - Buscar preço do banco
const plan = await prisma.plan.findUnique({
  where: { name: planName, active: true }
});
if (!plan) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });

await criarCobranca(plan.price); // ✅ Seguro
```

---

## Segurança de Pagamentos

### EfiBank/EfiPay PIX Integration

#### Configuração Segura

Certificados armazenados como strings PEM em variáveis de ambiente:

```env
EFI_CERT_PEM=-----BEGIN CERTIFICATE-----\nMII...\n-----END CERTIFICATE-----
EFI_KEY_PEM=-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----
EFI_CA_PEM=-----BEGIN CERTIFICATE-----\nMII...\n-----END CERTIFICATE-----
```

#### HTTPS Agent com Certificados

```typescript
// src/lib/efiPayments.ts
function createHttpsAgent() {
  return new https.Agent({
    cert: process.env.EFI_CERT_PEM!.replace(/\\n/g, '\n'),
    key: process.env.EFI_KEY_PEM!.replace(/\\n/g, '\n'),
    ca: process.env.EFI_CA_PEM?.replace(/\\n/g, '\n'),
    rejectUnauthorized: true, // ✅ Valida certificado do servidor
  });
}
```

#### Validação de Webhook

```typescript
// Webhook da EfiBank (NÃO usa secret - validação por txid)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pix } = body;

    if (!pix || pix.length === 0) {
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 });
    }

    const txid = pix[0].txid;

    // Validar com API da EfiBank
    const cobranca = await obterCobranca(txid);
    if (!cobranca) {
      logger.warn('Webhook com txid inválido', { txid });
      return NextResponse.json({ error: 'Txid inválido' }, { status: 400 });
    }

    // Processar pagamento...
  } catch (error) {
    logger.error('Erro no webhook', { error });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
```

#### Estados de Pagamento

```
pending → (webhook) → paid → (token gerado) → redeemed
                         ↓
                    refunded (se estoque acabar)
```

#### Proteção contra Reprocessamento

```typescript
// Verificar se webhook já foi processado
const payment = await prisma.payment.findUnique({
  where: { txid }
});

if (payment.webhook_sended) {
  logger.warn('Webhook já processado', { txid });
  return NextResponse.json({ message: 'Já processado' }, { status: 200 });
}
```

---

## Segurança de VMs Azure

### Azure Spot VMs Strategy

Todas as VMs são criadas como **Spot instances** com evictionPolicy: Deallocate:

```typescript
const vmParameters = {
  priority: 'Spot',
  evictionPolicy: 'Deallocate', // Preserva discos em eviction
  billingProfile: { maxPrice: -1 }, // Paga até preço on-demand
};
```

**Por que Spot?**
- Evita limites de quota de vCPUs padrão
- Usa quota separada ("Low Priority Cores")
- Custo até 90% menor
- Discos persistem mesmo se VM for evicted

### Resource Naming Validation

```typescript
export function validateResourceName(name: string, type: 'disk' | 'vm'): boolean {
  const maxLength = type === 'disk' ? 80 : 64;
  
  if (name.length < 1 || name.length > maxLength) return false;
  
  // Deve começar e terminar com alfanumérico
  if (!/^[a-zA-Z0-9]/.test(name) || !/[a-zA-Z0-9]$/.test(name)) return false;
  
  // Caracteres permitidos
  const allowedPattern = type === 'disk'
    ? /^[a-zA-Z0-9._-]+$/
    : /^[a-zA-Z0-9-]+$/;
    
  return allowedPattern.test(name);
}
```

### Disk Ownership Enforcement

```typescript
// Sempre verificar ownership antes de operações
const disk = await prisma.disk.findFirst({
  where: { name: diskName, userId: user.id }
});

if (!disk) {
  logger.warn('Tentativa de acessar disco de outro usuário', {
    userId: user.id,
    diskName,
  });
  return NextResponse.json({ error: 'Disco não encontrado' }, { status: 404 });
}
```

### VM Lifecycle Security

1. **Start VM**
   - Validar subscription ativa
   - Verificar ownership do disco
   - Implementar retry com exponential backoff
   - Logar todas as tentativas

2. **Stop VM**
   - Deletar VM (preserva disco)
   - Verificar ownership antes de deletar
   - Logar operação

3. **Restart VM**
   - Verificar estado atual
   - Apenas permitir se VM existe
   - Timeout de 5 minutos

### Azure Credentials

**DefaultAzureCredential** usado para autenticação:

```typescript
import { DefaultAzureCredential } from '@azure/identity';

const credential = new DefaultAzureCredential();
// Tenta automaticamente:
// 1. Variáveis de ambiente (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
// 2. Managed Identity (se em Azure VM/App Service)
// 3. Azure CLI (se logado localmente)
```

### Network Security

Todas as VMs criadas com NSG pré-configurado:

```typescript
const nicParameters = {
  location: AZURE_LOCATION,
  ipConfigurations: [{
    name: `${diskName}-ipconfig`,
    subnet: { id: AZURE_SUBNET },
    publicIPAddress: { id: publicIp.id },
  }],
  networkSecurityGroup: { id: AZURE_NSG },
};
```

NSG deve ter regras para:
- RDP (3389) - Acesso remoto Windows
- Moonlight (47990) - Streaming de jogos
- HTTPS (443) - Comunicação segura

---

## Endpoints Internos

### Proteção com INTERNAL_WEBHOOK_SECRET

Endpoints críticos protegidos com secret compartilhado:

```typescript
// src/app/api/token/generate/route.ts
export async function POST(req: NextRequest) {
  try {
    // Validar secret interno
    const authHeader = req.headers.get('authorization');
    const secret = authHeader?.replace('Bearer ', '');

    if (secret !== process.env.INTERNAL_WEBHOOK_SECRET) {
      logger.warn('Tentativa de acesso não autorizado ao endpoint interno', {
        ip: req.headers.get('x-forwarded-for'),
      });
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Lógica de geração de token...
  } catch (error) {
    logger.error('Erro ao gerar token', { error });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
```

### Endpoints Protegidos

1. **`/api/token/generate`** - Geração de tokens (apenas webhook/interno)
2. **`/api/role/give`** - Atribuição de roles Discord (apenas serverless)

### Chamadas Internas Seguras

```typescript
// Frontend → Backend interno (com secret)
const response = await fetch('/api/token/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.INTERNAL_WEBHOOK_SECRET}`,
  },
  body: JSON.stringify({ txid }),
});
```

**NUNCA expor `INTERNAL_WEBHOOK_SECRET` ao frontend!**

---

## Validação de Email

### Validação MX Records

```typescript
// src/lib/email-validation.ts
import { Resolver } from 'dns/promises';

export async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1];
    const resolver = new Resolver();
    const mxRecords = await resolver.resolveMx(domain);
    
    return mxRecords.length > 0;
  } catch (error) {
    logger.warn('Domínio sem MX records', { email });
    return false;
  }
}
```

### Bloqueio de Emails Temporários

```typescript
const TEMPORARY_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'temp-mail.org',
  'throwaway.email',
  'maildrop.cc',
  // ... mais 20+ domínios
]);

export function isTemporaryEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return TEMPORARY_EMAIL_DOMAINS.has(domain);
}
```

### Validação Completa

```typescript
export async function validateEmail(
  email: string,
  options: { checkMX?: boolean; blockTemporary?: boolean } = {}
): Promise<{ valid: boolean; reason?: string }> {
  const { checkMX = true, blockTemporary = true } = options;

  // 1. Validação de formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Formato inválido' };
  }

  // 2. Bloquear emails temporários
  if (blockTemporary && isTemporaryEmail(email)) {
    logger.warn('Email temporário bloqueado', { email });
    return { valid: false, reason: 'Emails temporários não permitidos' };
  }

  // 3. Validar MX records
  if (checkMX && !(await validateEmailDomain(email))) {
    return { valid: false, reason: 'Domínio inválido' };
  }

  return { valid: true };
}
```

### Uso em Rotas

```typescript
// Validação obrigatória em password reset
const emailValidation = await validateEmail(email);
if (!emailValidation.valid) {
  return NextResponse.json(
    { error: emailValidation.reason },
    { status: 400 }
  );
}
```

---

## Práticas de Deploy Seguro

### Checklist Pré-Deploy

#### 1. Variáveis de Ambiente

- [ ] `.env` no `.gitignore`
- [ ] `BETTER_AUTH_URL` configurado para domínio de produção (HTTPS)
- [ ] `NEXT_PUBLIC_BETTER_AUTH_URL` igual ao anterior
- [ ] `BETTER_AUTH_SECRET` gerado com `openssl rand -base64 32`
- [ ] `INTERNAL_WEBHOOK_SECRET` gerado aleatoriamente
- [ ] Certificados EfiBank em formato PEM (não file paths)
- [ ] Tokens Discord/Azure/Resend válidos

#### 2. Segurança de Código

- [ ] Nenhum `console.log` com dados sensíveis
- [ ] Todos os endpoints usam `requireAuth()`
- [ ] Rate limiting em todas as rotas
- [ ] Validação Zod em todos os inputs
- [ ] Ownership checks em queries (userId)
- [ ] Erros sanitizados (sem stack traces)

#### 3. Database

- [ ] Migrations aplicadas
- [ ] Indexes de performance criados
- [ ] RLS policies (se aplicável)
- [ ] Backup configurado

#### 4. Azure

- [ ] Service Principal com permissões mínimas
- [ ] NSG configurado corretamente
- [ ] Quota de Spot VMs solicitada
- [ ] Snapshot golden image criado

#### 5. Logging

- [ ] Winston configurado para produção (level: 'info')
- [ ] Logs rotativos (maxFiles: 5, maxsize: 10MB)
- [ ] Redação automática ativa
- [ ] Monitoramento de logs críticos (opcional)

### Vercel Deploy Configuration

```json
{
  "env": {
    "DATABASE_URL": "@database-url",
    "BETTER_AUTH_SECRET": "@better-auth-secret",
    "BETTER_AUTH_URL": "https://yourdomain.com",
    "NEXT_PUBLIC_BETTER_AUTH_URL": "https://yourdomain.com",
    "INTERNAL_WEBHOOK_SECRET": "@internal-webhook-secret",
    "AZURE_CLIENT_ID": "@azure-client-id",
    "AZURE_CLIENT_SECRET": "@azure-client-secret",
    "AZURE_TENANT_ID": "@azure-tenant-id"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

### Secrets Management

**Usar Vercel Environment Variables UI:**

1. Dashboard → Settings → Environment Variables
2. Adicionar cada variável individualmente
3. Marcar como "Sensitive" quando apropriado
4. Separar Production/Preview/Development

**NUNCA:**
- Committar `.env` no Git
- Compartilhar secrets em Slack/Discord/Email
- Reutilizar secrets entre ambientes
- Usar secrets default/exemplo em produção

### HTTPS Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
};
```

### Monitoring de Segurança

Configurar alertas para:

1. **Múltiplas falhas de autenticação** (mesmo IP/usuário)
2. **Rate limit excedido repetidamente**
3. **Tentativas de acesso a recursos de outros usuários**
4. **Erros 500 em alta frequência**
5. **Operações Azure falhando**
6. **Tokens inválidos/expirados em massa**

### Incident Response

Em caso de breach de segurança:

1. **Imediato:**
   - Pausar tráfego se possível
   - Revogar tokens comprometidos
   - Resetar `INTERNAL_WEBHOOK_SECRET`

2. **Investigação:**
   - Analisar logs do período
   - Identificar vetores de ataque
   - Listar dados potencialmente expostos

3. **Mitigação:**
   - Aplicar patches de segurança
   - Atualizar credenciais
   - Notificar usuários afetados (se dados vazaram)

4. **Pós-Mortem:**
   - Documentar incidente
   - Implementar prevenções adicionais
   - Revisar práticas de segurança

---

## Resumo de Boas Práticas

### ✅ SEMPRE

1. Use `requireAuth()` em rotas protegidas
2. Aplique rate limiting (primeiro passo)
3. Valide entrada com Zod schemas
4. Verifique ownership em queries (`userId`)
5. Use logger ao invés de `console.log`
6. Sanitize erros antes de retornar ao cliente
7. Gere tokens com `crypto.randomBytes()`
8. Busque preços do banco (nunca confie no frontend)
9. Valide email domain (MX records)
10. Mantenha `.env` no `.gitignore`

### ❌ NUNCA

1. Exponha stack traces ao cliente
2. Confie em dados do frontend (preços, permissões)
3. Use `Math.random()` para tokens/secrets
4. Commite `.env` no Git
5. Retorne dados de outros usuários
6. Skip validação de entrada
7. Log senhas/tokens sem redação
8. Reutilize secrets entre ambientes
9. Use HTTP em produção (sempre HTTPS)
10. Ignore ownership checks em queries

---

## Referências

- **better-auth Docs**: https://www.better-auth.com/docs
- **Zod Documentation**: https://zod.dev/
- **Winston Logger**: https://github.com/winstonjs/winston
- **Azure SDK**: https://learn.microsoft.com/azure/developer/javascript/
- **EfiBank API**: https://dev.efipay.com.br/docs

---

**Última Atualização**: 15 de Novembro de 2025  
**Mantenedor**: Equipe Kyven Cloud  
**Classificação**: INTERNO - Documentação Técnica
