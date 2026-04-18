import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/middleware/auth";
import { sendVerificationEmailSchema } from "@/lib/validations/auth";
import { withRateLimit, RateLimitConfig } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { validateEmailDomain } from "@/lib/email-validation";

export async function POST(request: NextRequest) {
  try {
    // Usuário autenticado é opcional neste fluxo (registro)
    const authenticatedUser = await getAuthenticatedUser();

    // Rate limiting
    const rateLimitResponse = await withRateLimit(
      request,
      RateLimitConfig.EMAIL,
      authenticatedUser?.id
    );

    if (rateLimitResponse) {
      logger.warn('Rate limit excedido para envio de verificação', {
        userId: authenticatedUser?.id ?? 'anonymous',
        email: authenticatedUser?.email
      });
      return rateLimitResponse;
    }

    // Validação do body com Zod
    const body = await request.json();
    const validationResult = sendVerificationEmailSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Validação falhou no envio de verificação', {
        errors: validationResult.error.format(),
        userId: authenticatedUser?.id ?? 'anonymous'
      });
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Se usuário estiver autenticado, garantir que o email pertence a ele
    if (authenticatedUser && authenticatedUser.email.toLowerCase() !== email.toLowerCase()) {
      logger.warn('Tentativa de enviar verificação para email diferente do usuário autenticado', {
        sessionUserId: authenticatedUser.id,
        sessionEmail: authenticatedUser.email,
        requestedEmail: email
      });
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    // Validação de domínio MX
    const isValidDomain = await validateEmailDomain(email);
    if (!isValidDomain) {
      logger.warn('Domínio de email inválido (falha na validação MX)', {
        email,
        userId: authenticatedUser?.id ?? 'anonymous'
      });
      return NextResponse.json(
        { error: "Domínio de email inválido" },
        { status: 400 }
      );
    }

    logger.info('Iniciando envio de código de verificação', {
      email,
      userId: authenticatedUser?.id ?? 'anonymous'
    });

    // Gerar código de 6 dígitos com segurança criptográfica
    const crypto = require('crypto');
    const code = (100000 + crypto.randomInt(0, 900000)).toString();

    // Salvar código no banco com expiração de 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Deletar códigos antigos para este email
    await prisma.emailVerification.deleteMany({
      where: { email },
    });

    // Criar novo código
    await prisma.emailVerification.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Enviar email
    const { data, error } = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL as string,
      to: email,
      subject: "Código de Verificação - Oris Cloud",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verificação de Email</h2>
          <p>Seu código de verificação é:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expira em 10 minutos.</p>
          <p style="color: #666; font-size: 14px;">Se você não solicitou este código, ignore este email.</p>
        </div>
      `,
    });

    if (error) {
      logger.error('Erro ao enviar email de verificação', {
        error,
        email,
        userId: authenticatedUser?.id ?? 'anonymous'
      });
      return NextResponse.json(
        { error: "Erro ao enviar email de verificação" },
        { status: 500 }
      );
    }

    logger.info('Código de verificação enviado com sucesso', {
      email,
      userId: authenticatedUser?.id ?? 'anonymous'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro interno no envio de verificação', { error });
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
