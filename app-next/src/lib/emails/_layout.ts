/**
 * Layout HTML base de emails da Oris Cloud.
 *
 * Estrutura table-based com CSS inline, compatível com Outlook, Gmail,
 * Apple Mail, mobile clients. Sem <style>, sem flex/grid, sem web fonts,
 * sem JavaScript.
 *
 * Paleta Oris: preto #09090B, branco, detalhes em #E5E7EB (cinza claro).
 * Identidade visual: logo SVG inline (anel aberto + barra diagonal).
 */

interface EmailLayoutOptions {
  /** Título que aparece no preheader e no header do email. */
  title: string;
  /** Texto curto exibido em clientes que mostram preview (Gmail etc). */
  previewText: string;
  /** Conteúdo principal do email em HTML já com CSS inline. */
  bodyHtml: string;
  /** Texto do botão de CTA primário. */
  ctaLabel: string;
  /** URL absoluta do CTA primário. */
  ctaUrl: string;
  /** Texto opcional abaixo do CTA (ex: "Se você não solicitou, ignore"). */
  footerNote?: string;
}

/**
 * Renderiza o HTML completo do email pronto pra enviar via Resend.
 * Retorna string com <!DOCTYPE html> + <html> + <body> + table layout.
 */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const { title, previewText, bodyHtml, ctaLabel, ctaUrl, footerNote } = options;
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090B;font-family:Arial,Helvetica,sans-serif;">
  <!-- Preheader oculto -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#09090B;opacity:0;">
    ${previewText}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#09090B" style="background-color:#09090B;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Inner container 600px -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:#0D0D10;border:1px solid #1F1F23;border-radius:12px;">

          <!-- Header com logo Oris -->
          <tr>
            <td align="left" bgcolor="#0D0D10" style="padding:28px 32px 20px 32px;border-bottom:1px solid #1F1F23;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right:10px;">
                    <!-- Logo SVG inline: anel aberto com barra diagonal -->
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                      <path d="M16 3 C23.18 3 29 8.82 29 16 C29 23.18 23.18 29 16 29 C8.82 29 3 23.18 3 16 C3 10.48 6.44 5.77 11.29 3.89" stroke="#FFFFFF" stroke-width="2.25" stroke-linecap="round" fill="none"/>
                      <path d="M10 22 L22 10" stroke="#FFFFFF" stroke-width="2.25" stroke-linecap="round"/>
                    </svg>
                  </td>
                  <td valign="middle">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:600;color:#FFFFFF;letter-spacing:-0.01em;">
                      Oris <span style="color:#9CA3AF;">Cloud</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td bgcolor="#0D0D10" style="padding:36px 32px 12px 32px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" bgcolor="#0D0D10" style="padding:12px 32px 28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#FFFFFF" align="center" style="border-radius:8px;">
                    <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#09090B;text-decoration:none;border-radius:8px;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- URL fallback pra quem não clica no botão -->
          <tr>
            <td bgcolor="#0D0D10" style="padding:0 32px 28px 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#9CA3AF;">
                Se o botão acima não funcionar, copie e cole este link no seu navegador:
              </p>
              <p style="margin:8px 0 0 0;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.5;color:#6B7280;word-break:break-all;">
                ${ctaUrl}
              </p>
            </td>
          </tr>

          ${
            footerNote
              ? `<tr>
            <td bgcolor="#0D0D10" style="padding:0 32px 28px 32px;border-top:1px solid #1F1F23;padding-top:20px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6B7280;">
                ${footerNote}
              </p>
            </td>
          </tr>`
              : ""
          }

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#09090B" style="padding:24px 32px;border-top:1px solid #1F1F23;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6B7280;">
                &copy; ${currentYear} Oris Cloud &middot; Cloud gaming em AWS EC2
              </p>
              <p style="margin:6px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;color:#4B5563;">
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
