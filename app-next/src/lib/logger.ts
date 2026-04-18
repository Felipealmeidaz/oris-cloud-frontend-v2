/**
 * Secure Logging System
 * 
 * Sistema de logging com redação automática de dados sensíveis.
 * Remove informações como senhas, tokens, keys e secrets antes de logar.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMetadata {
  [key: string]: any;
}

/**
 * Lista de palavras-chave que identificam dados sensíveis
 */
const SENSITIVE_KEYWORDS = [
  'password',
  'senha',
  'token',
  'secret',
  'key',
  'authorization',
  'auth',
  'bearer',
  'cookie',
  'session',
  'api_key',
  'apikey',
  'private',
  'credential',
  'cert',
  'certificate',
];

/**
 * Verifica se está em ambiente de desenvolvimento
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Redact - Remove ou mascara dados sensíveis de um objeto
 * Em desenvolvimento, NÃO redacta para facilitar debug
 */
function redact(obj: any, depth = 0): any {
  // Em desenvolvimento, retornar o objeto original sem redação
  if (isDevelopment) {
    return obj;
  }

  // Prevenir recursão infinita
  if (depth > 10) {
    return '[MAX_DEPTH_EXCEEDED]';
  }

  // Null ou undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // String
  if (typeof obj === 'string') {
    // Se string muito longa, truncar
    if (obj.length > 1000) {
      return obj.substring(0, 1000) + '... [TRUNCATED]';
    }
    return obj;
  }

  // Número, Boolean, etc
  if (typeof obj !== 'object') {
    return obj;
  }

  // Array
  if (Array.isArray(obj)) {
    return obj.map(item => redact(item, depth + 1));
  }

  // Objeto
  const redacted: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerKey = key.toLowerCase();
      
      // Verificar se a chave contém palavra sensível
      const isSensitive = SENSITIVE_KEYWORDS.some(keyword => 
        lowerKey.includes(keyword)
      );
      
      if (isSensitive) {
        // Marcar como redacted
        redacted[key] = '[REDACTED]';
      } else {
        // Recursivamente redactar valor
        redacted[key] = redact(obj[key], depth + 1);
      }
    }
  }
  
  return redacted;
}

/**
 * Formata timestamp para logging
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Formata mensagem de log
 */
function formatLogMessage(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata
): string {
  const timestamp = formatTimestamp();
  const metaStr = metadata ? ` ${JSON.stringify(redact(metadata))}` : '';
  
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

/**
 * Logger principal
 */
class SecureLogger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Log de erro
   */
  error(message: string, metadata?: LogMetadata) {
    const formatted = formatLogMessage('error', message, metadata);
    console.error(formatted);
  }

  /**
   * Log de warning
   */
  warn(message: string, metadata?: LogMetadata) {
    const formatted = formatLogMessage('warn', message, metadata);
    console.warn(formatted);
  }

  /**
   * Log de info
   */
  info(message: string, metadata?: LogMetadata) {
    const formatted = formatLogMessage('info', message, metadata);
    console.info(formatted);
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      const formatted = formatLogMessage('debug', message, metadata);
      console.debug(formatted);
    }
  }

  /**
   * Log de requisição HTTP
   */
  request(req: Request, metadata?: LogMetadata) {
    const requestData = {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      ...metadata,
    };

    this.info('HTTP Request', requestData);
  }

  /**
   * Log de resposta HTTP
   */
  response(status: number, metadata?: LogMetadata) {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    
    this[level]('HTTP Response', {
      status,
      ...metadata,
    });
  }

  /**
   * Log de operação de banco de dados
   */
  database(operation: string, metadata?: LogMetadata) {
    this.debug(`Database ${operation}`, metadata);
  }

  /**
   * Log de autenticação
   */
  auth(event: string, metadata?: LogMetadata) {
    this.info(`Auth: ${event}`, metadata);
  }

  /**
   * Log de pagamento
   */
  payment(event: string, metadata?: LogMetadata) {
    this.info(`Payment: ${event}`, metadata);
  }

  /**
   * Log de VM/AWS
   */
  vm(event: string, metadata?: LogMetadata) {
    this.info(`VM: ${event}`, metadata);
  }
}

// Singleton instance
export const logger = new SecureLogger();

// Exportar função redact para uso externo
export { redact };

export default logger;
