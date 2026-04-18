import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const vcpuPlans = await prisma.vCpuPlan.findMany({
            where: { active: true },
            orderBy: [
                { vCpus: 'asc' },
                { days: 'asc' }
            ]
        });

        // Agrupar por vCPUs
        const groupedPlans = vcpuPlans.reduce((acc, plan) => {
            if (!acc[plan.vCpus]) {
                acc[plan.vCpus] = {
                    vCpus: plan.vCpus,
                    ramGB: plan.ramGB,
                    plans: []
                };
            }
            acc[plan.vCpus].plans.push(plan);
            return acc;
        }, {} as Record<number, { vCpus: number; ramGB: number; plans: any[] }>);

        return NextResponse.json({ 
            vcpuPlans,
            groupedPlans: Object.values(groupedPlans)
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        logger.error('Erro ao buscar planos de vCPU', { error });
        return NextResponse.json(
            { error: 'Erro ao buscar planos de vCPU' },
            { status: 500 }
        );
    }
}
