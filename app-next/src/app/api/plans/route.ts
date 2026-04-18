import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    // Tentar buscar do banco
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    });

    const stock = await prisma.stock.findFirst();

    // Se não houver planos no banco, retornar planos padrão
    const defaultPlans = [
      { name: 'Semanal', price: 29.90, duration: '7 dias' },
      { name: 'Quinzenal', price: 49.90, duration: '15 dias' },
      { name: 'Mensal', price: 69.90, duration: '30 dias' },
    ];

    return NextResponse.json({
      plans: plans.length > 0 ? plans : defaultPlans,
      stock: stock || { total: 100, available: 100, reserved: 0 }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar planos', { error });
    
    // Fallback se as tabelas não existirem
    const defaultPlans = [
      { name: 'Semanal', price: 29.90, duration: '7 dias' },
      { name: 'Quinzenal', price: 49.90, duration: '15 dias' },
      { name: 'Mensal', price: 69.90, duration: '30 dias' },
    ];

    return NextResponse.json({
      plans: defaultPlans,
      stock: { total: 100, available: 100, reserved: 0 }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  }
}
