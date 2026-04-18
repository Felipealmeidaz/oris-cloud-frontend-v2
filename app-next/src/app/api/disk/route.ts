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

        // Buscar discos do usuário
        const disks = await prisma.disk.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Atualizar status de discos expirados
        const now = new Date();
        const expiredDisks = disks.filter(
            (disk: any) => disk.isActive && new Date(disk.validUntil) < now
        );

        if (expiredDisks.length > 0) {
            await prisma.disk.updateMany({
                where: {
                    id: { in: expiredDisks.map((disk: any) => disk.id) }
                },
                data: { isActive: false }
            });
        }

        // Buscar discos atualizados
        const updatedDisks = await prisma.disk.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            disks: updatedDisks,
            active: updatedDisks.filter((disk: any) => disk.isActive).length,
            total: updatedDisks.length
        });

    } catch (error) {
        logger.error('Erro ao buscar discos', { error });
        return NextResponse.json(
            { error: 'Erro ao buscar discos' },
            { status: 500 }
        );
    }
}
