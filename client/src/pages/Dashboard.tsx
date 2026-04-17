import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Construction, Gauge, Server, History, CreditCard, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Placeholder do Dashboard. Substituido posteriormente pelo
 * painel completo (maquinas virtuais, perfil, historico, plano).
 */
export function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isLoading, isLoggedIn } = useAuthContext();

  // Protecao de rota: se nao logado, manda pra /login
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoading, isLoggedIn, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // redirect em andamento
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const avatarInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  const upcomingFeatures = [
    {
      icon: Server,
      title: 'Máquinas Virtuais',
      description: 'Inicie, pause e gerencie suas instâncias AWS com 1 clique.',
    },
    {
      icon: Gauge,
      title: 'Monitoramento em Tempo Real',
      description: 'Acompanhe uso de CPU, GPU, RAM e latência de cada sessão.',
    },
    {
      icon: History,
      title: 'Histórico de Sessões',
      description: 'Veja todas as suas sessões passadas, tempo jogado e jogos.',
    },
    {
      icon: CreditCard,
      title: 'Gestão de Plano',
      description: 'Veja seu plano ativo, consumo e faça upgrade quando quiser.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-28 pb-16">
        {/* Hero do Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-5 mb-12">
            {user?.image ? (
              <img
                src={user.image}
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/10"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white/10">
                {avatarInitial}
              </div>
            )}
            <div>
              <p className="text-sm text-foreground/60 uppercase tracking-wider">
                Bem-vindo(a) de volta
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {displayName}
              </h1>
              {user?.email && (
                <p className="text-sm text-foreground/50 mt-1">{user.email}</p>
              )}
            </div>
          </div>

          {/* Banner "Em Construção" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-8 md:p-12 mb-12"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="h-14 w-14 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Construction className="h-7 w-7 text-amber-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Dashboard em Construção
                </h2>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  Estamos trabalhando na sua área pessoal. Em breve você poderá
                  gerenciar máquinas virtuais, monitorar performance em tempo
                  real, ver histórico de sessões e muito mais. Por enquanto,
                  sua conta já está cadastrada e segura.
                </p>
                <p className="text-sm text-foreground/50">
                  Para suporte ou solicitações urgentes, entre em contato pelo
                  nosso{' '}
                  <a
                    href="https://discord.gg/3pT7NJGZ97"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
                  >
                    Discord
                  </a>
                  .
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features que estão por vir */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-6">
              O que está por vir
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingFeatures.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                  className="group rounded-lg border border-border bg-card/40 p-5 hover:bg-card/70 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                      <feature.icon className="h-5 w-5 text-foreground/70 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-foreground/60 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Card de detalhes da conta */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-lg border border-border bg-card/40 p-6 mb-8"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Detalhes da Conta
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-foreground/50 mb-1">Nome</dt>
                <dd className="text-white font-medium">{displayName}</dd>
              </div>
              {user?.email && (
                <div>
                  <dt className="text-foreground/50 mb-1">Email</dt>
                  <dd className="text-white font-medium break-all">
                    {user.email}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-foreground/50 mb-1">ID da Conta</dt>
                <dd className="text-white font-mono text-xs break-all">
                  {user?.id || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/50 mb-1">Status</dt>
                <dd>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Ativo
                  </span>
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* Voltar pra home */}
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para a landing page
            </Link>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
