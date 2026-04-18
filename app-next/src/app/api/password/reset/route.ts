import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { withRateLimit, RateLimitConfig } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting para prevenir brute force
    const rateLimitResult = await withRateLimit(request, RateLimitConfig.PASSWORD_RESET);
    if (rateLimitResult) return rateLimitResult;

    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar código
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

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Buscar conta do usuário
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    // Usar o internal do BetterAuth para fazer hash da senha
    // Isso garante que usa exatamente o mesmo método do registro
    const { hashPassword } = await import("better-auth/crypto");
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });

    // Deletar código usado
    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro ao redefinir senha', { error });
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
