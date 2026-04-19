/**
 * Layout HTML base de emails da Oris Cloud.
 *
 * Estrutura table-based com CSS inline, compatível com Outlook (inclusive 2007+),
 * Gmail, Apple Mail, mobile clients. Sem <style>, sem flex/grid, sem web fonts,
 * sem JavaScript. Usa MSO conditional comments para renderização correta no
 * Outlook desktop (que não suporta border-radius nem gradientes CSS).
 *
 * Paleta Oris:
 *  - Background: #09090B (página), #0D0D10 (card)
 *  - Accent primário: #22C55E (verde), #16A34A (verde escuro)
 *  - Borders: #1F1F23 (sutil), #2A2D3A (destaque)
 *  - Texto: #FFFFFF (primário), #E5E7EB (secundário), #9CA3AF (muted), #6B7280 (disabled)
 *  - Warning: #FCD34D (amarelo) sobre #1A1410
 */

export interface EmailHighlight {
  /** Ícone em emoji ou símbolo Unicode (safe em todos email clients). */
  icon: string;
  /** Título curto do destaque (ex: "GPU NVIDIA Tesla T4"). */
  title: string;
  /** Descrição curta de 1 linha. */
  description: string;
}

interface EmailLayoutOptions {
  /** Título HTML do documento (tag <title>). */
  title: string;
  /** Texto curto exibido em clientes que mostram preview (Gmail etc). */
  previewText: string;
  /** Título grande exibido no hero (se omitido, usa `title`). */
  heroTitle?: string;
  /** Subtítulo abaixo do hero title (opcional). */
  heroSubtitle?: string;
  /** Conteúdo principal do email em HTML já com CSS inline. */
  bodyHtml: string;
  /** Texto do botão de CTA primário. */
  ctaLabel: string;
  /** URL absoluta do CTA primário. */
  ctaUrl: string;
  /**
   * Cards de destaque exibidos após o CTA (opcional).
   * Renderizados como linhas de ícone + texto, compatíveis com todos os clients.
   */
  highlights?: EmailHighlight[];
  /** Nota de segurança em box amarelo (ex: "Este link expira em 1h"). */
  securityNote?: string;
  /** Texto pequeno no rodapé interno (ex: "Se você não solicitou, ignore"). */
  footerNote?: string;
}

