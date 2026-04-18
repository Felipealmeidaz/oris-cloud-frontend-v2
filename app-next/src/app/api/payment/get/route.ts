import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consultarStatusCobranca } from '@/lib/efiPayments';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
        if (rateLimitResult) return rateLimitResult;

        // Autenticação obrigatória
        const user = await requireAuth();
        if (user instanceof NextResponse) return user;

        const url = new URL(req.url);
        const customId = url.searchParams.get("id");
        
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

        // Validar ownership: verificar se o pagamento pertence ao usuário autenticado
        const paymentUser = await prisma.user.findUnique({ where: { email: dbPayment.email } });
        if (!paymentUser || paymentUser.id !== user.id) {
            logger.warn('Tentativa de acessar pagamento de outro usuário', {
                requestUserId: user.id,
                paymentEmail: dbPayment.email
            });
            return NextResponse.json(
                {
                    message: "Access denied",
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
                    logger.info('Pagamento aprovado - gerando token', { txid: dbPayment.txid });
                    
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

                    // Buscar usuário para montar payload do webhook
                    const user = await prisma.user.findUnique({ where: { email: dbPayment.email } });
                    const userName = user?.name ?? dbPayment.email;
                    const userId = user?.id;
                    const userImage = user?.image ?? null;

                    const successEmbed = {
                        embeds: [
                            {
                                author: { name: `#${dbPayment.customId}` },
                                title: 'Compra Confirmada',
                                description: 'Pagamento aprovado e token enviado ao usuário.',
                                fields: [
                                    { name: '<:xsCart:1235401137767714878> Plano Adquirido:', value: `${dbPayment.plan}` },
                                    { name: '<:wPrice:1261136034654191698> Valor pago:', value: `R$${dbPayment.amount}` },
                                    { name: '<:xsSend:1241241326394277918> E-mail do usuário:', value: `${dbPayment.email}` },
                                ],
                                color: 65280,
                                ...(userImage ? { thumbnail: { url: userImage } } : {}),
                                footer: { text: 'Oris Cloud' },
                                timestamp: new Date().toISOString(),
                            },
                            {
                                description: 'Para prosseguir com a entrega da máquina, entre em contato via DM ou aguarde a abertura de um ticket.',
                                color: 2895667,
                            },
                        ],
                        content: `**${userId ? `<@${userId}> | @${userName} | ${userId}` : `@${userName}`}**`,
                    };

                    try {
                        const webhookResponse = await fetch(`${baseUrl}/api/webhook/send`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: successEmbed, secret: process.env.INTERNAL_WEBHOOK_SECRET }),
                        });
                        if (!webhookResponse.ok) {
                            const errText = await webhookResponse.text();
                            logger.error('Erro ao enviar webhook de sucesso', { error: errText });
                        } else {
                            try {
                                await prisma.payment.update({
                                    where: { customId },
                                    data: { webhookSended: true }
                                });
                            } catch (updateErr: any) {
                                logger.warn('Falha ao marcar webhookSended', { error: updateErr?.message });
                            }
                        }
                    } catch (whErr: any) {
                        logger.error('Erro geral ao enviar webhook de sucesso', { error: whErr?.message });
                    }

                    // Atribuir role no Discord via chamada interna
                    if (userId) {
                        try {
                            const roleResponse = await fetch(`${baseUrl}/api/role/give`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ discordId: userId, secret: process.env.INTERNAL_WEBHOOK_SECRET }),
                            });
                            if (!roleResponse.ok) {
                                const errText = await roleResponse.text();
                                logger.error('Erro ao atribuir role no Discord', { error: errText });
                            }
                        } catch (roleErr: any) {
                            logger.error('Erro geral ao atribuir role no Discord', { error: roleErr?.message });
                        }
                    }
                } catch (tokenError) {
                    logger.error('Erro ao processar fluxo pós-aprovação', { error: tokenError });
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
        logger.error('Erro ao buscar pagamento', { error: err });
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