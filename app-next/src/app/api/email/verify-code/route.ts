import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RateLimitConfig } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting para prevenir brute force
    const rateLimitResult = await withRateLimit(request, RateLimitConfig.LOGIN);
    if (rateLimitResult) return rateLimitResult;

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email e código são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar código no banco
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        code,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Código inválido" },
        { status: 400 }
      );
    }

    // Verificar se o código expirou
    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        { error: "Código expirado" },
        { status: 400 }
      );
    }

    // Deletar código usado (a conta será criada no frontend após esta validação)
    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    logger.error('Erro ao verificar código', { error });
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
