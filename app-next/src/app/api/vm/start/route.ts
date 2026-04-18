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
      logger.warn('Dados inválidos no start VM', { errors: validation.error.format(), userId: user.id });
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
      logger.warn('Tentativa de iniciar VM com disco inativo', { diskName, userId: user.id });
      return NextResponse.json(
        { error: 'Disco inativo ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se o disco está expirado
    if (new Date(disk.validUntil) < new Date()) {
      logger.warn('Tentativa de iniciar VM com disco expirado', { diskName, userId: user.id, validUntil: disk.validUntil });
      await prisma.disk.update({
        where: { id: disk.id },
        data: { isActive: false }
      });
      return NextResponse.json(
        { error: 'Disco expirado. Renove sua assinatura para continuar.' },
        { status: 403 }
      );
    }

    logger.info('Iniciando processo de start VM', { diskName, userId: user.id, vCpus: disk.vCpus });

    // Garantir que o volume EBS existe (recriar se necessário)
    logger.info('Garantindo que volume EBS existe', { diskName });
    await awsService.ensureDiskExists(diskName, disk.sizeGB);
    logger.info('Volume EBS confirmado', { diskName });

    // Verificar se o disco está anexado a uma VM
    logger.info('Verificando anexação do disco', { diskName });
    let vmInfo = await awsService.getVMInfoByDiskName(diskName);

    if (!vmInfo) {
      logger.info('Disco não anexado, criando nova VM', { diskName });
      
      // Se não há VM, criar uma nova VM com o disco
      try {
        logger.info('Criando VM', { diskName, vCpus: disk.vCpus });
        await awsService.createVirtualMachine(diskName, diskName, disk.vCpus);
        logger.info('VM criada, aguardando inicialização', { diskName });
        
        // Polling com retry para aguardar VM ficar pronta
        const maxAttempts = 10;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          vmInfo = await awsService.getVMInfoByDiskName(diskName);
          if (vmInfo) break;
          
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          logger.debug('Aguardando VM ficar pronta', { diskName, attempt: attempt + 1, delayMs: delay });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        if (!vmInfo) {
          logger.error('Timeout aguardando VM ficar pronta', { diskName });
          return NextResponse.json(
            { error: 'Erro ao iniciar VM. Tente novamente em alguns instantes.' },
            { status: 500 }
          );
        }
        
        logger.info('VM encontrada e pronta', { vmName: vmInfo.awsVmName });
      } catch (createError: any) {
        logger.error('Erro ao criar VM', { diskName, error: createError.message, stack: createError.stack });
        
        // Verificar se é erro de cota
        if (createError.isQuotaError) {
          logger.error('Erro de cota ao criar VM', { diskName, userId: user.id, error: createError.message });
          return NextResponse.json(
            { error: createError.message },
            { status: 503 }
          );
        }
        throw createError;
      }
    } else {
      logger.info('VM já existe e está anexada ao disco', { vmName: vmInfo.awsVmName });
    }

    // Iniciar a VM
    logger.info('Iniciando VM', { vmName: vmInfo.awsVmName });
    await awsService.startVirtualMachine(vmInfo.awsVmName);
    logger.info('VM iniciada com sucesso', { diskName, userId: user.id, vmName: vmInfo.awsVmName });

    return NextResponse.json({
      success: true,
      message: 'VM iniciada com sucesso',
      vm: {
        name: vmInfo.awsVmName,
        status: 'STARTING'
      }
    });

  } catch (error: any) {
    logger.error('Erro ao iniciar VM', { error: error.message, stack: error.stack });
    
    return NextResponse.json(
      { error: 'Erro ao iniciar VM. Tente novamente.' },
      { status: 500 }
    );
  }
}
