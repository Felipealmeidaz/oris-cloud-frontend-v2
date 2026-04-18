import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Loader2,
  LogOut,
  Monitor,
  RefreshCw,
  Shield,
  Smartphone,
  Sun,
  Moon,
  SunMoon,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GoogleIcon, GitHubIcon } from '@/components/icons';
import {
  type UserSession,
  deleteAccount,
  formatDate,
  listSessions,
  parseUserAgent,
  revokeOtherSessions,
  revokeSession,
  switchAccount,
  updateProfile,
} from '@/lib/account';

interface SettingsTabProps {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string | null;
    emailVerified?: boolean;
  } | null;
  currentSessionToken?: string;
}

type ThemePreference = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'oris-theme-preference';

/**
 * Settings tab do Dashboard - 5 seções:
 * Perfil | Conta | Sessões | Preferências | Zona de Perigo
 */
export default function SettingsTab({ user, currentSessionToken }: SettingsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ProfileSection user={user} />
      <AccountSection user={user} />
      <SessionsSection currentSessionToken={currentSessionToken} />
      <PreferencesSection />
      <DangerZoneSection />
    </motion.div>
  );
}

// ============================================================
// Shared Card wrapper
// ============================================================

function SettingsCard({
  icon,
  title,
  description,
  children,
  tone = 'default',
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
}) {
  const borderClass =
    tone === 'danger' ? 'border-red-500/20' : 'border-white/[0.08]';
  return (
    <div
      className={`rounded-xl border ${borderClass} bg-white/[0.015] backdrop-blur-sm p-6`}
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            tone === 'danger'
              ? 'bg-red-500/10 text-red-400'
              : 'bg-white/5 text-foreground/80'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-foreground/50 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ============================================================
// 1. Profile (edit name)
// ============================================================

function ProfileSection({ user }: { user: SettingsTabProps['user'] }) {
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const hasChanges = name.trim() !== (user?.name || '').trim() && name.trim().length > 0;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard
      icon={<UserIcon size={18} />}
      title="Perfil"
      description="Informações que aparecem no seu perfil."
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-foreground/70 mb-2" htmlFor="settings-name">
            Nome
          </label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white placeholder:text-foreground/40 focus:outline-none focus:border-white/25 transition-colors"
            placeholder="Como devemos te chamar?"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/70 mb-2">Email</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02]">
            <span className="text-foreground/90 text-sm flex-1 truncate">
              {user?.email || '—'}
            </span>
            {user?.emailVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                <Check size={12} /> Verificado
              </span>
            )}
          </div>
          <p className="text-xs text-foreground/40 mt-1.5">
            Email não pode ser alterado (vinculado ao provedor OAuth)
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            size="sm"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Salvando…
              </>
            ) : saved ? (
              <>
                <Check size={14} />
                Salvo
              </>
            ) : (
              'Salvar alterações'
            )}
          </Button>
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================================
// 2. Account (provider + switch account)
// ============================================================

function AccountSection({ user }: { user: SettingsTabProps['user'] }) {
  const [switching, setSwitching] = useState(false);

  // Detecta provider pelo domínio do email (heurística simples)
  // Idealmente viria do backend (account.providerId), mas Better Auth não
  // expõe isso no session; fallback por email faz sentido.
  const isGoogleAccount = user?.email?.endsWith('@gmail.com') || user?.image?.includes('googleusercontent');
  const providerName = isGoogleAccount ? 'Google' : 'GitHub';
  const ProviderIcon = isGoogleAccount ? GoogleIcon : GitHubIcon;

  const handleSwitchAccount = async () => {
    setSwitching(true);
    try {
      await switchAccount();
    } catch {
      setSwitching(false);
    }
  };

  return (
    <SettingsCard
      icon={<Shield size={18} />}
      title="Conta conectada"
      description="Provedor usado para login e troca de conta."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 shrink-0">
              <ProviderIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{providerName}</p>
              <p className="text-xs text-foreground/50 truncate">{user?.email}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 shrink-0">
            <Check size={12} /> Conectado
          </span>
        </div>

        <div className="rounded-lg border border-white/[0.05] bg-black/20 p-4">
          <p className="text-sm font-medium text-white mb-1">Trocar de conta</p>
          <p className="text-xs text-foreground/50 mb-3">
            Desloga sua sessão atual e permite escolher outra conta Google na próxima tela de login.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchAccount}
            disabled={switching}
          >
            {switching ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Redirecionando…
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Trocar de conta
              </>
            )}
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================================
// 3. Sessions (list + revoke)
// ============================================================

