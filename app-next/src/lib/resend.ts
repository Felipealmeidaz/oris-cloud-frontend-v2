/**
 * Resend Client - Lazy Singleton
 *
 * Evita instanciar `new Resend(...)` em tempo de carregamento de módulo,
 * que quebra o `next build` (fase de "Collecting page data") quando
 * RESEND_API_KEY não está presente no build environment.
 *
 * O client é criado na primeira chamada a getResend(), garantindo que
 * o erro de configuração só apareça em runtime quando algum handler
 * realmente tentar enviar email.
 */

import { Resend } from "resend";

let cachedClient: Resend | null = null;

export function getResend(): Resend {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY não está configurada. Defina a variável no .env.local ou no ambiente."
    );
  }

  cachedClient = new Resend(apiKey);
  return cachedClient;
}
