import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, RateLimitConfig } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_ROLE_ID = process.env.DISCORD_ROLE_ID;
const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;

const roleGiveSchema = z.object({
  discordId: z.string().min(1, 'Discord ID é obrigatório'),
  secret: z.string().optional(), // Para chamadas internas do servidor
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(req, RateLimitConfig.API);
    if (rateLimitResult) return rateLimitResult;

    const body = await req.json();
    const validation = roleGiveSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Dados inválidos para dar role', { errors: validation.error.format() });
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    const { discordId, secret } = validation.data;

    // Verificar se é chamada interna do servidor (serverless)
    const isInternalCall = secret === INTERNAL_SECRET;

    // Se não é chamada interna, exigir autenticação
    if (!isInternalCall) {
      const user = await requireAuth();
      if (user instanceof NextResponse) return user;
      
      logger.warn('Tentativa de dar role sem secret interno', { userId: user.id });
      return NextResponse.json(
        { error: 'Operação não autorizada. Use a função interna do servidor.' },
        { status: 403 }
      );
    }

    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !DISCORD_ROLE_ID) {
      logger.error('Configurações do Discord não encontradas');
      return NextResponse.json(
        { error: 'Configurações do Discord não encontradas' },
        { status: 500 }
      );
    }

    // Dar role no Discord
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}/roles/${DISCORD_ROLE_ID}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Erro ao dar role no Discord', { error: errorText });
      
      // Se o usuário não está no servidor, retornar sucesso mesmo assim
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          message: 'Usuário não está no servidor Discord'
        });
      }

      return NextResponse.json(
        { error: 'Erro ao dar role no Discord' },
        { status: response.status }
      );
    }

    logger.info('Role do Discord atribuída com sucesso', { discordId });
    return NextResponse.json({
      success: true,
      message: 'Role atribuída com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao dar role no Discord', { error });
    return NextResponse.json(
      { error: 'Erro ao dar role no Discord' },
      { status: 500 }
    );
  }
}
