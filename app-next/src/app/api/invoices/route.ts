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

        const userEmail = user.email;

        // Buscar apenas os pagamentos do usuário autenticado
        const payments = await prisma.payment.findMany({
            where: { email: userEmail },
            orderBy: { createdAt: 'desc' }
        });

        // Formatar os dados para o frontend
        const invoices = payments.map((payment: any) => ({
            id: payment.id,
            customId: payment.customId,
            txid: payment.txid,
            plan: payment.plan,
            amount: payment.amount,
            status: payment.status,
            createdAt: payment.createdAt.toISOString(),
            updatedAt: payment.updatedAt.toISOString()
        }));

        return NextResponse.json({
            invoices,
            total: invoices.length
        });

    } catch (error) {
        logger.error('Erro ao buscar faturas', { error });
        return NextResponse.json(
            { error: 'Erro ao buscar faturas' },
            { status: 500 }
        );
    }
}
