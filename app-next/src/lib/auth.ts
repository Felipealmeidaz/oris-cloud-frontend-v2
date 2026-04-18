import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "./emails";
import { logger } from "./logger";

/**
 * Configuração do better-auth para a Oris Cloud.
 *
 * Fluxo de email e senha:
 *  - Cadastro: better-auth cria user + dispara `sendVerificationEmail` automaticamente
 *    (sendOnSignUp: true). Usuário confirma clicando no link mágico.
 *  - Login: bloqueado se emailVerified=false (requireEmailVerification: true).
 *  - Reset de senha: POST /request-password-reset → better-auth gera token e chama
 *    `sendResetPassword`. Usuário clica no link → landing em /reset-password?token=...
 *    → submit chama `authClient.resetPassword({ newPassword, token })`.
 *
 * Os 6 endpoints custom antigos (/api/email/*, /api/password/*) foram removidos —
 * o better-auth cuida de tudo nativamente via /api/auth/*.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    /**
     * Enviado quando usuário solicita reset de senha via authClient.forgetPassword.
     * `url` já contém o token e aponta pra `redirectTo` (/reset-password?token=...).
     * Aguardamos a promise pra que erros do Resend propaguem pro better-auth e
     * consequentemente pro client (evita silent fail quando env var tá errada).
     */
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendPasswordResetEmail({
          to: user.email,
          url,
          name: user.name,
        });
      } catch (err) {
        logger.error("Falha no callback sendResetPassword", { err, email: user.email });
        throw err;
      }
    },
  },
  emailVerification: {
    /**
     * Enviado automaticamente no signUp (sendOnSignUp) e quando
     * authClient.sendVerificationEmail() é chamado.
     * `url` aponta pra rota built-in /api/auth/verify-email?token=...&callbackURL=/
     * que valida o token e redireciona pra home após verificação.
     */
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendVerificationEmail({
          to: user.email,
          url,
          name: user.name,
        });
      } catch (err) {
        logger.error("Falha no callback sendVerificationEmail", { err, email: user.email });
        throw err;
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
  },
  // Proteção CSRF habilitada
  advanced: {
    cookiePrefix: "oris",
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
});
