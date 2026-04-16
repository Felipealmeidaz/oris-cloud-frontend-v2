/**
 * Validação de Input - Proteção contra XSS, Injection e Input Validation
 * Segue as melhores práticas OWASP
 */

// Whitelist de caracteres permitidos
const SAFE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const SAFE_URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const SAFE_ALPHANUMERIC_REGEX = /^[a-zA-Z0-9\s\-_.]*$/;

/**
 * Sanitiza strings removendo caracteres perigosos
 */
export function sanitizeInput(input: string, maxLength: number = 255): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove caracteres de controle e XSS
  let sanitized = input
    .replace(/[<>\"'`]/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick=, etc)
    .trim();

  // Limita o comprimento
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const sanitized = sanitizeInput(email, 255);
  return SAFE_EMAIL_REGEX.test(sanitized);
}

/**
 * Valida URL
 */
export function validateURL(url: string): boolean {
  const sanitized = sanitizeInput(url, 2048);
  return SAFE_URL_REGEX.test(sanitized);
}

/**
 * Valida nome (apenas letras, números, hífens e underscores)
 */
export function validateName(name: string): boolean {
  const sanitized = sanitizeInput(name, 100);
  return sanitized.length >= 2 && SAFE_ALPHANUMERIC_REGEX.test(sanitized);
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: string): boolean {
  const sanitized = sanitizeInput(phone, 20);
  const phoneRegex = /^(\+55)?[\s]?(\d{2})[\s]?9?[\s]?(\d{4})[\s]?-?[\s]?(\d{4})$/;
  return phoneRegex.test(sanitized);
}

/**
 * Valida mensagem (permite mais caracteres que nome)
 */
export function validateMessage(message: string, minLength: number = 10, maxLength: number = 5000): boolean {
  const sanitized = sanitizeInput(message, maxLength);
  return sanitized.length >= minLength && sanitized.length <= maxLength;
}

/**
 * Detecta padrões suspeitos de bot/ataque
 */
export function detectSuspiciousPattern(input: string): boolean {
  const suspiciousPatterns = [
    /union\s+select/gi, // SQL Injection
    /drop\s+table/gi, // SQL Injection
    /script/gi, // XSS
    /iframe/gi, // XSS
    /onclick/gi, // XSS
    /onerror/gi, // XSS
    /eval\(/gi, // Code injection
    /base64/gi, // Encoding attempt
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limiting simples no cliente (honeypot)
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove tentativas antigas
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return true;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return false;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Validador de formulário completo
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateContactForm(data: {
  name?: string;
  email?: string;
  message?: string;
  honeypot?: string;
}): FormValidationResult {
  const errors: Record<string, string> = {};

  // Honeypot check
  if (data.honeypot && data.honeypot.length > 0) {
    return {
      isValid: false,
      errors: { honeypot: 'Formulário inválido' },
    };
  }

  // Validar nome
  if (!data.name || !validateName(data.name)) {
    errors.name = 'Nome inválido (mínimo 2 caracteres)';
  }

  // Validar email
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  // Validar mensagem
  if (!data.message || !validateMessage(data.message)) {
    errors.message = 'Mensagem deve ter entre 10 e 5000 caracteres';
  }

  // Detectar padrões suspeitos
  if (data.name && detectSuspiciousPattern(data.name)) {
    errors.name = 'Conteúdo suspeito detectado';
  }
  if (data.message && detectSuspiciousPattern(data.message)) {
    errors.message = 'Conteúdo suspeito detectado';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
