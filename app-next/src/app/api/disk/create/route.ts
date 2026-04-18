import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { diskNameSchema } from '@/lib/validations/vm';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
        if (rateLimitResult) return rateLimitResult;

        // Autenticação
        const user = await requireAuth();
        if (user instanceof NextResponse) return user;

        const userId = user.id;
        const userEmail = user.email;

        // Verificar se o usuário tem assinatura ativa
        const activeSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'active',
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                expiresAt: 'desc'
            }
        });

        if (!activeSubscription) {
            return NextResponse.json(
                { error: 'Você precisa de uma assinatura ativa para criar um disco' },
                { status: 403 }
            );
        }

        // Buscar o token associado à assinatura para obter diskSizeGB, vCpus e ramGB
        const purchaseToken = await prisma.purchaseToken.findUnique({
            where: { id: activeSubscription.tokenId }
        });

        const diskSizeGB = purchaseToken?.diskSizeGB || 256;
        const vCpus = purchaseToken?.vCpus || 4;
        const ramGB = purchaseToken?.ramGB || 28;

        // Usar transaction para prevenir race condition com timeout de 10s
        const disk = await prisma.$transaction(async (tx) => {
            // Verificar se já tem um disco ativo (lock de leitura)
            const existingDisk = await tx.disk.findFirst({
                where: {
                    userId,
                    isActive: true
                }
            });

            if (existingDisk) {
                throw new Error('DISK_EXISTS');
            }

            // Criar nome de disco seguro usando crypto e validar
            const uniqueId = crypto.randomBytes(8).toString('hex');
            const userIdPrefix = userId.substring(0, 8);
            const diskName = `disk-${userIdPrefix}-${uniqueId}`;
            
            // Validar nome do disco com schema
            const validation = diskNameSchema.safeParse(diskName);
            if (!validation.success) {
                logger.error('Nome de disco gerado inválido', { diskName, errors: validation.error.format() });
                throw new Error('INVALID_DISK_NAME');
            }
            
            return await tx.disk.create({
                data: {
                    name: diskName,
                    userId,
                    validUntil: activeSubscription.expiresAt,
                    isActive: true,
                    vCpus,
                    sizeGB: diskSizeGB
                }
            });
        });

        return NextResponse.json({
            success: true,
            disk: {
                id: disk.id,
                name: disk.name,
                vCpus: disk.vCpus,
                sizeGB: disk.sizeGB,
                validUntil: disk.validUntil,
                createdAt: disk.createdAt
            },
            message: 'Disco criado com sucesso'
        });

    } catch (error: any) {
        if (error.message === 'DISK_EXISTS') {
            return NextResponse.json(
                { error: 'Você já possui um disco ativo' },
                { status: 400 }
            );
        }
        if (error.message === 'INVALID_DISK_NAME') {
            return NextResponse.json(
                { error: 'Erro ao gerar nome de disco' },
                { status: 500 }
            );
        }
        logger.error('Erro ao criar disco', { error });
        return NextResponse.json(
            { error: 'Erro ao criar disco' },
            { status: 500 }
        );
    }
}
