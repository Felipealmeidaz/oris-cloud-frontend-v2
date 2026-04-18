/**
 * Email Validation Utilities
 * 
 * Funções para validação avançada de emails incluindo verificação DNS MX.
 */

import dns from 'dns/promises';
import { logger } from '@/lib/logger';

/**
 * Valida se o domínio do email possui registros MX válidos
 * Isso ajuda a prevenir emails falsos/temporários
 * 
 * @param email - Email a ser validado
 * @returns true se domínio tem registros MX, false caso contrário
 */
export async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1];
    
    if (!domain) {
      logger.warn('Email sem domínio válido', { email });
      return false;
    }

    // Tentar resolver registros MX do domínio
    const records = await dns.resolveMx(domain);
    
    if (!records || records.length === 0) {
      logger.warn('Domínio sem registros MX', { domain });
      return false;
    }

    logger.debug('Domínio validado com sucesso', { 
      domain, 
      mxRecords: records.length 
    });
    
    return true;
  } catch (error: any) {
    // Códigos de erro DNS
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      logger.warn('Domínio não encontrado ou sem registros MX', { 
        email, 
        errorCode: error.code 
      });
      return false;
    }

    // Outros erros (timeout, etc) - logar mas não bloquear
    logger.error('Erro ao validar domínio de email', { 
      email, 
      error: error.message 
    });
    
    // Em caso de erro de DNS, permitir para não bloquear usuários legítimos
    return true;
  }
}

/**
 * Lista de domínios de email temporário conhecidos
 * Bloqueie emails descartáveis/temporários
 */
const TEMPORARY_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'mailinator.com',
  'maildrop.cc',
  'getnada.com',
  'trashmail.com',
  'fakeinbox.com',
]);

/**
 * Verifica se o email usa domínio temporário/descartável
 * 
 * @param email - Email a ser verificado
 * @returns true se for email temporário, false caso contrário
 */
export function isTemporaryEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return false;
  }

  return TEMPORARY_EMAIL_DOMAINS.has(domain);
}

/**
 * Validação completa de email
 * Combina validação de formato, MX e domínio temporário
 * 
 * @param email - Email a ser validado
 * @param options - Opções de validação
 * @returns { valid: boolean, reason?: string }
 */
export async function validateEmailComplete(
  email: string,
  options: {
    checkMX?: boolean;
    blockTemporary?: boolean;
  } = {}
): Promise<{ valid: boolean; reason?: string }> {
  const { checkMX = true, blockTemporary = true } = options;

  // Verificar formato básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Formato de email inválido' };
  }

  // Verificar domínio temporário
  if (blockTemporary && isTemporaryEmail(email)) {
    logger.warn('Email temporário bloqueado', { email });
    return { valid: false, reason: 'Emails temporários não são permitidos' };
  }

  // Verificar registros MX
  if (checkMX) {
    const hasMX = await validateEmailDomain(email);
    if (!hasMX) {
      return { valid: false, reason: 'Domínio de email inválido' };
    }
  }

  return { valid: true };
}
