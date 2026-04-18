import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        // ✅ Rate limiting agressivo para prevenir enumeração/brute force de tokens (20 req/5min)
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.LOGIN);
        if (rateLimitResult) return rateLimitResult;

        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Token é obrigatório' },
                { status: 400 }
            );
        }

        // Buscar o token no banco
        const purchaseToken = await prisma.purchaseToken.findUnique({
            where: { token: token.toUpperCase() }
        });

        if (!purchaseToken) {
            return NextResponse.json(
                { error: 'Token não encontrado' },
                { status: 404 }
            );
        }

        // Buscar informações do plano
        const plan = await prisma.plan.findUnique({
            where: { id: purchaseToken.planId }
        });

        // Verificar status
        const isExpired = new Date() > purchaseToken.expiresAt;
        const isValid = !purchaseToken.isRedeemed && !isExpired;

        return NextResponse.json({
            token: purchaseToken.token,
            plan: plan?.name,
            days: purchaseToken.days,
            price: purchaseToken.price,
            isRedeemed: purchaseToken.isRedeemed,
            redeemedAt: purchaseToken.redeemedAt,
            createdAt: purchaseToken.createdAt,
            expiresAt: purchaseToken.expiresAt,
            isExpired,
            isValid,
            status: purchaseToken.isRedeemed ? 'resgatado' : isExpired ? 'expirado' : 'válido'
        });

    } catch (error) {
        logger.error('Erro ao verificar token', { error });
        return NextResponse.json(
            { error: 'Erro ao verificar token' },
            { status: 500 }
        );
    }
}
