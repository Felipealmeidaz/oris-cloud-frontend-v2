import { NextRequest, NextResponse } from "next/server";

/**
 * ⚠️ ENDPOINT DESABILITADO POR SEGURANÇA
 * Este endpoint permitia marcar qualquer email como verificado sem autenticação.
 * A verificação de email é feita automaticamente pelo better-auth após validar o código.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Endpoint não disponível" },
    { status: 404 }
  );
}
