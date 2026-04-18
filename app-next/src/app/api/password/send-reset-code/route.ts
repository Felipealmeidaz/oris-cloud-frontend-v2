import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { sendResetCodeSchema } from "@/lib/validations/auth";
import { withRateLimit, RateLimitConfig } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { validateEmailDomain, isTemporaryEmail } from "@/lib/email-validation";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (endpoint público - sem userId)
    const rateLimitResponse = await withRateLimit(
      request,
      RateLimitConfig.PASSWORD_RESET
    );

    if (rateLimitResponse) {
      logger.warn('Rate limit excedido para reset de senha', {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });
      return rateLimitResponse;
    }

    // Validação do body com Zod
    const body = await request.json();
    const validationResult = sendResetCodeSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Validação falhou no envio de código de reset', {
        errors: validationResult.error.format()
      });
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Bloquear emails temporários
    if (isTemporaryEmail(email)) {
      logger.warn('Tentativa de reset com email temporário', { email });
      return NextResponse.json(
        { error: "Emails temporários não são permitidos" },
        { status: 400 }
      );
    }

    // Validação de domínio MX
    const isValidDomain = await validateEmailDomain(email);
    if (!isValidDomain) {
      logger.warn('Domínio de email inválido (falha na validação MX) no reset de senha', {
        email
      });
      return NextResponse.json(
        { error: "Domínio de email inválido" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn('Tentativa de reset para email não cadastrado', { email });
      return NextResponse.json(
        { error: "Email não encontrado" },
        { status: 404 }
      );
    }

    logger.info('Iniciando envio de código de reset de senha', {
      email,
      userId: user.id
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
    const { error } = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL as string,
      to: email,
      subject: "Redefinição de Senha - Oris Cloud",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Redefinição de Senha</h2>
          <p>Você solicitou a redefinição de senha da sua conta.</p>
          <p>Seu código de verificação é:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expira em 10 minutos.</p>
          <p style="color: #666; font-size: 14px;">Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada.</p>
        </div>
      `,
    });

    if (error) {
      logger.error('Erro ao enviar email de reset de senha', {
        error,
        email,
        userId: user.id
      });
      return NextResponse.json(
        { error: "Erro ao enviar email de redefinição" },
        { status: 500 }
      );
    }

    logger.info('Código de reset de senha enviado com sucesso', {
      email,
      userId: user.id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro interno no envio de código de reset', { error });
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
