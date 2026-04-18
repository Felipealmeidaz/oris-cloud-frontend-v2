import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  Monitor,
  Server,
  Settings as SettingsIcon,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import SettingsTab from '@/components/dashboard/SettingsTab';

type DashboardTab = 'overview' | 'machines' | 'history' | 'settings';

const VALID_TABS: readonly DashboardTab[] = ['overview', 'machines', 'history', 'settings'] as const;

function isValidTab(value: string): value is DashboardTab {
  return (VALID_TABS as readonly string[]).includes(value);
}

/**
 * Dashboard privado. Sóbrio, dark, focado no usuário autenticado.
 * Tabs sincronizam com hash da URL: #overview, #machines, #history, #settings.
 */
export function Dashboard() {
  const [, navigate] = useLocation();
  const { user, sessionToken, isLoading, isLoggedIn } = useAuthContext();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Sincroniza hash → tab ativa
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (isValidTab(hash)) setActiveTab(hash);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Guard: não logado → /login
  useEffect(() => {
    if (!isLoading && !isLoggedIn) navigate('/login');
  }, [isLoading, isLoggedIn, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-white/15 border-t-white animate-spin mx-auto mb-4" />
          <p className="text-sm text-foreground/50">Carregando…</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const avatarInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  const tabs: Array<{ id: DashboardTab; label: string; icon: typeof TrendingUp }> = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'machines', label: 'Minhas Máquinas', icon: Server },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {/* ============================ */}
          {/* Header do usuário            */}
          {/* ============================ */}
          <div className="flex items-start gap-5 mb-10">
            <UserAvatar src={user?.image} initial={avatarInitial} name={displayName} />
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40 mb-1">
                Bem-vindo de volta
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1.5 truncate">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {user?.email && (
                  <span className="text-sm text-foreground/60">{user.email}</span>
                )}
                {user?.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400/90">
                    <CheckCircle2 size={12} />
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ============================ */}
          {/* Tab bar                      */}
          {/* ============================ */}
          <div className="border-b border-white/[0.08] mb-8 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                      isActive
                        ? 'border-white text-white'
                        : 'border-transparent text-foreground/50 hover:text-foreground/80'
                    }`}
                  >
                    <Icon size={15} className={isActive ? '' : 'opacity-70'} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================ */}
          {/* Tab content                  */}
          {/* ============================ */}
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'machines' && <MachinesTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'settings' && (
            <SettingsTab user={user} currentSessionToken={sessionToken || undefined} />
          )}
        </motion.div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

// ============================================================
// Avatar com fallback e referrerPolicy=no-referrer
// (resolve bug onde imagem do Google não carrega)
// ============================================================

function UserAvatar({
  src,
  initial,
  name,
}: {
  src?: string | null;
  initial: string;
  name: string;
}) {
  const [imgOk, setImgOk] = useState(true);

  if (src && imgOk) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgOk(false)}
        className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/10 shrink-0"
      />
    );
  }

  return (
    <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-semibold text-white shrink-0">
      {initial}
    </div>
  );
}

// ============================================================
// OVERVIEW TAB — plano atual + stats sóbrios
// ============================================================

function OverviewTab() {
  const [, navigate] = useLocation();

  const stats = [
    { label: 'Plano', value: 'Sem plano', icon: Zap, hint: 'Ainda não contratado' },
    { label: 'Próxima cobrança', value: '—', icon: CreditCard, hint: 'Contrate um plano' },
    { label: 'Horas neste mês', value: '0h', icon: Clock, hint: 'Nenhuma sessão' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Plano destaque */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-2">
              Plano atual
            </p>
            <h2 className="text-3xl font-bold text-white mb-2">Nenhum plano ativo</h2>
            <p className="text-foreground/60 max-w-lg">
              Escolha um plano pra começar a jogar com GPUs NVIDIA de última geração, direto da nuvem.
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0"
            onClick={() => navigate('/#plans')}
          >
            <Zap size={16} />
            Ver planos disponíveis
          </Button>
        </div>
      </div>

      {/* Stats minimalistas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.08] bg-white/[0.015] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className="text-foreground/50" />
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
                  {stat.label}
                </p>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-foreground/40">{stat.hint}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================
// MACHINES TAB — empty state
// ============================================================

function MachinesTab() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-12 text-center"
    >
      <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <Server size={22} className="text-foreground/60" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Nenhuma máquina provisionada
      </h3>
      <p className="text-sm text-foreground/60 max-w-md mx-auto mb-6">
        Suas máquinas virtuais aparecem aqui depois que você contrata um plano.
        Cada máquina vem com GPU NVIDIA, Windows pré-instalado e pronta pra rodar seus jogos.
      </p>
      <Button onClick={() => navigate('/#plans')}>
        <Zap size={14} />
        Ver planos disponíveis
      </Button>
    </motion.div>
  );
}

// ============================================================
// HISTORY TAB — empty state
// ============================================================

function HistoryTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-12 text-center"
    >
      <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <History size={22} className="text-foreground/60" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Sem histórico ainda</h3>
      <p className="text-sm text-foreground/60 max-w-md mx-auto">
        Suas compras, cobranças e sessões de jogo vão aparecer aqui depois que você
        começar a usar a Oris Cloud.
      </p>
    </motion.div>
  );
}
