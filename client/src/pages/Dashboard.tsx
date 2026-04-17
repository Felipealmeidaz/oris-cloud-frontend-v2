import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  LogOut,
  Settings,
  CreditCard,
  History,
  User,
  Zap,
  Clock,
  TrendingUp,
  ChevronRight,
  Bell,
  Shield,
  Download,
  MoreVertical,
  Home,
  Info,
  Tag,
  HelpCircle,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

/**
 * Dashboard com navegação real entre abas (Início, Sobre, Planos, FAQ)
 * e painéis internos (Visão Geral, Histórico, Sessões, Configurações)
 */
export function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isLoading, isLoggedIn, logout } = useAuthContext();
  const [activeMainTab, setActiveMainTab] = useState('home');
  const [activeInternalTab, setActiveInternalTab] = useState('overview');

  // Proteção de rota: se não logado, manda pra /login
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

  // Mock data para histórico de compras
  const purchaseHistory = [
    {
      id: 1,
      plan: 'Pro',
      price: 99.90,
      date: '2025-04-15',
      status: 'Ativo',
      duration: '1 mês',
    },
    {
      id: 2,
      plan: 'Básico',
      price: 49.90,
      date: '2025-03-15',
      status: 'Expirado',
      duration: '1 mês',
    },
    {
      id: 3,
      plan: 'Ultra',
      price: 199.90,
      date: '2025-02-15',
      status: 'Expirado',
      duration: '1 mês',
    },
  ];

  // Mock data para sessões
  const sessions = [
    {
      id: 1,
      device: 'MacBook Pro',
      location: 'São Paulo, BR',
      lastActive: '2 horas atrás',
      current: true,
    },
    {
      id: 2,
      device: 'iPhone 15',
      location: 'São Paulo, BR',
      lastActive: '1 dia atrás',
      current: false,
    },
    {
      id: 3,
      device: 'Windows PC',
      location: 'Rio de Janeiro, BR',
      lastActive: '5 dias atrás',
      current: false,
    },
  ];

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

  // Abas principais de navegação
  const mainTabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'about', label: 'Sobre', icon: Info },
    { id: 'plans', label: 'Planos', icon: Tag },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  // Abas internas do dashboard
  const internalTabs = [
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
          {/* Header do Dashboard */}
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
                  onClick={() => setActiveInternalTab('settings')}
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

          {/* Abas Principais de Navegação */}
          <motion.div variants={itemVariants} className="flex gap-2 mb-8 border-b border-white/10">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeMainTab === tab.id
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

          {/* Conteúdo das Abas Principais */}

          {/* Aba: Início */}
          {activeMainTab === 'home' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Abas Internas */}
              <motion.div variants={itemVariants} className="flex gap-2 mb-8 border-b border-white/10">
                {internalTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveInternalTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeInternalTab === tab.id
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

              {/* Overview Tab */}
              {activeInternalTab === 'overview' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: 'Plano Ativo',
                        value: 'Pro',
                        icon: Zap,
                        color: 'from-cyan-500 to-blue-600',
                      },
                      {
                        label: 'Próximo Pagamento',
                        value: '15 de Maio',
                        icon: Clock,
                        color: 'from-green-500 to-emerald-600',
                      },
                      {
                        label: 'Horas Usadas',
                        value: '42.5h',
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

                  {/* Plano Atual */}
                  <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8"
                  >
                    <h3 className="text-xl font-bold text-white mb-6">Seu Plano Atual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-foreground/60 mb-2">Plano</p>
                        <p className="text-3xl font-bold text-white mb-4">Pro</p>
                        <p className="text-foreground/60 mb-6">R$ 99,90/mês</p>
                        <Button className="w-full gap-2">
                          <Zap size={18} />
                          Fazer Upgrade para Ultra
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {[
                          '✓ Até 8 cores de CPU',
                          '✓ 16GB de RAM',
                          '✓ RTX 4070',
                          '✓ Suporte prioritário',
                          '✓ Armazenamento 500GB',
                        ].map((feature, idx) => (
                          <p key={idx} className="text-foreground/80">
                            {feature}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Purchases Tab */}
              {activeInternalTab === 'purchases' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-white mb-6">Histórico de Compras</h3>
                  {purchaseHistory.map((purchase, idx) => (
                    <motion.div
                      key={purchase.id}
                      variants={itemVariants}
                      className="rounded-lg border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <CreditCard size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{purchase.plan}</p>
                          <p className="text-sm text-foreground/60">{purchase.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">R$ {purchase.price.toFixed(2)}</p>
                        <p
                          className={`text-sm ${
                            purchase.status === 'Ativo'
                              ? 'text-green-400'
                              : 'text-foreground/60'
                          }`}
                        >
                          {purchase.status}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Sessions Tab */}
              {activeInternalTab === 'sessions' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-white mb-6">Sessões Ativas</h3>
                  {sessions.map((session, idx) => (
                    <motion.div
                      key={session.id}
                      variants={itemVariants}
                      className="rounded-lg border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{session.device}</p>
                            {session.current && (
                              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                Atual
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/60">{session.location}</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/60">{session.lastActive}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeInternalTab === 'settings' && (
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
                    <h4 className="text-lg font-semibold text-white mb-4">Perfil</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-foreground/60 mb-2">Nome</label>
                        <input
                          type="text"
                          value={displayName}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-foreground/60 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white"
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
                    <h4 className="text-lg font-semibold text-white mb-4">Segurança</h4>
                    <Button variant="outline" className="gap-2">
                      <Shield size={18} />
                      Alterar Senha
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Aba: Sobre */}
          {activeMainTab === 'about' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8"
              >
                <h2 className="text-3xl font-bold text-white mb-4">Sobre a Oris Cloud</h2>
                <p className="text-foreground/80 leading-relaxed mb-6">
                  Oris Cloud é uma plataforma brasileira de cloud gaming que democratiza o acesso a jogos de alta qualidade. 
                  Acreditamos que todo jogador merece a melhor experiência, independentemente do hardware que possui.
                </p>
                <h3 className="text-xl font-semibold text-white mb-3">Nossa Missão</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Oferecer acesso a jogos de alta performance sem a necessidade de investimento em hardware caro. 
                  Queremos que todos possam jogar seus títulos favoritos com a melhor qualidade possível.
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Aba: Planos */}
          {activeMainTab === 'plans' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Nossos Planos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Básico',
                    price: 'R$ 29,90',
                    features: ['Até 4 vCPUs', '16GB RAM', '256GB SSD', 'Resolução até 1080p'],
                  },
                  {
                    name: 'Pro',
                    price: 'R$ 69,90',
                    features: ['Até 8 vCPUs', '28GB RAM', '512GB SSD', 'Resolução até 1440p'],
                    highlighted: true,
                  },
                  {
                    name: 'Ultra',
                    price: 'R$ 129,90',
                    features: ['Até 16 vCPUs', '56GB RAM', '1TB SSD', 'Resolução 4K'],
                  },
                ].map((plan, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className={`rounded-xl border p-8 ${
                      plan.highlighted
                        ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/5'
                        : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-3xl font-bold text-cyan-400 mb-6">{plan.price}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-center gap-2 text-foreground/80">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full">Escolher Plano</Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Aba: FAQ */}
          {activeMainTab === 'faq' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Perguntas Frequentes</h2>
              <div className="space-y-4">
                {[
                  {
                    question: 'Como funciona o cloud gaming na Oris?',
                    answer:
                      'Você traz seus próprios jogos. Nós criamos um snapshot AWS da sua máquina virtual com full stock, permitindo que você tenha controle total.',
                  },
                  {
                    question: 'Que internet eu preciso?',
                    answer:
                      'Recomendamos uma conexão de pelo menos 25 Mbps para melhor experiência em 1080p. Para 4K, recomendamos 50+ Mbps.',
                  },
                  {
                    question: 'Quais dispositivos são suportados?',
                    answer:
                      'Você pode acessar via Parsec ou Moonlight em qualquer dispositivo: PC, Mac, Linux, iOS, Android e navegadores.',
                  },
                ].map((faq, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
                  >
                    <h4 className="text-lg font-semibold text-white mb-2">{faq.question}</h4>
                    <p className="text-foreground/80">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
