/**
 * Envia email de verificação de endereço via Resend usando template Oris Cloud.
 *
 * Chamado pelo callback `emailVerification.sendVerificationEmail` do better-auth
 * (ver src/lib/auth.ts). Better-auth gera a `url` contendo o token e a rota
 * interna de verificação (/api/auth/verify-email?token=...&callbackURL=...).
 */

import { getResend } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { renderEmailLayout } from "./_layout";

interface SendVerificationEmailArgs {
  to: string;
  url: string;
  name?: string | null;
}

export async function sendVerificationEmail({
  to,
  url,
  name,
}: SendVerificationEmailArgs): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    logger.error("RESEND_FROM_EMAIL não configurado; email de verificação não enviado", { to });
    throw new Error("RESEND_FROM_EMAIL ausente");
  }

  const greeting = name ? `Olá ${escapeHtml(name)},` : "Olá,";

  const bodyHtml = `
    <h1 style="margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;">
      Confirme seu email
    </h1>
    <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#E5E7EB;">
      ${greeting}
    </p>
    <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#E5E7EB;">
      Bem-vindo à <strong style="color:#FFFFFF;">Oris Cloud</strong>. Pra concluir o cadastro e liberar seu acesso ao cloud gaming em AWS EC2, confirme seu endereço de email clicando no botão abaixo.
    </p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#9CA3AF;">
      Este link é válido por 1 hora. Depois disso, você precisa solicitar um novo.
    </p>
  `;

  const html = renderEmailLayout({
    title: "Confirme seu email · Oris Cloud",
    previewText: "Confirme seu email para ativar sua conta na Oris Cloud.",
    bodyHtml,
    ctaLabel: "Confirmar email",
    ctaUrl: url,
    footerNote:
      "Se você não criou uma conta na Oris Cloud, ignore este email. Nenhuma ação será tomada.",
  });

  try {
    const { error } = await getResend().emails.send({
      from,
      to,
      subject: "Confirme seu email · Oris Cloud",
      html,
    });

    if (error) {
      logger.error("Resend retornou erro ao enviar email de verificação", { error, to });
      throw new Error(`Resend error: ${JSON.stringify(error)}`);
    }

    logger.info("Email de verificação enviado", { to });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Falha ao enviar email de verificação", { error: message, to });
    throw err;
  }
}

/**
 * Escape HTML pra evitar injection via nome do usuário no greeting.
 * Better-auth valida nome no signup mas defesa em profundidade nunca é demais.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
