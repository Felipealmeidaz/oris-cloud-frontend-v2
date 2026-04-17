import { useSession, signOut } from '@/lib/auth-client';

export function useAuth() {
  const { data: session, isPending: isLoading } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return {
    user: session?.user || null,
    session: session?.session || null,
    isLoading,
    isAuthenticated: !!session?.user,
    signOut: handleSignOut,
  };
}
