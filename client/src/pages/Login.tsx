import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { LoginButton } from '@/components/LoginButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function Login() {
  const [, navigate] = useLocation();
  const { isLoggedIn } = useAuthContext();

  // Redirecionar se já logado: vai direto para o dashboard
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.4 + i * 0.1,
        duration: 0.3,
      },
    }),
    hover: { scale: 1.02 },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Fundo com gradiente radial gaming */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 1px, rgba(255, 255, 255, 0.02) 1px),
              linear-gradient(transparent 1px, rgba(255, 255, 255, 0.02) 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Container principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Logo com animação */}
        <motion.div
          variants={logoVariants}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310419663032706170/WMz8HoFpHBf5sKDLPKcovU/m51284p_3f1a6df2.png"
            alt="Oris Cloud"
            className="h-10 w-10"
          />
          <span className="text-2xl font-bold text-white tracking-wider">ORIS</span>
        </motion.div>

        {/* Card glassmorphic */}
        <motion.div
          variants={itemVariants}
          className="border border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/5 p-8 md:p-10"
        >
          {/* Headline gamer */}
          <div className="text-center mb-8">
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight"
            >
              Bem-vindo ao seu arsenal
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-sm md:text-base text-foreground/70"
            >
              Entre na sua máquina e comece a jogar
            </motion.p>
          </div>

          {/* Divisor sutil */}
          <motion.div
            variants={itemVariants}
            className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"
          />

          {/* Botões OAuth com stagger */}
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              custom={0}
              variants={buttonVariants}
              whileHover="hover"
            >
              <LoginButton provider="google" className="w-full h-12 text-base" />
            </motion.div>
            <motion.div
              custom={1}
              variants={buttonVariants}
              whileHover="hover"
            >
              <LoginButton provider="github" className="w-full h-12 text-base" />
            </motion.div>
          </motion.div>

          {/* Termos de serviço */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-6 border-t border-white/5"
          >
            <p className="text-center text-xs md:text-sm text-foreground/60">
              Ao fazer login, você concorda com nossos{' '}
              <a href="#" className="text-blue-400/80 hover:text-blue-300 transition-colors">
                Termos de Serviço
              </a>
            </p>
          </motion.div>
        </motion.div>

        {/* Link voltar para home */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground/80 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para home</span>
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
