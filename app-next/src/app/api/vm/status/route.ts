import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import awsService from '@/lib/cloud/awsServices';
import { diskNameSchema } from '@/lib/validations/vm';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const vmStatusSchema = z.object({
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
    const validation = vmStatusSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Dados inválidos no status VM', { errors: validation.error.format(), userId: user.id });
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

    // Verificar se o disco está expirado
    if (new Date(disk.validUntil) < new Date()) {
      logger.warn('Consultando status de disco expirado', { diskName, userId: user.id, validUntil: disk.validUntil });
      await prisma.disk.update({
        where: { id: disk.id },
        data: { isActive: false }
      });
      return NextResponse.json(
        { error: 'Disco expirado. Renove sua assinatura para continuar.', expired: true },
        { status: 403 }
      );
    }

    logger.info('Consultando status VM', { diskName, userId: user.id });

    // Buscar informações da VM anexada ao disco
    const vmInfo = await awsService.getVMInfoByDiskName(diskName);

    if (!vmInfo) {
      logger.info('Nenhuma VM encontrada para status', { diskName, userId: user.id });
      return NextResponse.json({
        success: true,
        hasVM: false,
        message: 'Nenhuma VM encontrada para este disco'
      });
    }

    // Buscar status atualizado da VM
    const currentStatus = await awsService.getVMStatus(vmInfo.awsVmName);
    const mappedStatus = awsService.mapAwsStatusToVMStatus(currentStatus);

    logger.info('Status VM consultado com sucesso', { diskName, userId: user.id, vmName: vmInfo.awsVmName, status: mappedStatus });

    return NextResponse.json({
      success: true,
      hasVM: true,
      vm: {
        name: vmInfo.awsVmName,
        status: mappedStatus,
        publicIp: vmInfo.publicIp,
        privateIp: vmInfo.privateIp,
        location: vmInfo.location,
        vmSize: vmInfo.vmSize
      }
    });

  } catch (error: any) {
    logger.error('Erro ao buscar status da VM', { error: error.message, stack: error.stack });
    
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar status da VM' },
      { status: 500 }
    );
  }
}
