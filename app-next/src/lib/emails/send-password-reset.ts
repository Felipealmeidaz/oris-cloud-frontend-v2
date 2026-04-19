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

  const firstName = name ? escapeHtml(name).split(" ")[0] : null;
  const greeting = firstName ? `Olá, ${firstName}!` : "Olá!";

  const bodyHtml = `
    <p style="margin:20px 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#FFFFFF;font-weight:600;">
      ${greeting}
    </p>
    <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#D1D5DB;">
      Recebemos uma solicitação pra redefinir a senha da sua conta na <strong style="color:#22C55E;">Oris Cloud</strong>. Pra criar uma nova senha é só clicar no botão abaixo — vai abrir uma página segura pra você escolher a nova combinação.
    </p>
    <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#D1D5DB;">
      O processo leva menos de 30 segundos:
    </p>
  `;

  const html = renderEmailLayout({
    title: "Redefinir sua senha · Oris Cloud",
    previewText: "Link seguro pra criar uma nova senha da sua conta Oris Cloud. Expira em 1 hora.",
    heroTitle: "Redefinir sua senha",
    heroSubtitle: "Crie uma nova senha pra acessar sua conta em segurança.",
    bodyHtml,
    ctaLabel: "Criar nova senha",
    ctaUrl: url,
    highlights: [
      {
        icon: "🔒",
        title: "Link único e seguro",
        description: "Esse link é pessoal e só funciona uma vez. Depois de usar, ele expira.",
      },
      {
        icon: "⏱️",
        title: "Válido por 1 hora",
        description: "Por segurança, o link expira em 60 minutos. Solicite um novo se precisar.",
      },
      {
        icon: "💡",
        title: "Use uma senha forte",
        description: "Combine letras maiúsculas, minúsculas, números e símbolos. Evite senhas usadas em outros sites.",
      },
    ],
    securityNote:
      "Este link expira em 1 hora e só pode ser usado uma vez. Nunca compartilhe com ninguém.",
    footerNote:
      "Se você não solicitou a redefinição, ignore este email — sua senha atual continua válida e sua conta está segura. Se suspeita que alguém está tentando acessar sua conta, entre em contato com nosso suporte imediatamente.",
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
