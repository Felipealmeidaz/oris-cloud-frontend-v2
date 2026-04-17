import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GoogleIcon, GitHubIcon, LoadingSpinner } from '@/components/icons';

type Provider = 'google' | 'github';

interface LoginButtonProps {
  provider: Provider;
  className?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface ProviderStyle {
  label: string;
  icon: ReactNode;
  className: string;
  spinnerClassName: string;
}

const providerStyles: Record<Provider, ProviderStyle> = {
  google: {
    label: 'Continuar com Google',
    icon: <GoogleIcon className="w-5 h-5" />,
    // Botão branco oficial conforme Google Brand Guidelines
    className:
      'bg-white text-[#1f1f1f] hover:bg-gray-100 shadow-sm ring-1 ring-black/5',
    spinnerClassName: 'text-[#1f1f1f]',
  },
  github: {
    label: 'Continuar com GitHub',
    icon: <GitHubIcon className="w-5 h-5" />,
    // Cor oficial do GitHub (#24292e é o header do github.com)
    className: 'bg-[#24292e] text-white hover:bg-[#1a1e22] shadow-sm',
    spinnerClassName: 'text-white',
  },
};

export function LoginButton({ provider, className }: LoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const style = providerStyles[provider];

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // Bypass Better Auth SDK - chama o backend direto e faz redirect hard
      // (evita CORS issues com a SDK tentando fetch AJAX na URL do provider)
      const response = await fetch(`${API_URL}/api/auth/sign-in/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider,
          callbackURL: `${window.location.origin}/dashboard`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Backend did not return OAuth URL');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(`Failed to sign in with ${provider}:`, err);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
      aria-label={style.label}
      className={cn(
        'w-full h-12 inline-flex items-center justify-center gap-3',
        'rounded-md font-medium text-base',
        'transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-white/40',
        style.className,
        className,
      )}
    >
      {loading ? (
        <>
          <LoadingSpinner className={cn('w-5 h-5', style.spinnerClassName)} />
          <span>Redirecionando…</span>
        </>
      ) : (
        <>
          {style.icon}
          <span>{style.label}</span>
        </>
      )}
    </button>
  );
}
