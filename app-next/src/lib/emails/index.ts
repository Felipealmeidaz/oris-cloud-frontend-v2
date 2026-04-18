/**
 * Barrel de emails transacionais da Oris Cloud.
 *
 * Todos os emails são renderizados com table-based HTML + CSS inline
 * (ver _layout.ts) e enviados via Resend com template visual consistente.
 */

export { sendVerificationEmail } from "./send-verification";
export { sendPasswordResetEmail } from "./send-password-reset";
export { renderEmailLayout } from "./_layout";
