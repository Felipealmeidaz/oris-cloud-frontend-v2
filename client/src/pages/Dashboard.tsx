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
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

/**
 * Dashboard premium CEO com histórico de compras e configurações
 */
export function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isLoading, isLoggedIn, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');

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
                  onClick={() => setActiveTab('settings')}
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

          {/* Tabs */}
          <motion.div variants={itemVariants} className="flex gap-2 mb-8 border-b border-white/10">
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'purchases', label: 'Histórico de Compras', icon: CreditCard },
              { id: 'sessions', label: 'Sessões Ativas', icon: Clock },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
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

          {/* Overview Tab */}
          {activeTab === 'overview' && (
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
                    icon: Calendar,
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
          {activeTab === 'purchases' && (
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
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                      <CreditCard size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{purchase.plan}</p>
                      <p className="text-sm text-foreground/60">{purchase.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">R$ {purchase.price.toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        purchase.status === 'Ativo'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-foreground/60'
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
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
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                      {session.current ? (
                        <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                      ) : (
                        <Clock size={20} className="text-foreground/60" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{session.device}</p>
                      <p className="text-sm text-foreground/60">{session.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground/60">{session.lastActive}</p>
                    {session.current && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        Atual
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="space-y-4">
                {[
                  { icon: User, label: 'Perfil', description: 'Edite suas informações pessoais' },
                  {
                    icon: Bell,
                    label: 'Notificações',
                    description: 'Gerencie suas preferências de notificação',
                  },
                  {
                    icon: Shield,
                    label: 'Segurança',
                    description: 'Altere sua senha e configure 2FA',
                  },
                  {
                    icon: Download,
                    label: 'Dados',
                    description: 'Baixe seus dados pessoais',
                  },
                ].map((setting, idx) => {
                  const Icon = setting.icon;
                  return (
                    <motion.button
                      key={idx}
                      variants={itemVariants}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <Icon size={20} className="text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{setting.label}</p>
                          <p className="text-sm text-foreground/60">{setting.description}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-foreground/60" />
                    </motion.button>
                  );
                })}
              </div>

              {/* Danger Zone */}
              <motion.div
                variants={itemVariants}
                className="rounded-lg border border-red-500/20 bg-red-500/5 p-6"
              >
                <h4 className="font-bold text-red-400 mb-3">Zona de Perigo</h4>
                <p className="text-sm text-foreground/60 mb-4">
                  Deletar sua conta é uma ação permanente e não pode ser desfeita.
                </p>
                <Button variant="destructive" className="w-full">
                  Deletar Conta
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

// Import Calendar icon
import { Calendar } from 'lucide-react';
