import { NextRequest, NextResponse } from 'next/server';

/**
 * ⚠️ ENDPOINT DESABILITADO
 * Operações de estoque foram movidas para funções internas server-side
 * Use: src/lib/internal/admin-operations.ts
 */
export async function POST(req: NextRequest) {
    return NextResponse.json(
        { error: 'Endpoint não disponível' },
        { status: 404 }
    );
}
