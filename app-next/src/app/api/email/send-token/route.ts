import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { logger } from "@/lib/logger";

const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { email, token, planName, days, amount, secret } = await request.json();
    
    // Validação de secret interno (endpoint só deve ser chamado por token/generate)
    if (!INTERNAL_SECRET || secret !== INTERNAL_SECRET) {
      logger.warn('Tentativa de enviar token sem secret válido', { email });
      return NextResponse.json(
        { error: "Não autorizado. Este endpoint é apenas para uso interno." },
        { status: 401 }
      );
    }
    
    logger.info("Enviar token por email", { email, token, planName, days });

    if (!email || !token || !planName) {
      logger.warn('Parâmetros faltando para envio de token', { email, token, planName });
      return NextResponse.json(
        { error: "Email, token e plano são obrigatórios" },
        { status: 400 }
      );
    }

    // Enviar email
    logger.info("Resend envio de email iniciado", { email });
    const { data, error } = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL as string,
      to: email,
      subject: "Pagamento Confirmado - Seu Token Oris Cloud",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Oris Cloud</h1>
            <p style="color: #666; margin-top: 10px;">Cloud Gaming Platform</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: white; margin: 0 0 10px 0;">🎉 Pagamento Confirmado!</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0;">Seu pagamento foi processado com sucesso</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-top: 0;">Detalhes da Compra</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #e0e0e0;">Plano:</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right; border-bottom: 1px solid #e0e0e0;">${planName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #e0e0e0;">Duração:</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right; border-bottom: 1px solid #e0e0e0;">${days} dias</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666;">Valor Pago:</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right;">R$ ${amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 25px; border-radius: 5px;">
            <h3 style="color: #856404; margin-top: 0; font-size: 16px;">📌 Seu Token de Ativação</h3>
            <p style="color: #856404; margin: 10px 0;">Use este token para ativar sua assinatura:</p>
            <div style="background-color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 15px 0; border-radius: 5px; border: 2px dashed #ffc107;">
              ${token}
            </div>
            <p style="color: #856404; margin: 10px 0; font-size: 14px;">
              ⏰ Este token expira em 30 dias
            </p>
          </div>

          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #0066cc; margin-top: 0; font-size: 16px;">🚀 Como Ativar</h3>
            <ol style="color: #333; margin: 10px 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Acesse o <a href="${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard" style="color: #0066cc; text-decoration: none; font-weight: bold;">Dashboard</a></li>
              <li style="margin-bottom: 10px;">Clique em "Recuperar" no canto superior direito</li>
              <li style="margin-bottom: 10px;">Digite seu token de 8 caracteres</li>
              <li style="margin-bottom: 10px;">Pronto! Sua assinatura será ativada automaticamente</li>
            </ol>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-top: 0; font-size: 16px;">💡 Próximos Passos</h3>
            <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Após ativar, você poderá criar seu disco virtual</li>
              <li style="margin-bottom: 10px;">Configure sua máquina com a GPU desejada</li>
              <li style="margin-bottom: 10px;">Conecte-se via RDP e comece a jogar!</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 5px 0;">
              Precisa de ajuda? Entre em contato conosco
            </p>
            <p style="color: #999; font-size: 14px; margin: 5px 0;">
              <a href="${process.env.DISCORD_GUILD_INVITE}" style="color: #667eea; text-decoration: none;">Discord</a> | 
              <a href="${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}" style="color: #667eea; text-decoration: none;">Website</a>
            </p>
            <p style="color: #ccc; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} Oris Cloud. Todos os direitos reservados.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      logger.error("Erro ao enviar email com token", { error, email, token });
      return NextResponse.json(
        { error: "Erro ao enviar email com token" },
        { status: 500 }
      );
    }

    logger.info("Email com token enviado", { email, id: data?.id });
    
    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    logger.error("Erro geral ao enviar token por email", { error });
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
