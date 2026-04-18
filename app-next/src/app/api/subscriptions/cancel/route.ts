import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { subscriptionCancelSchema } from '@/lib/validations/subscription';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
        if (rateLimitResult) return rateLimitResult;

        // ✅ Autenticação obrigatória
        const user = await requireAuth();
        if (user instanceof NextResponse) return user;

        // ✅ Validar entrada com Zod
        const body = await req.json();
        const validation = subscriptionCancelSchema.safeParse(body);

        if (!validation.success) {
            logger.warn('Dados inválidos para cancelamento de assinatura', {
                errors: validation.error.format(),
            });
            return NextResponse.json(
                { error: 'Dados inválidos', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { subscriptionId } = validation.data;

        // Buscar a assinatura
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId }
        });

        if (!subscription) {
            logger.warn('Assinatura não encontrada', { subscriptionId });
            return NextResponse.json(
                { error: 'Assinatura não encontrada' },
                { status: 404 }
            );
        }

        // ✅ Verificar ownership usando userId da SESSÃO (não do body)
        if (subscription.userId !== user.id) {
            logger.warn('Tentativa de cancelar assinatura de outro usuário', {
                subscriptionId,
                userId: user.id,
                ownerId: subscription.userId,
            });
            return NextResponse.json(
                { error: 'Você não tem permissão para cancelar esta assinatura' },
                { status: 403 }
            );
        }

        // Verificar se já está cancelada
        if (subscription.status === 'cancelled') {
            return NextResponse.json(
                { error: 'Assinatura já está cancelada' },
                { status: 400 }
            );
        }

        // Cancelar a assinatura E desativar discos associados em transaction com timeout de 10s
        const result = await prisma.$transaction(async (tx) => {
            // Cancelar subscription
            const updatedSubscription = await tx.subscription.update({
                where: { id: subscriptionId },
                data: { 
                    status: 'cancelled',
                    updatedAt: new Date()
                }
            });
            
            // Desativar todos os discos do usuário
            const disksDeactivated = await tx.disk.updateMany({
                where: {
                    userId: user.id,
                    isActive: true
                },
                data: {
                    isActive: false
                }
            });
            
            return { updatedSubscription, disksDeactivated };
        });

        logger.info('Assinatura cancelada e discos desativados', {
            subscriptionId,
            userId: user.id,
            disksDeactivated: result.disksDeactivated.count
        });

        return NextResponse.json({
            success: true,
            subscription: result.updatedSubscription,
            message: 'Assinatura cancelada com sucesso'
        });

    } catch (error) {
        logger.error('Erro ao cancelar assinatura', { error });
        return NextResponse.json(
            { error: 'Erro ao cancelar assinatura' },
            { status: 500 }
        );
    }
}
