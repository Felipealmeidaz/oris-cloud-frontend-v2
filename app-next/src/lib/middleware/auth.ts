import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}

/**
 * Interface para usuário autenticado
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
}

/**
 * Resultado de autenticação
 */
export type AuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; response: NextResponse };

/**
 * Middleware para verificar autenticação
 * Retorna o usuário autenticado ou null
 */
export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthenticatedUser | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return null;
        }

        return session.user as AuthenticatedUser;
    } catch (error) {
        logger.error('Erro ao verificar autenticação', { error });
        return null;
    }
}

/**
 * Obtém usuário autenticado com resposta de erro automática
 * Use com early return pattern
 * 
 * @example
 * const authResult = await getAuthenticatedUserOrError();
 * if (!authResult.success) return authResult.response;
 * const { user } = authResult;
 */
export async function getAuthenticatedUserOrError(): Promise<AuthResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      logger.warn('Tentativa de acesso sem autenticação');
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Não autorizado. Faça login para continuar.' },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user: session.user as AuthenticatedUser,
    };
  } catch (error) {
    logger.error('Erro ao verificar autenticação', { error });
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Erro ao verificar autenticação' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Middleware para exigir autenticação
 * Retorna usuário ou Response de erro
 */
export async function requireAuth(req?: NextRequest): Promise<AuthenticatedUser | NextResponse> {
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
        logger.warn('Acesso negado - não autenticado');
        return NextResponse.json(
            { error: 'Não autorizado. Faça login para continuar.' },
            { status: 401 }
        );
    }
    
    return user;
}

/**
 * Valida que userId do request pertence ao usuário autenticado
 * Previne privilege escalation attacks
 * 
 * @param requestUserId - UserId vindo do request body
 * @param authenticatedUserId - UserId da sessão autenticada
 * @returns NextResponse de erro ou null se válido
 */
export function validateUserOwnership(
  requestUserId: string,
  authenticatedUserId: string
): NextResponse | null {
  if (requestUserId !== authenticatedUserId) {
    logger.warn('Tentativa de acesso a recurso de outro usuário', {
      requestUserId,
      authenticatedUserId,
    });
    
    return NextResponse.json(
      { error: 'Acesso negado. Você não tem permissão para acessar este recurso.' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 */
export function checkResourceOwnership(resourceUserId: string, currentUserId: string) {
    if (resourceUserId !== currentUserId) {
        throw new Error('FORBIDDEN');
    }
    return true;
}

/**
 * Sanitiza entrada do usuário para prevenir injection
 */
export function sanitizeInput(input: string): string {
    const trimmed = input.trim();
    const withoutNulls = trimmed.replace(/\u0000/g, "");
    const collapsedWhitespace = withoutNulls.replace(/\s+/g, " ");
    return collapsedWhitespace
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Rate limiting simples (em produção, use Redis)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}
