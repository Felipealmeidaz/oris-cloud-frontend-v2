import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { requireAuth } from '@/lib/middleware/auth';
import { tokenRedeemSchema } from '@/lib/validations/token';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        // ✅ Rate limiting (10 tentativas/hora)
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.TOKEN_REDEEM);
        if (rateLimitResult) return rateLimitResult;

        // ✅ Autenticação obrigatória
        const user = await requireAuth();
        if (user instanceof NextResponse) return user;

        // ✅ Validar entrada com Zod
        const body = await req.json();
        const validation = tokenRedeemSchema.safeParse(body);

        if (!validation.success) {
            logger.warn('Dados inválidos para resgate de token', {
                errors: validation.error.format(),
            });
            return NextResponse.json(
                { error: 'Dados inválidos', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { token, userId, userEmail } = validation.data;

        // ✅ Verificar ownership (userId do body deve ser o mesmo da sessão)
        if (userId !== user.id) {
            logger.warn('Tentativa de resgatar token para outro usuário', {
                requestUserId: userId,
                authenticatedUserId: user.id,
            });
            return NextResponse.json(
                { error: 'Acesso negado' },
                { status: 403 }
            );
        }

        // Buscar o token no banco
        const purchaseToken = await prisma.purchaseToken.findUnique({
            where: { token: token.toUpperCase() }
        });

        if (!purchaseToken) {
            logger.warn('Token inválido tentado', { token });
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 404 }
            );
        }

        // Verificar se o token já foi resgatado
        if (purchaseToken.isRedeemed) {
            logger.warn('Tentativa de reutilizar token já resgatado', { token });
            return NextResponse.json(
                { 
                    error: 'Token já foi resgatado',
                    redeemedAt: purchaseToken.redeemedAt,
                    redeemedBy: purchaseToken.redeemedBy
                },
                { status: 400 }
            );
        }

        // Verificar se o token expirou
        if (new Date() > purchaseToken.expiresAt) {
            logger.warn('Tentativa de usar token expirado', { token });
            return NextResponse.json(
                { error: 'Token expirado' },
                { status: 400 }
            );
        }

        // Buscar informações do plano
        const plan = await prisma.vCpuPlan.findUnique({
            where: { id: purchaseToken.planId }
        });

        if (!plan) {
            logger.error('Plano não encontrado para token válido', { 
                token, 
                planId: purchaseToken.planId 
            });
            return NextResponse.json(
                { error: 'Plano não encontrado' },
                { status: 404 }
            );
        }

        // Calcular data de expiração da assinatura
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + purchaseToken.days);

        // Verificar se usuário já tem disco ativo
        const existingDisk = await prisma.disk.findFirst({
            where: {
                userId,
                isActive: true
            }
        });

        if (existingDisk) {
            logger.warn('Usuário tentou resgatar token mas já possui disco ativo', {
                userId,
                existingDiskName: existingDisk.name
            });
            return NextResponse.json(
                { error: 'Você já possui um disco ativo. Cancele-o antes de resgatar novo token.' },
                { status: 400 }
            );
        }

        // Criar assinatura, disco e marcar token como resgatado em uma transação atômica com timeout de 15s
        const result = await prisma.$transaction(async (tx: any) => {
            // Marcar o token como resgatado
            const updatedToken = await tx.purchaseToken.update({
                where: { token: token.toUpperCase() },
                data: {
                    isRedeemed: true,
                    redeemedAt: new Date(),
                    redeemedBy: userId
                }
            });

            // Criar a assinatura
            const subscription = await tx.subscription.create({
                data: {
                    userId,
                    userEmail,
                    planId: plan.id,
                    planName: plan.name,
                    days: purchaseToken.days,
                    status: 'active',
                    expiresAt,
                    tokenId: updatedToken.id
                }
            });

            // Criar o disco automaticamente
            const crypto = require('crypto');
            const uniqueId = crypto.randomBytes(8).toString('hex');
            const userIdPrefix = userId.substring(0, 8);
            const diskName = `disk-${userIdPrefix}-${uniqueId}`;

            const disk = await tx.disk.create({
                data: {
                    name: diskName,
                    userId,
                    validUntil: expiresAt,
                    isActive: true,
                    vCpus: purchaseToken.vCpus,
                    sizeGB: purchaseToken.diskSizeGB
                }
            });

            return { updatedToken, subscription, disk };
        });

        logger.info('Token resgatado com sucesso', {
            token,
            userId,
            planId: plan.id,
            subscriptionId: result.subscription.id,
            diskId: result.disk.id,
        });

        return NextResponse.json({
            success: true,
            token: result.updatedToken.token,
            subscription: {
                id: result.subscription.id,
                plan: result.subscription.planName,
                days: result.subscription.days,
                diskSizeGB: purchaseToken.diskSizeGB,
                expiresAt: result.subscription.expiresAt,
                status: result.subscription.status
            },
            disk: {
                id: result.disk.id,
                name: result.disk.name,
                vCpus: result.disk.vCpus,
                sizeGB: result.disk.sizeGB,
                validUntil: result.disk.validUntil
            },
            message: 'Token resgatado, assinatura e disco criados com sucesso'
        });

    } catch (error) {
        logger.error('Erro ao resgatar token', { error });
        return NextResponse.json(
            { error: 'Erro ao resgatar token' },
            { status: 500 }
        );
    }
}
