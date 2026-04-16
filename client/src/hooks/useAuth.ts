import { useState, useEffect } from 'react';
import { User, getStoredUser, getStoredToken, setStoredToken, setStoredUser, clearAuth, isAuthenticated } from '@/lib/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar autenticação ao montar
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = getStoredUser();
      const token = getStoredToken();

      if (storedUser && token) {
        setUser(storedUser);
        setIsLoggedIn(true);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Processar callback do OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      try {
        const userData = JSON.parse(userParam);
        setStoredToken(token);
        setStoredUser(userData);
        setUser(userData);
        setIsLoggedIn(true);

        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Erro ao processar autenticação:', error);
      }
    }
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    setIsLoggedIn(false);
  };

  return {
    user,
    isLoading,
    isLoggedIn,
    logout,
  };
};
