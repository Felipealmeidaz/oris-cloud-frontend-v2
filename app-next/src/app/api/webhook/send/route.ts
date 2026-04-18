import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;

/**
 * Valida que a URL é realmente do Discord
 * Previne SSRF (Server-Side Request Forgery)
 */
function isValidDiscordWebhook(url: string): boolean {
    try {
        const parsed = new URL(url);
        // Aceitar apenas domínios oficiais do Discord
        const validDomains = ['discord.com', 'discordapp.com'];
        return validDomains.some(domain => 
            parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        // ✅ Rate limiting (150/min)
        const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
        if (rateLimitResult) return rateLimitResult;

        // ✅ Validar configuração do webhook
        if (!DISCORD_WEBHOOK_URL) {
            logger.error('Discord webhook URL não configurada');
            return NextResponse.json(
                {
                    message: 'Discord webhook URL not configured',
                    support: '@known.js'
                },
                { status: 500 }
            );
        }

        // ✅ Validar que URL é realmente do Discord (prevenir SSRF)
        if (!isValidDiscordWebhook(DISCORD_WEBHOOK_URL)) {
            logger.error('Discord webhook URL inválida ou suspeita', {
                url: DISCORD_WEBHOOK_URL
            });
            return NextResponse.json(
                {
                    message: 'Invalid Discord webhook URL',
                    support: '@known.js'
                },
                { status: 500 }
            );
        }

        const { data, secret } = await req.json();

        if (!INTERNAL_SECRET || secret !== INTERNAL_SECRET) {
            logger.warn('Webhook interno sem secret válido');
            return NextResponse.json(
                { message: 'Operação não autorizada' },
                { status: 403 }
            );
        }

        if (!data) {
            logger.warn('Tentativa de enviar webhook sem dados');
            return NextResponse.json(
                {
                    message: 'No data provided',
                    support: '@known.js'
                },
                { status: 400 }
            );
        }

        // ✅ Limitar tamanho do payload
        const dataString = JSON.stringify(data);
        if (dataString.length > 50000) { // 50KB limit
            logger.warn('Payload do webhook muito grande', {
                size: dataString.length
            });
            return NextResponse.json(
                {
                    message: 'Payload too large',
                    support: '@known.js'
                },
                { status: 413 }
            );
        }

        logger.info('Enviando webhook para Discord');

        // Enviar para o webhook do Discord
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: dataString,
            signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Erro ao enviar webhook do Discord', {
                status: response.status,
                error: errorText
            });
            return NextResponse.json(
                {
                    message: 'Failed to send webhook',
                    error: errorText,
                    support: '@known.js'
                },
                { status: response.status }
            );
        }

        logger.info('Webhook enviado com sucesso');

        return NextResponse.json({ 
            success: true,
            message: 'Webhook sent successfully'
        });
    } catch (err: any) {
        logger.error('Erro ao enviar webhook', { error: err.message });
        return NextResponse.json(
            {
                message: "Failed to send webhook",
                error: err.message,
                support: '@known.js'
            },
            { status: 500 }
        );
    }
}
