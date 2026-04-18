import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { criarCobrancaEfiBank } from '@/lib/efiPayments';
import { requireAuth } from '@/lib/middleware/auth';
import { paymentCreateSchema } from '@/lib/validations/payment';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { validateEmailDomain } from '@/lib/email-validation';

export async function POST(req: NextRequest) {
    try {
        // ✅ Rate limiting (20 pagamentos/hora)
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.PAYMENT_CREATE);
        if (rateLimitResult) return rateLimitResult;

        // ✅ Autenticação obrigatória
        const user = await requireAuth();
        if (user instanceof NextResponse) return user;

        // ✅ Validar entrada com Zod
        const body = await req.json();
        const validation = paymentCreateSchema.safeParse(body);

        if (!validation.success) {
            logger.warn('Dados inválidos para criação de pagamento', {
                errors: validation.error.format(),
            });
            return NextResponse.json(
                { error: 'Dados inválidos', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { customId, planName, email, discordId, diskAddonId, vCpuPlanId } = validation.data;

        // ✅ Validar domínio do email ANTES de buscar planos (otimização)
        const emailValid = await validateEmailDomain(email);
        if (!emailValid) {
            logger.warn('Domínio de email inválido', { email });
            return NextResponse.json(
                { error: 'Domínio de email inválido' },
                { status: 400 }
            );
        }

        let totalAmount = 0;
        let diskSizeGB = 256;
        let vCpus = 4;
        let ramGB = 28;
        let planDisplayName = '';
        let days = 1;

        // Buscar plano de vCPU (novo sistema)
        if (vCpuPlanId) {
            const vcpuPlan = await prisma.vCpuPlan.findUnique({
                where: { id: vCpuPlanId, active: true }
            });

            if (!vcpuPlan) {
                return NextResponse.json(
                    { error: 'Plano de vCPU não encontrado ou inativo' },
                    { status: 404 }
                );
            }

            totalAmount = vcpuPlan.price;
            vCpus = vcpuPlan.vCpus;
            ramGB = vcpuPlan.ramGB;
            days = vcpuPlan.days;
            planDisplayName = vcpuPlan.name;
        } else if (planName) {
            // Fallback para planos antigos
            const plan = await prisma.plan.findFirst({
                where: { name: planName, active: true }
            });

            if (!plan) {
                return NextResponse.json(
                    { error: 'Plano não encontrado ou inativo' },
                    { status: 404 }
                );
            }

            totalAmount = plan.price;
            planDisplayName = plan.name;
        } else {
            return NextResponse.json(
                { error: 'Nenhum plano selecionado' },
                { status: 400 }
            );
        }

        // Adicionar valor do disco
        if (diskAddonId) {
            const diskAddon = await prisma.diskAddon.findUnique({
                where: { id: diskAddonId, active: true }
            });

            if (diskAddon) {
                totalAmount += diskAddon.price;
                diskSizeGB = diskAddon.sizeGB;
            }
        }
        
        // ✅ RESERVAR ESTOQUE ATOMICAMENTE antes de criar cobrança (timeout 10s)
        const stockReservation = await prisma.$transaction(async (tx) => {
            const stock = await tx.stock.findFirst();
            
            if (!stock || stock.available < 1) {
                throw new Error('SEM_ESTOQUE');
            }
            
            // Reservar 1 unidade atomicamente
            const updatedStock = await tx.stock.update({
                where: { id: stock.id },
                data: {
                    available: stock.available - 1,
                    reserved: stock.reserved + 1
                }
            });
            
            return updatedStock;
        }).catch((error) => {
            if (error.message === 'SEM_ESTOQUE') {
                logger.warn('Sem estoque disponível na reserva atômica', { userId: user.id });
                return null;
            }
            throw error;
        });
        
        if (!stockReservation) {
            return NextResponse.json(
                { error: 'Sem estoque disponível' },
                { status: 400 }
            );
        }

        logger.info('Estoque reservado, criando cobrança no EfiBank', { 
            planName: planDisplayName, 
            amount: totalAmount,
            userId: user.id,
            stockAvailable: stockReservation.available,
        });

        // Criar cobrança no EfiBank
        let cobranca;
        try {
            cobranca = await criarCobrancaEfiBank(
                totalAmount,
                `VM ${vCpus}vCPUs ${ramGB}GB - ${days}d (${diskSizeGB}GB)`,
                15,
                email.split('@')[0],
                '33877493840' // CPF do beneficiário (vendedor)
            );

            if (!cobranca) {
                throw new Error('EfiBank retornou null');
            }
        } catch (efiError: any) {
            logger.error('Erro ao criar cobrança no EfiBank, fazendo rollback de estoque', { 
                planName: planDisplayName, 
                userId: user.id,
                error: efiError.message
            });
            
            // ROLLBACK: Liberar estoque reservado
            await prisma.stock.update({
                where: { id: stockReservation.id },
                data: {
                    available: stockReservation.available + 1,
                    reserved: Math.max(0, stockReservation.reserved - 1)
                }
            });
            
            return NextResponse.json(
                { error: 'Erro ao criar cobrança no EfiBank. Tente novamente.' },
                { status: 500 }
            );
        }

        // Salvar pagamento no banco de dados
        const payment = await prisma.payment.create({
            data: {
                customId,
                txid: cobranca.txid,
                email,
                plan: planDisplayName,
                amount: totalAmount,
                diskAddonId: diskAddonId || null,
                diskSizeGB,
                vCpuPlanId: vCpuPlanId || null,
                vCpus,
                ramGB,
                status: 'pending',
                qrCodeBase64: cobranca.qrCodeBase64,
                pixCopiaECola: cobranca.pixCopiaECola,
                loc: cobranca.loc ? String(cobranca.loc) : null,
                webhookSended: false,
                discordId: discordId || null
            }
        });

        logger.info('Pagamento criado com sucesso', {
            customId,
            txid: payment.txid,
            planName: planDisplayName,
            amount: payment.amount,
            userId: user.id,
        });

        return NextResponse.json({
            id: payment.customId,
            txid: payment.txid,
            qrCodeBase64: payment.qrCodeBase64,
            pixCopiaECola: payment.pixCopiaECola,
            valor: payment.amount,
            plano: payment.plan,
            diskSizeGB: payment.diskSizeGB,
            vCpus: payment.vCpus,
            ramGB: payment.ramGB
        });

    } catch (error) {
        logger.error('Erro ao criar pagamento', { error });
        return NextResponse.json(
            { error: 'Erro ao criar pagamento' },
            { status: 500 }
        );
    }
}
