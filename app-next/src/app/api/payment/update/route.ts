import { NextRequest, NextResponse } from 'next/server';

/**
 * ⚠️ ENDPOINT DESABILITADO
 * Atualizações de pagamento foram movidas para funções internas server-side
 * Use: src/lib/internal/admin-operations.ts
 */
export async function POST(req: NextRequest) {
    return NextResponse.json(
        { error: 'Endpoint não disponível' },
        { status: 404 }
    );
}