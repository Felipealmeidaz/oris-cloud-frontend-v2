import { useLocation } from 'wouter';
import { LoginButton } from '@/components/LoginButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function Login() {
  const [, navigate] = useLocation();
  const { isLoggedIn } = useAuthContext();

  // Redirecionar se já logado
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Oris Cloud</h1>
            <p className="text-slate-400">Faça login para continuar</p>
          </div>

          <div className="space-y-4">
            <LoginButton provider="google" className="w-full h-12 text-base" />
            <LoginButton provider="github" className="w-full h-12 text-base" />
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-slate-400">
              Ao fazer login, você concorda com nossos{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Termos de Serviço
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-slate-400 hover:text-slate-300 transition">
            ← Voltar para home
          </a>
        </div>
      </div>
    </div>
  );
}
