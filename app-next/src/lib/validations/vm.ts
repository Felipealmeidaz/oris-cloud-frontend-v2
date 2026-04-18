/**
 * Zod Validation Schemas - Disk & VM Operations
 * 
 * Schemas de validação para operações de disco e máquina virtual.
 */

import { z } from 'zod';

/**
 * Schema para nome de disco (compatível com AWS EC2 tag values e naming comum)
 * - 1-80 caracteres
 * - Apenas alfanuméricos, hífens, underscores e pontos
 * - Deve começar e terminar com alfanumérico
 */
export const diskNameSchema = z.string()
  .min(1, 'Nome do disco é obrigatório')
  .max(80, 'Nome do disco muito longo (máximo 80 caracteres)')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9\-_.]*[a-zA-Z0-9]$/,
    'Nome do disco deve começar e terminar com letra/número e conter apenas letras, números, hífens, underscores e pontos'
  )
  .trim();

/**
 * Schema para criar disco
 * Usado em: POST /api/disk/create
 */
export const diskCreateSchema = z.object({
  diskName: diskNameSchema,
  
  userId: z.string()
    .uuid('userId deve ser um UUID válido')
    .trim(),
  
  vCpus: z.number()
    .int('vCPUs deve ser número inteiro')
    .refine(
      (val) => [4, 6, 8, 12, 16].includes(val),
      'vCPUs deve ser 4, 6, 8, 12 ou 16'
    ),
});

export type DiskCreateInput = z.infer<typeof diskCreateSchema>;

/**
 * Schema para deletar disco
 * Usado em: POST /api/disk/delete
 */
export const diskDeleteSchema = z.object({
  diskName: diskNameSchema,
  
  userId: z.string()
    .uuid('userId deve ser um UUID válido')
    .trim(),
});

export type DiskDeleteInput = z.infer<typeof diskDeleteSchema>;

/**
 * Schema para obter informações do disco
 * Usado em: POST /api/disk/get
 */
export const diskGetSchema = z.object({
  diskName: diskNameSchema,
  
  userId: z.string()
    .uuid('userId deve ser um UUID válido')
    .trim(),
});

export type DiskGetInput = z.infer<typeof diskGetSchema>;

/**
 * Schema para operações de VM (start, stop, restart)
 * Usado em: POST /api/vm/start, /api/vm/stop, /api/vm/restart
 */
export const vmOperationSchema = z.object({
  diskName: diskNameSchema,
  
  userId: z.string()
    .uuid('userId deve ser um UUID válido')
    .trim(),
});

export type VmOperationInput = z.infer<typeof vmOperationSchema>;

/**
 * Schema para obter status da VM
 * Usado em: POST /api/vm/status
 */
export const vmStatusSchema = z.object({
  diskName: diskNameSchema,
  
  userId: z.string()
    .uuid('userId deve ser um UUID válido')
    .trim(),
});

export type VmStatusInput = z.infer<typeof vmStatusSchema>;

/**
 * Schema para informações de VM
 * Usado em: POST /api/vm/info
 */
export const vmInfoSchema = z.object({
  diskName: diskNameSchema,
});

export type VmInfoInput = z.infer<typeof vmInfoSchema>;
