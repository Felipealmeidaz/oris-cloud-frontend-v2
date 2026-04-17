import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface LoginButtonProps {
  provider: 'google' | 'github';
  className?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function LoginButton({ provider, className }: LoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // Bypass Better Auth SDK. The SDK was trying to fetch the provider's
      // authorize URL (GitHub/Google) as AJAX, which returns 404 due to CORS.
      // We call the backend directly and redirect using window.location.
      const response = await fetch(`${API_URL}/api/auth/sign-in/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider,
          callbackURL: `${window.location.origin}/`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Backend did not return OAuth URL');
      }

      // Hard redirect - browser navigates away, no CORS issues.
      window.location.href = data.url;
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
