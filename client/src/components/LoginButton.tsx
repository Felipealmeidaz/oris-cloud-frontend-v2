import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

interface LoginButtonProps {
  provider: 'google' | 'github';
  className?: string;
}

export function LoginButton({ provider, className }: LoginButtonProps) {
  const handleSignIn = async () => {
    await signIn.social({
      provider,
      callbackURL: '/',
    });
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
    >
      <span className="mr-2">{config.icon}</span>
      {config.label}
    </Button>
  );
}
