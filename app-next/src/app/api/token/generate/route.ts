import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { z } from 'zod';

const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;

const tokenGenerateSchema = z.object({
  txid: z.string().min(1, 'txid é obrigatório'),
  secret: z.string().min(1, 'secret é obrigatório'),
  planId: z.string().uuid('planId deve ser um UUID válido'),
  diskAddonId: z.string().uuid('diskAddonId deve ser um UUID válido').optional(),
});

// Função para gerar token de 8 dígitos com segurança criptográfica
function generateToken(): string {
    const crypto = require('crypto');
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    const bytes = crypto.randomBytes(8);
    
    for (let i = 0; i < 8; i++) {
        // Usar bytes aleatórios criptograficamente seguros
        token += characters.charAt(bytes[i] % characters.length);
    }
    return token;
}

// Função para calcular dias baseado no plano
function getDaysFromPlan(planName: string): number {
    const planMap: { [key: string]: number } = {
        'Diário': 1,
        'Semanal': 7,
        'Quinzenal': 15,
        'Mensal': 30,
        'Trimestral': 90,
    };
    return planMap[planName] || 30;
}

export async function POST(req: NextRequest) {
    try {
        // ✅ Rate limiting (mesmo endpoint interno, prevenir abuse)
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
        if (rateLimitResult) return rateLimitResult;

        const { txid, planId, diskAddonId, secret } = await req.json();

        // ✅ CRÍTICO: Validar INTERNAL_SECRET antes de qualquer operação
        if (!INTERNAL_SECRET || secret !== INTERNAL_SECRET) {
            logger.warn('Tentativa de gerar token sem secret válido', { txid });
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 403 }
            );
        }

        if (!txid) {
            return NextResponse.json(
                { error: 'txid é obrigatório' },
                { status: 400 }
            );
        }

        if (!planId) {
            return NextResponse.json(
                { error: 'planId é obrigatório' },
                { status: 400 }
            );
        }

        // Buscar o pagamento no banco
        const payment = await prisma.payment.findUnique({
            where: { txid }
        });

        if (!payment) {
            return NextResponse.json(
                { error: 'Pagamento não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se o pagamento foi aprovado
        if (payment.status !== 'approved') {
            return NextResponse.json(
                { error: 'Pagamento não foi aprovado' },
                { status: 400 }
            );
        }

        // Buscar informações do plano vCPU
        const plan = await prisma.vCpuPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json(
                { error: 'Plano não encontrado' },
                { status: 404 }
            );
        }

        // Buscar informações do adicional de disco (se fornecido)
        let diskAddon = null;
        if (diskAddonId) {
            diskAddon = await prisma.diskAddon.findUnique({
                where: { id: diskAddonId }
            });

            if (!diskAddon) {
                return NextResponse.json(
                    { error: 'Adicional de disco não encontrado' },
                    { status: 404 }
                );
            }
        }

        // Calcular o valor esperado (plano + adicional de disco)
        const expectedAmount = plan.price + (diskAddon ? diskAddon.price : 0);

        // Validar se o valor pago corresponde ao valor esperado (com tolerância de 0.01 para arredondamento)
        if (Math.abs(payment.amount - expectedAmount) > 0.01) {
            return NextResponse.json(
                { 
                    error: 'Valor pago não corresponde ao valor do plano',
                    expected: expectedAmount,
                    paid: payment.amount
                },
                { status: 400 }
            );
        }

        // Verificar se já existe um token para este txid
        const existingToken = await prisma.purchaseToken.findUnique({
            where: { txid }
        });

        if (existingToken) {
            // Token já existe, mas vamos enviar o email novamente
            logger.info('Token já existe para txid, reenviando email', { txid });

            // Reenviar email com o token
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
                               `${req.nextUrl.protocol}//${req.nextUrl.host}`;
                
                const emailResponse = await fetch(`${baseUrl}/api/email/send-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: payment.email,
                        token: existingToken.token,
                        planName: plan.name,
                        days: existingToken.days,
                        amount: existingToken.price,
                        secret: INTERNAL_SECRET
                    }),
                });
                
                if (emailResponse.ok) {
                    logger.info('Email com token reenviado', { email: payment.email });
                } else {
                    const errorText = await emailResponse.text();
                    logger.error('Erro ao reenviar email', { error: errorText });
                }
            } catch (emailError: any) {
                logger.error('Erro ao reenviar email com token', { error: emailError?.message });
            }

            return NextResponse.json({
                success: true,
                token: existingToken.token,
                days: existingToken.days,
                expiresAt: existingToken.expiresAt,
                message: 'Token já existe para este pagamento e email foi reenviado'
            });
        }

        // Gerar token único com proteção contra loop infinito
        let token = generateToken();
        let tokenExists = await prisma.purchaseToken.findUnique({
            where: { token }
        });

        // Garantir que o token seja único (máximo 10 tentativas)
        let attempts = 0;
        while (tokenExists && attempts < 10) {
            token = generateToken();
            tokenExists = await prisma.purchaseToken.findUnique({
                where: { token }
            });
            attempts++;
        }

        // Se após 10 tentativas ainda houver colisão, logar erro crítico
        if (tokenExists) {
            logger.error('Falha ao gerar token único após 10 tentativas', { txid: payment.txid });
            return NextResponse.json(
                { error: 'Erro ao gerar token único. Tente novamente.' },
                { status: 500 }
            );
        }

        // Calcular data de expiração (30 dias para resgatar o token)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Criar o token no banco
        const purchaseToken = await prisma.purchaseToken.create({
            data: {
                token,
                planId: plan.id,
                days: plan.days,
                price: payment.amount,
                diskSizeGB: diskAddon ? diskAddon.sizeGB : 256,
                vCpus: plan.vCpus,
                ramGB: plan.ramGB,
                txid: payment.txid,
                expiresAt
            }
        });

        // Enviar email com o token
        try {
            // Usar URL absoluta baseada no host da requisição
            const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
                           `${req.nextUrl.protocol}//${req.nextUrl.host}`;
            
            const emailResponse = await fetch(`${baseUrl}/api/email/send-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: payment.email,
                    token: purchaseToken.token,
                    planName: plan.name,
                    days: purchaseToken.days,
                    amount: payment.amount,
                    secret: INTERNAL_SECRET
                }),
            });
            
            if (emailResponse.ok) {
                logger.info('Email com token enviado', { email: payment.email });
            } else {
                const errorText = await emailResponse.text();
                logger.error('Erro ao enviar email', { error: errorText });
            }
        } catch (emailError) {
            console.error('Erro ao enviar email com token:', emailError);
            // Não falhar a requisição se o email falhar
        }

        return NextResponse.json({
            success: true,
            token: purchaseToken.token,
            days: purchaseToken.days,
            expiresAt: purchaseToken.expiresAt,
            message: 'Token gerado com sucesso e enviado por email'
        });

    } catch (error) {
        logger.error('Erro ao gerar token', { error });
        return NextResponse.json(
            { error: 'Erro ao gerar token' },
            { status: 500 }
        );
    }
}
