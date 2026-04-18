import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { consultarStatusCobranca } from '@/lib/efiPayments';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ customId: string }> }
) {
    try {
        // ✅ 1. Rate limiting
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
        if (rateLimitResult) return rateLimitResult;

        // ✅ 2. Autenticação obrigatória
        const user = await requireAuth();
        if (user instanceof NextResponse) return user;

        const { customId } = await params;

        if (!customId) {
            return NextResponse.json(
                {
                    message: "ID not found in parameters",
                    support: "@known.js"
                },
                { status: 400 }
            );
        }

        const dbPayment = await prisma.payment.findUnique({
            where: { customId }
        });

        if (!dbPayment) {
            return NextResponse.json(
                {
                    message: "Payment not found in the database",
                    support: "@known.js"
                },
                { status: 404 }
            );
        }

        // ✅ 3. Validar ownership - verificar se o pagamento pertence ao usuário autenticado
        const paymentUser = await prisma.user.findUnique({ 
            where: { email: dbPayment.email } 
        });
        
        if (!paymentUser || paymentUser.id !== user.id) {
            logger.warn('Tentativa de acessar pagamento de outro usuário', {
                userId: user.id,
                paymentEmail: dbPayment.email,
                customId
            });
            return NextResponse.json(
                { 
                    message: "Não autorizado",
                    support: "@known.js" 
                },
                { status: 403 }
            );
        }

        // Consultar status atualizado no EfiBank
        const efiStatus = await consultarStatusCobranca(dbPayment.txid);
        
        // Mapear status do EFI para o formato esperado
        let mappedStatus = dbPayment.status;
        if (efiStatus === 'CONCLUIDA') {
            mappedStatus = 'approved';
        } else if (efiStatus === 'ATIVA') {
            mappedStatus = 'pending';
        } else if (efiStatus === 'REMOVIDA_PELO_USUARIO_RECEBEDOR' || efiStatus === 'REMOVIDA_PELO_PSP') {
            mappedStatus = 'cancelled';
        }

        // Atualizar status no banco se mudou
        if (mappedStatus !== dbPayment.status) {
            await prisma.payment.update({
                where: { customId },
                data: { status: mappedStatus }
            });

            // Se o pagamento foi aprovado, gerar token automaticamente
            if (mappedStatus === 'approved') {
                try {
                    logger.info('Pagamento aprovado, gerando token', { txid: dbPayment.txid });
                    
                    // Usar URL absoluta baseada no host da requisição
                    const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
                                   `${req.nextUrl.protocol}//${req.nextUrl.host}`;
                    
                    const tokenResponse = await fetch(`${baseUrl}/api/token/generate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            txid: dbPayment.txid,
                            secret: process.env.INTERNAL_WEBHOOK_SECRET,
                            planId: dbPayment.vCpuPlanId,
                            diskAddonId: dbPayment.diskAddonId
                        }),
                    });

                    if (tokenResponse.ok) {
                        const tokenData = await tokenResponse.json();
                        logger.info('Token gerado e enviado por email', { token: tokenData.token });
                    } else {
                        const errorText = await tokenResponse.text();
                        logger.error('Erro ao gerar token', { error: errorText });
                    }
                } catch (tokenError: any) {
                    logger.error('Erro ao gerar token automaticamente', { error: tokenError?.message });
                    // Não falhar a requisição se a geração do token falhar
                }
            }
        }

        // Retornar dados no formato esperado pelo frontend
        return NextResponse.json({
            id: dbPayment.customId,
            txid: dbPayment.txid,
            status: mappedStatus,
            transaction_amount: dbPayment.amount,
            date_created: dbPayment.createdAt.toISOString(),
            _doc: {
                plan: dbPayment.plan,
                email: dbPayment.email,
                webhook_sended: dbPayment.webhookSended,
                vCpuPlanId: dbPayment.vCpuPlanId,
                diskAddonId: dbPayment.diskAddonId,
                discordId: dbPayment.discordId
            },
            point_of_interaction: {
                transaction_data: {
                    qr_code_base64: dbPayment.qrCodeBase64?.replace('data:image/png;base64,', '') || '',
                    qr_code: dbPayment.pixCopiaECola || ''
                }
            }
        }, { status: 200 });

    } catch (err) {
        logger.error('Error fetching payment', { error: err });
        return NextResponse.json(
            {
                message: "Error when fetching payment",
                error: err,
                support: '@known.js'
            },
            { status: 500 }
        );
    }
}
