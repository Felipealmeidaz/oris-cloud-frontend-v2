import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
        if (rateLimitResult) return rateLimitResult;

        // Autenticação
        const user = await requireAuth();
        if (user instanceof NextResponse) return user;

        const userId = user.id;
        const userEmail = user.email;

        // Buscar assinaturas do usuário autenticado
        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Atualizar status de assinaturas expiradas
        const now = new Date();
        const expiredSubscriptions = subscriptions.filter(
            (sub: any) => sub.status === 'active' && new Date(sub.expiresAt) < now
        );

        if (expiredSubscriptions.length > 0) {
            await prisma.subscription.updateMany({
                where: {
                    id: { in: expiredSubscriptions.map((sub: any) => sub.id) }
                },
                data: { status: 'expired' }
            });
        }

        // Buscar assinaturas atualizadas
        const updatedSubscriptions = await prisma.subscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            subscriptions: updatedSubscriptions,
            active: updatedSubscriptions.filter((sub: any) => sub.status === 'active').length,
            total: updatedSubscriptions.length
        });

    } catch (error) {
        logger.error('Erro ao buscar assinaturas', { error });
        return NextResponse.json(
            { error: 'Erro ao buscar assinaturas' },
            { status: 500 }
        );
    }
}
