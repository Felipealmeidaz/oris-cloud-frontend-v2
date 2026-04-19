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

  const firstName = name ? escapeHtml(name).split(" ")[0] : null;
  const greeting = firstName ? `Olá, ${firstName}!` : "Olá!";

  const bodyHtml = `
    <p style="margin:20px 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#FFFFFF;font-weight:600;">
      ${greeting}
    </p>
    <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#D1D5DB;">
      Obrigado por criar sua conta na <strong style="color:#22C55E;">Oris Cloud</strong>. Você está a <strong style="color:#FFFFFF;">um clique</strong> de liberar seu acesso ao cloud gaming com hardware dedicado da AWS.
    </p>
    <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#D1D5DB;">
      Confirme seu endereço de email pra começar:
    </p>
  `;

  const html = renderEmailLayout({
    title: "Confirme seu email · Oris Cloud",
    previewText: "Um clique e sua conta Oris Cloud está ativa. GPU Tesla T4, 28GB RAM e conexão via Parsec te esperam.",
    heroTitle: "Bem-vindo à Oris Cloud",
    heroSubtitle: "Confirme seu email pra ativar sua conta e começar a jogar na nuvem.",
    bodyHtml,
    ctaLabel: "Confirmar meu email",
    ctaUrl: url,
    highlights: [
      {
        icon: "🎮",
        title: "GPU NVIDIA Tesla T4 (16GB)",
        description: "Performance dedicada pra rodar jogos em alta qualidade direto da nuvem.",
      },
      {
        icon: "⚡",
        title: "Até 28GB RAM DDR5 · AMD EPYC",
        description: "Hardware AWS EC2 em São Paulo com baixíssima latência pra Brasil.",
      },
      {
        icon: "🕹️",
        title: "Parsec e Moonlight integrados",
        description: "Conecte do notebook, celular ou TV em poucos cliques. Sem configuração complicada.",
      },
    ],
    securityNote:
      "Este link de confirmação expira em 1 hora. Se passar desse prazo, solicite um novo no app.",
    footerNote:
      "Se você não criou uma conta na Oris Cloud, pode ignorar este email com tranquilidade. Nenhuma ação será tomada.",
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
