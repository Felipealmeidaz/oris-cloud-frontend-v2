/**
 * Rate Limiting System - In-Memory Implementation
 * 
 * Sistema de controle de taxa de requisições usando Map em memória.
 * Adequado para single-instance deployments. Para produção com múltiplas
 * instâncias, considerar migração para Redis distribuído.
 * 
 * Limites configurados:
 * - Login: 20 tentativas a cada 5 minutos
 * - API Geral: 150 requisições por minuto
 * - Token Redeem: 10 tentativas por hora
 * - Email: 10 emails por hora
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Limpar entradas expiradas a cada 5 minutos
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Cleanup manual do rate limiter
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.store.clear();
  }

  /**
   * Verifica se uma requisição está dentro do limite
   * @param identifier - Identificador único (ex: IP, userId)
   * @param limit - Número máximo de requisições
   * @param windowMs - Janela de tempo em milissegundos
   * @returns { success: boolean, remaining: number, resetAt: number }
   */
  check(identifier: string, limit: number, windowMs: number): {
    success: boolean;
    remaining: number;
    resetAt: number;
    limit: number;
  } {
    const now = Date.now();
    const key = `${identifier}:${limit}:${windowMs}`;
    const entry = this.store.get(key);

    // Se não existe ou expirou, criar nova entrada
    if (!entry || entry.resetAt <= now) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      
      return {
        success: true,
        remaining: limit - 1,
        resetAt,
        limit,
      };
    }

    // Se excedeu o limite
    if (entry.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
        limit,
      };
    }

    // Incrementar contador
    entry.count++;
    this.store.set(key, entry);

    return {
      success: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
      limit,
    };
  }

  /**
   * Remove entradas expiradas do store
   */
  private cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[RateLimiter] Limpeza: ${removed} entradas removidas`);
    }
  }

  /**
   * Reseta o limite para um identificador específico
   */
  reset(identifier: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(identifier)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Retorna estatísticas do rate limiter
   */
  getStats() {
    return {
      totalKeys: this.store.size,
      activeEntries: Array.from(this.store.values()).filter(
        e => e.resetAt > Date.now()
      ).length,
    };
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

// Configurações pré-definidas
export const RateLimitConfig = {
  // Login: 20 tentativas a cada 5 minutos
  LOGIN: { limit: 20, windowMs: 5 * 60 * 1000 },
  
  // API Geral: 150 requisições por minuto
  API: { limit: 150, windowMs: 60 * 1000 },
  
  // Token Redeem: 10 tentativas por hora
  TOKEN_REDEEM: { limit: 10, windowMs: 60 * 60 * 1000 },
  
  // Email: 10 emails por hora
  EMAIL: { limit: 10, windowMs: 60 * 60 * 1000 },
  
  // Password Reset: 5 tentativas por hora
  PASSWORD_RESET: { limit: 5, windowMs: 60 * 60 * 1000 },
  
  // Payment Creation: 20 pagamentos por hora
  PAYMENT_CREATE: { limit: 20, windowMs: 60 * 60 * 1000 },
} as const;

/**
 * Helper para extrair identificador da requisição (IP ou userId)
 */
export function getRequestIdentifier(req: Request, userId?: string): string {
  // Priorizar userId se disponível (mais específico)
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback para IP
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  
  const ip = forwardedFor?.split(',')[0].trim() || 
             realIp || 
             cfConnectingIp || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Aplica rate limiting a uma requisição
 * @returns null se dentro do limite, Response com erro 429 se excedido
 */
export function applyRateLimit(
  identifier: string,
  config: { limit: number; windowMs: number }
): { success: boolean; remaining: number; resetAt: number; limit: number } | null {
  const result = rateLimiter.check(identifier, config.limit, config.windowMs);
  return result.success ? null : result;
}

/**
 * Cria Response 429 Too Many Requests
 */
export function createRateLimitResponse(result: {
  remaining: number;
  resetAt: number;
  limit: number;
}): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: retryAfter,
      limit: result.limit,
      resetAt: new Date(result.resetAt).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

/**
 * Middleware helper para aplicar rate limiting
 */
export async function withRateLimit(
  req: Request,
  config: { limit: number; windowMs: number },
  userId?: string
): Promise<Response | null> {
  const identifier = getRequestIdentifier(req, userId);
  const result = rateLimiter.check(identifier, config.limit, config.windowMs);
  
  if (!result.success) {
    return createRateLimitResponse(result);
  }
  
  return null;
}

// Exportar instância para testes/debug
export { rateLimiter };

export default rateLimiter;
