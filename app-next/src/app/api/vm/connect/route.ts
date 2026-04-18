import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import awsService from '@/lib/cloud/awsServices';
import { z } from 'zod';

const connectSchema = z.object({
  diskName: z.string().min(1, 'Nome do disco é obrigatório'),
  pin: z.string().min(4).max(6).regex(/^\d{4,6}$/, 'PIN deve ter 4-6 dígitos'),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting alto para Moonlight (bugs frequentes) - 100/minuto
    const rateLimitResult = await withRateLimit(
      req, 
      { limit: 100, windowMs: 60000 } // 100 req/min
    );
    if (rateLimitResult) return rateLimitResult;

    // Autenticação
    const user = await requireAuth();
    if (user instanceof NextResponse) return user;

    const userId = user.id;
    const userName = user.name || 'user';
    
    // Validação
    const body = await req.json();
    const validation = connectSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Dados inválidos no connect', { errors: validation.error.format(), userId });
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    const { diskName, pin } = validation.data;

    // Verificar se o disco pertence ao usuário
    const disk = await prisma.disk.findFirst({
      where: {
        name: diskName,
        userId: userId
      }
    });

    if (!disk) {
      logger.warn('Tentativa de conectar a disco inexistente', { diskName, userId });
      return NextResponse.json(
        { error: 'Disco não encontrado ou você não tem permissão para acessá-lo' },
        { status: 403 }
      );
    }

    // Verificar se o disco está expirado
    if (new Date(disk.validUntil) < new Date()) {
      logger.warn('Tentativa de conectar com disco expirado', { diskName, userId, validUntil: disk.validUntil });
      await prisma.disk.update({
        where: { id: disk.id },
        data: { isActive: false }
      });
      return NextResponse.json(
        { error: 'Disco expirado. Renove sua assinatura para continuar.' },
        { status: 403 }
      );
    }

    // Buscar informações da VM
    const vmInfo = await awsService.getVMInfoByDiskName(diskName);

    if (!vmInfo || !vmInfo.publicIp) {
      return NextResponse.json(
        { error: 'VM não encontrada ou sem IP público' },
        { status: 404 }
      );
    }

    // Verificar se a VM está rodando
    const currentStatus = await awsService.getVMStatus(vmInfo.awsVmName);
    const mappedStatus = awsService.mapAwsStatusToVMStatus(currentStatus);

    if (mappedStatus !== 'RUNNING') {
      return NextResponse.json(
        { error: 'A VM precisa estar em execução para conectar' },
        { status: 400 }
      );
    }

    // Preparar payload da requisição
    const payload = {
      pin: pin.trim(),
      name: `oris-${userName}`
    };

    // Validar credenciais do Sunshine antes de tentar conectar.
    // Sunshine é o servidor de streaming rodando na VM EC2 (Windows) e exige
    // basic auth por padrão do protocolo dele — não é auth do usuário Oris.
    // Nunca aceitar credencial default em produção.
    const sunshineUser = process.env.SUNSHINE_USER;
    const sunshinePass = process.env.SUNSHINE_PASS;
    if (!sunshineUser || !sunshinePass) {
      logger.error('Credenciais Sunshine ausentes', {
        hasUser: !!sunshineUser,
        hasPass: !!sunshinePass,
      });
      return NextResponse.json(
        { error: 'Serviço de streaming não configurado. Contate o suporte.' },
        { status: 503 }
      );
    }

    // Fazer requisição para o Sunshine usando https nativo
    logger.info('Conectando ao Sunshine', { publicIp: vmInfo.publicIp });

    try {
      // Usar https nativo do Node.js para ter controle total sobre SSL
      const https = require('https');

      const postData = JSON.stringify(payload);

      const options = {
        hostname: vmInfo.publicIp,
        port: 47990,
        path: '/api/pin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': 'Basic ' + Buffer.from(`${sunshineUser}:${sunshinePass}`).toString('base64')
        },
        rejectUnauthorized: false // Ignorar certificados auto-assinados do Sunshine
      };

      const responseData = await new Promise<any>((resolve, reject) => {
        const req = https.request(options, (res: any) => {
          let data = '';

          res.on('data', (chunk: any) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const jsonData = data ? JSON.parse(data) : {};
                resolve({ statusCode: res.statusCode, data: jsonData });
              } catch (e) {
                resolve({ statusCode: res.statusCode, data: data });
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on('error', (error: any) => {
          reject(error);
        });

        req.write(postData);
        req.end();
      });

      logger.info('Conexão Sunshine estabelecida', { diskName });

      return NextResponse.json({
        success: true,
        message: 'PIN pareado com o Sunshine. Abra o Moonlight e conecte.',
        data: responseData.data
      });

    } catch (fetchError: any) {
      logger.error('Erro ao parear com Sunshine', { error: fetchError.message });

      return NextResponse.json(
        { error: `Erro ao parear com Sunshine: ${fetchError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    logger.error('Erro ao parear com Sunshine', { error: error.message });

    return NextResponse.json(
      { error: error.message || 'Erro ao parear com Sunshine' },
      { status: 500 }
    );
  }
}
