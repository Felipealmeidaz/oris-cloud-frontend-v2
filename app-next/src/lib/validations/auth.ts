/**
 * Zod Validation Schemas - Authentication & User Operations
 * 
 * Schemas de validação para operações de autenticação, email e senha.
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
 * Schema para envio de código de verificação de email
 * Usado em: POST /api/email/send-verification
 */
export const sendVerificationEmailSchema = z.object({
  email: emailSchema,
});

export type SendVerificationEmailInput = z.infer<typeof sendVerificationEmailSchema>;

/**
 * Schema para verificar código de email
 * Usado em: POST /api/email/verify
 */
export const verifyEmailCodeSchema = z.object({
  userId: z.string()
    .uuid('userId deve ser um UUID válido')
    .trim(),
  
  code: z.string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve conter apenas números'),
});

export type VerifyEmailCodeInput = z.infer<typeof verifyEmailCodeSchema>;

/**
 * Schema para envio de código de reset de senha
 * Usado em: POST /api/password/send-reset-code
 */
export const sendResetCodeSchema = z.object({
  email: emailSchema,
});

export type SendResetCodeInput = z.infer<typeof sendResetCodeSchema>;

/**
 * Schema para verificar código de reset
 * Usado em: POST /api/password/verify-code
 */
export const verifyResetCodeSchema = z.object({
  email: emailSchema,
  
  code: z.string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve conter apenas números'),
});

export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;

/**
 * Schema para resetar senha
 * Usado em: POST /api/password/reset
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
  
  code: z.string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve conter apenas números'),
  
  newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

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