/**
 * Renderiza o HTML completo do email pronto pra enviar via Resend.
 * Retorna string com <!DOCTYPE html> + <html> + <body> + table layout.
 */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const {
    title,
    previewText,
    heroTitle,
    heroSubtitle,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    highlights,
    securityNote,
    footerNote,
  } = options;
  const currentYear = new Date().getFullYear();

  const siteUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://oriscloud.com.br";
  const dashboardUrl = `${siteUrl}/dashboard`;
  const discordUrl = process.env.DISCORD_GUILD_INVITE || siteUrl;

  const effectiveHeroTitle = heroTitle || title;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#09090B;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#09090B;opacity:0;">
    ${previewText}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#09090B" style="background-color:#09090B;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">

          <!-- Accent bar superior -->
          <tr>
            <td bgcolor="#22C55E" height="3" style="height:3px;background-color:#22C55E;font-size:0;line-height:0;border-top-left-radius:16px;border-top-right-radius:16px;">&nbsp;</td>
          </tr>

          <!-- Hero -->
          <tr>
            <td bgcolor="#0D0D10" align="center" style="background-color:#0D0D10;border-left:1px solid #1F1F23;border-right:1px solid #1F1F23;padding:40px 32px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right:12px;">
                    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                      <path d="M16 3 C23.18 3 29 8.82 29 16 C29 23.18 23.18 29 16 29 C8.82 29 3 23.18 3 16 C3 10.48 6.44 5.77 11.29 3.89" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                      <path d="M10 22 L22 10" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                  </td>
                  <td valign="middle">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;">
                      Oris Cloud
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:28px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1.2;font-weight:700;color:#FFFFFF;letter-spacing:-0.03em;">
                ${effectiveHeroTitle}
              </h1>
              ${
                heroSubtitle
                  ? `<p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#9CA3AF;">${heroSubtitle}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td bgcolor="#0D0D10" style="background-color:#0D0D10;border-left:1px solid #1F1F23;border-right:1px solid #1F1F23;padding:8px 32px 8px 32px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- CTA button (VML fallback para Outlook) -->
          <tr>
            <td align="center" bgcolor="#0D0D10" style="background-color:#0D0D10;border-left:1px solid #1F1F23;border-right:1px solid #1F1F23;padding:24px 32px 8px 32px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:52px;v-text-anchor:middle;width:280px;" arcsize="20%" stroke="f" fillcolor="#22C55E">
                <w:anchorlock/>
                <center style="color:#09090B;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.01em;">${ctaLabel}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-- -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#22C55E" align="center" style="background-color:#22C55E;border-radius:10px;">
                    <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#09090B;text-decoration:none;border-radius:10px;letter-spacing:-0.01em;mso-padding-alt:0;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- URL fallback -->
          <tr>
            <td bgcolor="#0D0D10" align="center" style="background-color:#0D0D10;border-left:1px solid #1F1F23;border-right:1px solid #1F1F23;padding:16px 32px 24px 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6B7280;">
                Ou copie o link:<br>
                <a href="${ctaUrl}" style="color:#22C55E;text-decoration:none;word-break:break-all;">${ctaUrl}</a>
              </p>
            </td>
          </tr>

          ${highlights && highlights.length > 0 ? renderHighlights(highlights) : ""}

          ${
            securityNote
              ? `<tr>
            <td bgcolor="#0D0D10" style="background-color:#0D0D10;border-left:1px solid #1F1F23;border-right:1px solid #1F1F23;padding:0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#1A1410" style="background-color:#1A1410;border:1px solid #422006;border-radius:8px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#FCD34D;">
                      <strong style="color:#FBBF24;">Aviso de segurança:</strong> ${securityNote}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          ${
            footerNote
              ? `<tr>
            <td bgcolor="#0D0D10" style="background-color:#0D0D10;border-left:1px solid #1F1F23;border-right:1px solid #1F1F23;padding:0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-top:1px solid #1F1F23;padding-top:20px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6B7280;">
                      ${footerNote}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#09090B" style="background-color:#09090B;border:1px solid #1F1F23;border-top:none;border-bottom-left-radius:16px;border-bottom-right-radius:16px;padding:24px 32px 28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:0 10px;">
                    <a href="${dashboardUrl}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#D1D5DB;text-decoration:none;">Dashboard</a>
                  </td>
                  <td align="center" style="padding:0 6px;color:#374151;font-size:12px;">&middot;</td>
                  <td align="center" style="padding:0 10px;">
                    <a href="${discordUrl}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#D1D5DB;text-decoration:none;">Discord</a>
                  </td>
                  <td align="center" style="padding:0 6px;color:#374151;font-size:12px;">&middot;</td>
                  <td align="center" style="padding:0 10px;">
                    <a href="mailto:contato@oriscloud.com.br" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#D1D5DB;text-decoration:none;">Suporte</a>
                  </td>
                </tr>
              </table>

              <p style="margin:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#6B7280;">
                &copy; ${currentYear} Oris Cloud &middot; Cloud gaming em AWS EC2 &middot; São Paulo, Brasil
              </p>
              <p style="margin:6px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.5;color:#4B5563;">
                Você recebeu este email porque alguém criou uma conta ou solicitou uma ação usando seu endereço.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Renderiza a lista de highlights como linhas em uma tabela (ícone à esquerda,
 * título + descrição à direita). Layout single-column robusto em todos os clients.
 */
function renderHighlights(highlights: EmailHighlight[]): string {
  const rows = highlights
    .map(
      (h) => `
        <tr>
          <td valign="top" width="44" style="padding:14px 14px 14px 16px;width:44px;">
            <div style="width:36px;height:36px;line-height:36px;text-align:center;background-color:#111827;border:1px solid #1F2937;border-radius:8px;font-size:18px;">
              ${h.icon}
            </div>
          </td>
          <td valign="middle" style="padding:14px 16px 14px 0;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4;font-weight:600;color:#FFFFFF;letter-spacing:-0.01em;">
              ${h.title}
            </p>
            <p style="margin:4px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#9CA3AF;">
              ${h.description}
            </p>
          </td>
        </tr>`
    )
    .join("");

  return `<tr>
            <td bgcolor="#0D0D10" style="background-color:#0D0D10;border-left:1px solid #1F1F23;border-right:1px solid #1F1F23;padding:0 24px 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#0A0A0C" style="background-color:#0A0A0C;border:1px solid #1F1F23;border-radius:12px;">
                ${rows}
              </table>
            </td>
          </tr>`;
}
