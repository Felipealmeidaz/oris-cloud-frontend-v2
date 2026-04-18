/**
 * Zod Validation Schemas - Token Operations
 * 
 * Schemas de validação para operações relacionadas a tokens de compra.
 * Garante que dados de entrada estejam no formato correto antes de
 * processar requisições.
 */

import { z } from 'zod';

/**
 * Schema para resgate de token
 * Usado em: POST /api/token/redeem
 */
export const tokenRedeemSchema = z.object({
  token: z.string()
    .length(8, 'Token deve ter exatamente 8 caracteres')
    .regex(/^[A-Z0-9]{8}$/, 'Token deve conter apenas letras maiúsculas e números')
    .trim(),
  
  userId: z.string()
    .uuid('userId deve ser um UUID válido')
    .trim(),
  
  userEmail: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .trim(),
});

export type TokenRedeemInput = z.infer<typeof tokenRedeemSchema>;

/**
 * Schema para geração de token (admin)
 * Usado em: POST /api/token/generate
 */
export const tokenGenerateSchema = z.object({
  planId: z.string()
    .uuid('planId deve ser um UUID válido')
    .trim(),
  
  quantity: z.number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade mínima é 1')
    .max(100, 'Quantidade máxima é 100')
    .default(1),
  
  expiresInDays: z.number()
    .int('Dias de expiração deve ser um número inteiro')
    .min(1, 'Mínimo 1 dia')
    .max(365, 'Máximo 365 dias')
    .default(30),
});

export type TokenGenerateInput = z.infer<typeof tokenGenerateSchema>;

/**
 * Schema para validação de token simples
 */
export const tokenSchema = z.string()
  .length(8, 'Token inválido')
  .regex(/^[A-Z0-9]{8}$/, 'Formato de token inválido');
