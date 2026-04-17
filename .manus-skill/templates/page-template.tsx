// @ts-nocheck — arquivo de referencia, nao compilado
/**
 * Template canônico para uma nova página do Oris Cloud.
 * Copie este arquivo, renomeie, e adapte o conteúdo.
 *
 * CHECKLIST:
 * - [ ] Rota adicionada em `client/src/App.tsx`
 * - [ ] Proteção de rota se necessário (redirect /login)
 * - [ ] Header + Footer se for página do site (não usar em /login)
 * - [ ] Animações framer-motion nas seções principais
 * - [ ] Responsivo (testar < 640px, 768px, 1024px)
 * - [ ] Textos em pt-BR
 * - [ ] Tipos TypeScript explícitos
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export function NomeDaPagina() {
  const [, navigate] = useLocation();
  const { isLoading, isLoggedIn } = useAuthContext();

  // Proteção de rota: descomente se a página exigir auth
  // useEffect(() => {
  //   if (!isLoading && !isLoggedIn) {
  //     navigate('/login');
  //   }
  // }, [isLoading, isLoggedIn, navigate]);

  // Loading state enquanto valida sessão
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-28 pb-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Título da Página
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed mb-8">
            Descrição introdutória da página.
          </p>

          {/* Conteúdo principal */}
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
