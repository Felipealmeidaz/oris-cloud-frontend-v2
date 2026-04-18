import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { withRateLimit, RateLimitConfig } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const rate = await withRateLimit(request, RateLimitConfig.PASSWORD_RESET);
    if (rate) return rate;
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

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    logger.error("Erro ao verificar código de reset", { error });
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
