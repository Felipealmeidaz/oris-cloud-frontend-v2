/**
 * Zod Validation Schemas - Authentication & User Operations
 *
 * Schemas de validação para operações de autenticação.
 *
 * Nota: schemas de OTP (sendVerificationEmailSchema, verifyEmailCodeSchema,
 * sendResetCodeSchema, verifyResetCodeSchema, resetPasswordSchema) foram
 * removidos junto com os 6 endpoints custom de email/senha. O fluxo agora
 * é 100 por cento better-auth com link mágico — tokens são validados
 * internamente pelo better-auth no endpoint /api/auth/*.
 */

import { z } from 'zod';

/**
 * Schema para email
 */
export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .toLowerCase()
  .trim();

/**
 * Schema para senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Máximo 100 caracteres
 */
export const passwordSchema = z.string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .max(100, 'Senha muito longa');

/**
 * Schema para registro de usuário
 */
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),

  email: emailSchema,

  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
