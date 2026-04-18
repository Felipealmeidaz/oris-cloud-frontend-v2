import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from '@/lib/auth-client';

interface AuthContextType {
  user: any | null;
  sessionToken: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, isPending: isLoading } = useSession();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const value: AuthContextType = {
    user: session?.user || null,
    sessionToken: (session as any)?.session?.token || null,
    isLoading,
    isLoggedIn: !!session?.user,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  }
  return context;
};
