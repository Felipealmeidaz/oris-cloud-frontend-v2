import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db.js';
import * as schema from '../db/schema.js';

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:8080';
const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
  throw new Error('BETTER_AUTH_SECRET is required');
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  secret,
  baseURL,
  trustedOrigins: [
    'https://oriscloud.com.br',
    'https://oris-cloud-frontend-v2-production.up.railway.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    defaultCookieAttributes: {
      // Force secure: true. Railway does not set NODE_ENV=production by default,
      // so relying on it breaks cookies in prod. Local dev uses HTTPS via tunnel
      // or proxy if needed, otherwise tests should hit /api/auth via localhost
      // which browsers treat as secure context.
      secure: true,
      sameSite: 'none',
      httpOnly: true,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
