/**
 * Zod Validation Schemas - Payment Operations
 * 
 * Schemas de validação para operações de pagamento via PIX.
 */

import { z } from 'zod';

/**
 * Schema para criação de pagamento
 * Usado em: POST /api/payment/create
 */
export const paymentCreateSchema = z.object({
  customId: z.string()
    .regex(/^[A-Z0-9]{24}$/i, 'customId deve ser um ID válido')
    .trim(),

  // Novo sistema: pode vir vCpuPlanId OU planName (fallback)
  planName: z.enum(['Diário', 'Semanal', 'Quinzenal', 'Mensal', 'Trimestral']).optional(),
  vCpuPlanId: z.string().uuid('vCpuPlanId deve ser um UUID válido').optional(),
  diskAddonId: z.string().uuid('diskAddonId deve ser um UUID válido').optional(),
  discordId: z.string().optional(),

  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .trim(),
  
  // Campos opcionais do comprador (legado)
  cpf: z.string()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')
    .optional(),
  
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome muito longo')
    .optional(),
}).refine((data) => !!data.vCpuPlanId || !!data.planName, {
  message: 'Nenhum plano selecionado',
  path: ['planName'],
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;

/**
 * Schema para webhook do EfiBank
 * Usado em: POST /api/webhook/efibank
 */
export const webhookEfiBankSchema = z.object({
  evento: z.enum(['PIX_RECEBIDO', 'PIX_CANCELADO', 'PIX_DEVOLVIDO'], {
    message: 'Evento de webhook inválido',
  }),
  
  pix: z.array(
    z.object({
      endToEndId: z.string(),
      txid: z.string().min(1),
      valor: z.string(),
      horario: z.string(),
      infoPagador: z.string().optional(),
    })
  ).min(1, 'Array de PIX vazio'),
});

export type WebhookEfiBankInput = z.infer<typeof webhookEfiBankSchema>;

/**
 * Schema para invoice/fatura
 * Usado em: GET /api/invoices/[customId]
 */
export const invoiceParamsSchema = z.object({
  customId: z.string()
    .uuid('customId deve ser um UUID válido')
    .trim(),
});

export type InvoiceParamsInput = z.infer<typeof invoiceParamsSchema>;
