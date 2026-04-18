/**
 * Operações administrativas internas (server-side only)
 * Estes métodos NÃO devem ser expostos via API endpoints públicos
 * Usar apenas em processos internos, webhooks, e operações automáticas
 */

import { prisma } from '@/lib/prisma';

/**
 * Atualiza o estoque de produtos
 * @internal Uso apenas server-side
 */
export async function updateStockInternal(params: {
    quantity?: number;
    available?: number;
    reserved?: number;
}) {
    const { quantity, available, reserved } = params;

    let stock = await prisma.stock.findFirst();

    if (!stock) {
        stock = await prisma.stock.create({
            data: {
                total: quantity || 100,
                available: available !== undefined ? available : quantity || 100,
                reserved: reserved || 0
            }
        });
    } else {
        const updateData: any = {};
        
        if (quantity !== undefined) {
            updateData.total = quantity;
            if (available === undefined && reserved === undefined) {
                updateData.available = quantity;
            }
        }
        
        if (available !== undefined) {
            updateData.available = available;
        }
        
        if (reserved !== undefined) {
            updateData.reserved = reserved;
        }

        stock = await prisma.stock.update({
            where: { id: stock.id },
            data: updateData
        });
    }

    return stock;
}

/**
 * Atualiza informações de pagamento
 * @internal Uso apenas server-side (webhooks)
 */
export async function updatePaymentInternal(params: {
    customId: string;
    plan?: string;
    email?: string;
    webhookSended?: boolean;
    status?: string;
}) {
    const { customId, plan, email, webhookSended, status } = params;

    const updateData: any = {};
    if (plan) updateData.plan = plan;
    if (email) updateData.email = email;
    if (webhookSended !== undefined) updateData.webhookSended = webhookSended;
    if (status) updateData.status = status;

    const payment = await prisma.payment.update({
        where: { customId },
        data: updateData
    });

    return payment;
}

/**
 * Processa reembolso de pagamento
 * @internal Uso apenas server-side
 */
export async function refundPaymentInternal(customId: string) {
    const payment = await prisma.payment.findUnique({
        where: { customId }
    });

    if (!payment) {
        throw new Error('Payment not found');
    }

    // Marcar como reembolsado
    const refundedPayment = await prisma.payment.update({
        where: { customId },
        data: { status: 'refunded' }
    });

    // Se houver token associado, marcar como não utilizado
    const token = await prisma.purchaseToken.findUnique({
        where: { txid: payment.txid }
    });

    if (token && token.isRedeemed) {
        // Reverter resgate se necessário
        await prisma.purchaseToken.update({
            where: { id: token.id },
            data: {
                isRedeemed: false,
                redeemedAt: null,
                redeemedBy: null
            }
        });
    }

    return {
        payment: refundedPayment,
        tokenReverted: !!token
    };
}

/**
 * Reserva estoque para um pagamento pendente
 * @internal Uso apenas server-side
 */
export async function reserveStockInternal(quantity: number = 1) {
    const stock = await prisma.stock.findFirst();

    if (!stock) {
        throw new Error('Stock not initialized');
    }

    if (stock.available < quantity) {
        throw new Error('Insufficient stock available');
    }

    const updated = await prisma.stock.update({
        where: { id: stock.id },
        data: {
            available: stock.available - quantity,
            reserved: stock.reserved + quantity
        }
    });

    return updated;
}

/**
 * Libera estoque reservado (pagamento expirado/cancelado)
 * @internal Uso apenas server-side
 */
export async function releaseStockInternal(quantity: number = 1) {
    const stock = await prisma.stock.findFirst();

    if (!stock) {
        throw new Error('Stock not initialized');
    }

    const updated = await prisma.stock.update({
        where: { id: stock.id },
        data: {
            available: stock.available + quantity,
            reserved: Math.max(0, stock.reserved - quantity)
        }
    });

    return updated;
}

/**
 * Confirma venda (converte reserva em venda confirmada)
 * @internal Uso apenas server-side
 */
export async function confirmSaleInternal(quantity: number = 1) {
    const stock = await prisma.stock.findFirst();

    if (!stock) {
        throw new Error('Stock not initialized');
    }

    const updated = await prisma.stock.update({
        where: { id: stock.id },
        data: {
            reserved: Math.max(0, stock.reserved - quantity)
        }
    });

    return updated;
}
