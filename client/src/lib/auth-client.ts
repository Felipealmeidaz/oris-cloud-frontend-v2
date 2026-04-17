import { createAuthClient } from 'better-auth/react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const authClient = createAuthClient({
  baseURL: apiUrl,
  credentials: 'include',
});

export const { signIn, signOut, signUp, useSession } = authClient;
