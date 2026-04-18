import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import awsService from '@/lib/cloud/awsServices';
import { diskNameSchema } from '@/lib/validations/vm';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const vmOperationSchema = z.object({
  diskName: diskNameSchema,
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
    if (rateLimitResult) return rateLimitResult;

    // Autenticação
    const user = await requireAuth();
    if (user instanceof NextResponse) return user;

    // Validação
    const body = await req.json();
    const validation = vmOperationSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Dados inválidos no stop VM', { errors: validation.error.format(), userId: user.id });
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { diskName } = validation.data;

    // Verificar se o disco pertence ao usuário
    const disk = await prisma.disk.findFirst({
      where: {
        name: diskName,
        userId: user.id
      }
    });

    if (!disk) {
      logger.warn('Disco não encontrado ou sem permissão', { diskName, userId: user.id });
      return NextResponse.json(
        { error: 'Disco não encontrado ou você não tem permissão para acessá-lo' },
        { status: 403 }
      );
    }

    // Verificar se o disco está ativo
    if (!disk.isActive) {
      logger.warn('Tentativa de parar VM com disco inativo', { diskName, userId: user.id });
      return NextResponse.json(
        { error: 'Disco inativo ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se o disco está expirado
    if (new Date(disk.validUntil) < new Date()) {
      logger.warn('Tentativa de parar VM com disco expirado', { diskName, userId: user.id, validUntil: disk.validUntil });
      await prisma.disk.update({
        where: { id: disk.id },
        data: { isActive: false }
      });
      return NextResponse.json(
        { error: 'Disco expirado. Renove sua assinatura para continuar.' },
        { status: 403 }
      );
    }

    logger.info('Iniciando processo de stop VM', { diskName, userId: user.id });

    // Verificar se o disco está anexado a uma VM
    const vmInfo = await awsService.getVMInfoByDiskName(diskName);

    if (!vmInfo) {
      logger.warn('Nenhuma VM encontrada para stop', { diskName, userId: user.id });
      return NextResponse.json(
        { error: 'Nenhuma VM encontrada para este disco' },
        { status: 404 }
      );
    }

    logger.info('Deletando VM e liberando recursos', { vmName: vmInfo.awsVmName, diskName });

    // Deletar a VM completamente (VM, NIC, IP público) mantendo apenas o disco
    await awsService.deleteVirtualMachine(vmInfo.awsVmName);

    logger.info('VM deletada com sucesso', { diskName, userId: user.id, vmName: vmInfo.awsVmName });

    return NextResponse.json({
      success: true,
      message: 'VM deletada e recursos liberados com sucesso. Disco preservado.',
      vm: {
        name: vmInfo.awsVmName,
        status: 'DELETED'
      }
    });

  } catch (error: any) {
    logger.error('Erro ao deletar VM', { error: error.message, stack: error.stack });
    
    return NextResponse.json(
      { error: 'Erro ao parar VM. Tente novamente.' },
      { status: 500 }
    );
  }
}
