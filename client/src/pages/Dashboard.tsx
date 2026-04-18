import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  LogOut,
  Settings,
  CreditCard,
  User,
  Zap,
  Clock,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type InternalTab = 'overview' | 'purchases' | 'sessions' | 'settings';

const VALID_TABS: readonly InternalTab[] = [
  'overview',
  'purchases',
  'sessions',
  'settings',
] as const;

function isValidTab(value: string): value is InternalTab {
  return (VALID_TABS as readonly string[]).includes(value);
}

/**
 * Dashboard privado — só acessível autenticado.
 * Abas internas (Visão Geral, Histórico, Sessões, Configurações) sincronizadas
 * com o hash da URL (#overview, #purchases, #sessions, #settings).
 */
export function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isLoading, isLoggedIn, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<InternalTab>('overview');
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Sincroniza aba ativa com hash da URL (permite deep-link /dashboard#settings)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (isValidTab(hash)) {
        setActiveTab(hash);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleTabChange = (tabId: InternalTab) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  // Proteção de rota: não logado → /login
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoading, isLoggedIn, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto mb-6" />
          <p className="text-foreground/60">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const avatarInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const tabs: Array<{ id: InternalTab; label: string; icon: typeof TrendingUp }> = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'purchases', label: 'Histórico de Compras', icon: CreditCard },
    { id: 'sessions', label: 'Sessões Ativas', icon: Clock },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Header do Dashboard — perfil do usuário */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/10"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center text-4xl font-bold text-white ring-4 ring-white/10">
                    {avatarInitial}
                  </div>
                )}
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-widest mb-2">
                    Bem-vindo de volta
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {displayName}
                  </h1>
                  {user?.email && (
                    <p className="text-sm text-foreground/50">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => handleTabChange('settings')}
                >
                  <Settings size={18} />
                  Configurações
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Sair
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Abas internas do dashboard */}
          <motion.div
            variants={itemVariants}
            className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-white'
                      : 'border-transparent text-foreground/60 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </motion.div>

          {/* Aba: Visão Geral */}
          {activeTab === 'overview' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Plano Ativo',
                    value: 'Sem plano',
                    icon: Zap,
                    color: 'from-cyan-500 to-blue-600',
                  },
                  {
                    label: 'Próximo Pagamento',
                    value: 'N/A',
                    icon: Clock,
                    color: 'from-green-500 to-emerald-600',
                  },
                  {
                    label: 'Horas Usadas',
                    value: '0h',
                    icon: Clock,
                    color: 'from-purple-500 to-pink-600',
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className={`rounded-xl bg-gradient-to-br ${stat.color} p-6 text-white`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-80 mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                        <Icon size={32} className="opacity-50" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div variants={itemVariants}>
                <Button
                  onClick={() => setShowPlanModal(true)}
                  className="w-full gap-2 py-6"
                >
                  <Zap size={18} />
                  Ver Seu Plano Atual
                </Button>
              </motion.div>

              <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Seu Plano Atual</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-foreground/60 mb-2">Status</p>
                        <p className="text-3xl font-bold text-white mb-4">Sem plano ativo</p>
                        <p className="text-foreground/60 mb-6">Escolha um plano para começar</p>
                        <Button
                          className="w-full gap-2"
                          onClick={() => {
                            setShowPlanModal(false);
                            navigate('/#plans');
                          }}
                        >
                          <Zap size={18} />
                          Escolher Plano
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-foreground/60 uppercase tracking-widest">
                          Recursos disponíveis
                        </p>
                        {[
                          'Acesso a plataforma',
                          'Suporte por email',
                          'Documentação completa',
                          'Comunidade Discord',
                        ].map((feature, idx) => (
                          <p key={idx} className="text-foreground/80">
                            ✓ {feature}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

          {/* Aba: Histórico de Compras */}
          {activeTab === 'purchases' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-white mb-6">Histórico de Compras</h3>
              <motion.div
                variants={itemVariants}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center"
              >
                <p className="text-foreground/60">Nenhuma compra registrada ainda</p>
                <p className="text-sm text-foreground/40 mt-2">
                  Escolha um plano para começar sua jornada na Oris Cloud
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Aba: Sessões Ativas */}
          {activeTab === 'sessions' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-white mb-6">Sessões Ativas</h3>
              <motion.div
                variants={itemVariants}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center"
              >
                <p className="text-foreground/60">Nenhuma sessão ativa no momento</p>
                <p className="text-sm text-foreground/40 mt-2">
                  Suas sessões aparecerão aqui quando você ativar um plano
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Aba: Configurações */}
          {activeTab === 'settings' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Configurações</h3>

              {/* Perfil */}
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <User size={20} className="text-cyan-400" />
                  <h4 className="text-lg font-semibold text-white">Perfil</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-foreground/60 mb-2">Nome</label>
                    <input
                      type="text"
                      value={displayName}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/60 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-70"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Notificações */}
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8"
              >
                <h4 className="text-lg font-semibold text-white mb-4">Notificações</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Notificações de pagamento', enabled: true },
                    { label: 'Atualizações de plano', enabled: true },
                    { label: 'Alertas de segurança', enabled: true },
                  ].map((notif, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={notif.enabled}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-foreground/80">{notif.label}</span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Segurança */}
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={20} className="text-cyan-400" />
                  <h4 className="text-lg font-semibold text-white">Segurança</h4>
                </div>
                <Button variant="outline" className="gap-2">
                  <Shield size={18} />
                  Alterar Senha
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
