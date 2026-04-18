/**
 * Zod Validation Schemas - Subscription Operations
 * 
 * Schemas de validação para operações de assinatura.
 */

import { z } from 'zod';

/**
 * Schema para cancelar assinatura
 * Usado em: POST /api/subscriptions/cancel
 */
export const subscriptionCancelSchema = z.object({
  subscriptionId: z.string()
    .uuid('subscriptionId deve ser um UUID válido')
    .trim(),
});

export type SubscriptionCancelInput = z.infer<typeof subscriptionCancelSchema>;

/**
 * Schema para listar assinaturas
 * Usado em: GET /api/subscriptions (query params)
 */
export const subscriptionsListSchema = z.object({
  userId: z.string()
    .uuid('userId deve ser um UUID válido')
    .trim()
    .optional(),
  
  status: z.enum(['active', 'cancelled', 'expired'], {
    message: 'Status inválido',
  }).optional(),
  
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .optional(),
  
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .optional(),
});

export type SubscriptionsListInput = z.infer<typeof subscriptionsListSchema>;
