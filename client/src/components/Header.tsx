import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
}

export default function Header({ isLoggedIn, onLogin, onSignup, onLogout }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">CleanTeams</span>
        </div>

        <div className="flex items-center gap-2">
          {!isLoggedIn && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex"
                data-testid="link-features"
              >
                {t('nav.features')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogin}
                data-testid="button-login"
              >
                {t('nav.login')}
              </Button>
              <Button 
                size="sm" 
                onClick={onSignup}
                data-testid="button-signup"
              >
                {t('nav.signup')}
              </Button>
            </>
          )}
          {isLoggedIn && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              data-testid="button-logout"
            >
              {t('nav.logout')}
            </Button>
          )}
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