function SessionsSection({ currentSessionToken }: { currentSessionToken?: string }) {
  const [sessions, setSessions] = useState<UserSession[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSessions();
      // Ordena: atual primeiro, depois mais recentes
      const sorted = [...data].sort((a, b) => {
        if (a.token === currentSessionToken) return -1;
        if (b.token === currentSessionToken) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      setSessions(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleRevoke = async (token: string) => {
    setRevoking(token);
    try {
      await revokeSession(token);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao revogar sessão');
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Deslogar de todos os outros dispositivos?')) return;
    setRevokingAll(true);
    try {
      await revokeOtherSessions();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao revogar sessões');
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessions = sessions?.filter((s) => s.token !== currentSessionToken) || [];

  return (
    <SettingsCard
      icon={<Monitor size={18} />}
      title="Sessões ativas"
      description="Dispositivos e navegadores com acesso à sua conta."
    >
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-foreground/60 py-4">
            <Loader2 size={14} className="animate-spin" />
            Carregando sessões…
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            {error}
          </div>
        )}

        {!loading && sessions && sessions.length === 0 && (
          <p className="text-sm text-foreground/60">Nenhuma sessão ativa.</p>
        )}

        {!loading &&
          sessions?.map((session) => {
            const isCurrent = session.token === currentSessionToken;
            const { browser, os } = parseUserAgent(session.userAgent);
            const isMobile =
              session.userAgent?.toLowerCase().includes('mobile') || false;
            const DeviceIcon = isMobile ? Smartphone : Monitor;
            return (
              <div
                key={session.id}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${
                  isCurrent
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 shrink-0 mt-0.5">
                    <DeviceIcon size={16} className="text-foreground/70" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white">
                        {browser}
                        {os && ` · ${os}`}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                          Esta sessão
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {session.ipAddress || 'IP desconhecido'}
                      {' · '}
                      Última atividade: {formatDate(session.updatedAt)}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => handleRevoke(session.token)}
                    disabled={revoking === session.token}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-white/10 text-xs text-foreground/70 hover:text-white hover:border-white/25 transition-colors disabled:opacity-60"
                    aria-label="Encerrar sessão"
                  >
                    {revoking === session.token ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <X size={12} />
                    )}
                    Encerrar
                  </button>
                )}
              </div>
            );
          })}

        {otherSessions.length > 0 && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeAll}
              disabled={revokingAll}
            >
              {revokingAll ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Encerrando…
                </>
              ) : (
                <>
                  <LogOut size={14} />
                  Encerrar outras sessões ({otherSessions.length})
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}

// ============================================================
// 4. Preferences (theme toggle)
// ============================================================

function PreferencesSection() {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    // Aplica a preferência no document
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const options: Array<{ value: ThemePreference; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Claro', icon: <Sun size={14} /> },
    { value: 'dark', label: 'Escuro', icon: <Moon size={14} /> },
    { value: 'system', label: 'Sistema', icon: <SunMoon size={14} /> },
  ];

  return (
    <SettingsCard
      icon={<SunMoon size={18} />}
      title="Preferências"
      description="Personalize a aparência do Oris Cloud."
    >
      <div>
        <p className="text-sm text-foreground/70 mb-3">Tema</p>
        <div className="inline-flex rounded-lg border border-white/10 bg-black/20 p-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                theme === opt.value
                  ? 'bg-white/10 text-white'
                  : 'text-foreground/60 hover:text-white/80'
              }`}
              aria-pressed={theme === opt.value}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-foreground/40 mt-2">
          A preferência fica salva neste navegador.
        </p>
      </div>
    </SettingsCard>
  );
}

// ============================================================
// 5. Danger Zone (delete account)
// ============================================================

function DangerZoneSection() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === 'DELETAR';

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      window.location.href = '/';
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Backend não habilitou deleteUser - mensagem amigável
      if (msg.includes('400')) {
        setError(
          'Deleção de conta não está habilitada no servidor. Contate suporte@oriscloud.com.br para excluir sua conta.',
        );
      } else {
        setError(msg);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SettingsCard
      icon={<Trash2 size={18} />}
      title="Zona de perigo"
      description="Ações irreversíveis. Tenha certeza antes de prosseguir."
      tone="danger"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-white mb-1">Deletar conta</p>
          <p className="text-xs text-foreground/50 max-w-md">
            Remove permanentemente seu usuário, sessões e histórico. Esta ação não pode ser desfeita.
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <Trash2 size={14} />
          Deletar conta
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Deletar conta</DialogTitle>
            <DialogDescription>
              Esta ação é <strong>irreversível</strong>. Seu usuário, sessões e dados associados serão excluídos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block text-sm text-foreground/80" htmlFor="delete-confirm">
              Digite <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">DELETAR</code> para confirmar:
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-red-500/30 bg-black/30 text-white placeholder:text-foreground/40 focus:outline-none focus:border-red-500/60"
              placeholder="DELETAR"
              autoComplete="off"
            />
            {error && (
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                setConfirmText('');
                setError(null);
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deletando…
                </>
              ) : (
                'Deletar conta permanentemente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsCard>
  );
}
