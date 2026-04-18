import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const diskAddons = await prisma.diskAddon.findMany({
            where: { active: true },
            orderBy: { sizeGB: 'asc' }
        });

        return NextResponse.json({ diskAddons }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        logger.error('Erro ao buscar adicionais de disco', { error });
        return NextResponse.json(
            { error: 'Erro ao buscar adicionais de disco' },
            { status: 500 }
        );
    }
}
