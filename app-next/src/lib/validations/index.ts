/**
 * Zod Validation Schemas - Index
 * 
 * Exporta todos os schemas de validação em um único arquivo.
 */

// Token validations
export * from './token';

// Payment validations
export * from './payment';

// Disk & VM validations
export * from './vm';

// Auth validations
export * from './auth';

// Subscription validations
export * from './subscription';

/**
 * Utilitário para validação segura de dados
 * Retorna objeto com success e data/error
 */
export function safeValidate<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: any } },
  data: unknown
): { success: true; data: T } | { success: false; error: any } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data as T };
  }
  
  return { success: false, error: result.error };
}
