/**
 * Envia email de redefinição de senha via Resend usando template Oris Cloud.
 *
 * Chamado pelo callback `emailAndPassword.sendResetPassword` do better-auth
 * (ver src/lib/auth.ts). Better-auth gera a `url` contendo o token e a rota
 * de redirecionamento do app (ex: /reset-password?token=...).
 */

import { getResend } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { renderEmailLayout } from "./_layout";

interface SendPasswordResetEmailArgs {
  to: string;
  url: string;
  name?: string | null;
}

export async function sendPasswordResetEmail({
  to,
  url,
  name,
}: SendPasswordResetEmailArgs): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    logger.error("RESEND_FROM_EMAIL não configurado; email de reset não enviado", { to });
    throw new Error("RESEND_FROM_EMAIL ausente");
  }

  const greeting = name ? `Olá ${escapeHtml(name)},` : "Olá,";

  const bodyHtml = `
    <h1 style="margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;">
      Redefinir sua senha
    </h1>
    <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#E5E7EB;">
      ${greeting}
    </p>
    <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#E5E7EB;">
      Recebemos uma solicitação pra redefinir a senha da sua conta na <strong style="color:#FFFFFF;">Oris Cloud</strong>. Clique no botão abaixo pra escolher uma nova senha.
    </p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#9CA3AF;">
      Este link expira em 1 hora por segurança.
    </p>
  `;

  const html = renderEmailLayout({
    title: "Redefinir sua senha · Oris Cloud",
    previewText: "Clique pra criar uma nova senha da sua conta Oris Cloud.",
    bodyHtml,
    ctaLabel: "Redefinir senha",
    ctaUrl: url,
    footerNote:
      "Se você não solicitou a redefinição, ignore este email. Sua senha atual continua válida e sua conta está segura.",
  });

  try {
    const { error } = await getResend().emails.send({
      from,
      to,
      subject: "Redefinir sua senha · Oris Cloud",
      html,
    });

    if (error) {
      logger.error("Resend retornou erro ao enviar email de reset", { error, to });
      throw new Error(`Resend error: ${JSON.stringify(error)}`);
    }

    logger.info("Email de reset de senha enviado", { to });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Falha ao enviar email de reset de senha", { error: message, to });
    throw err;
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
