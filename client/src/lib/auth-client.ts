import { createAuthClient } from 'better-auth/react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const authClient = createAuthClient({
  baseURL: apiUrl,
  // Better Auth client automatically includes credentials for cross-origin
  // requests when needed. Passing `credentials` here is not a valid option.
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signOut, signUp, useSession } = authClient;
