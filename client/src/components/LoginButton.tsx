import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface LoginButtonProps {
  provider: 'google' | 'github';
  className?: string;
}

export function LoginButton({ provider, className }: LoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn.social({
        provider,
        callbackURL: '/',
      });
      // Better Auth SDK should redirect the browser automatically. If for any
      // reason it doesn't (older SDK version, bug, fetch fallback), we fallback
      // to manual navigation using the URL returned by the backend.
      if (result?.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error(`Failed to sign in with ${provider}:`, err);
      setLoading(false);
    }
  };

  const providerConfig = {
    google: {
      label: 'Continue with Google',
      icon: '🔵',
    },
    github: {
      label: 'Continue with GitHub',
      icon: '⚫',
    },
  };

  const config = providerConfig[provider];

  return (
    <Button
      onClick={handleSignIn}
      variant="outline"
      className={className}
      type="button"
      disabled={loading}
    >
      <span className="mr-2">{config.icon}</span>
      {loading ? 'Redirecting...' : config.label}
    </Button>
  );
}
