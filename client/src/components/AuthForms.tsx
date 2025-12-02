import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void> | void;
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onSubmit, onSwitchToSignup }: LoginFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      setIsSubmitting(true);
      await onSubmit(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: t('auth.login'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">CleanTeams</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.login')}</CardTitle>
            <CardDescription>{t('dashboard.welcome')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Button variant="ghost" size="sm" className="px-0 h-auto text-primary underline-offset-4 hover:underline" data-testid="link-forgot-password">
                    {t('auth.forgotPassword')}
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-login">
                {t('auth.login')}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{t('auth.noAccount')} </span>
              <Button variant="ghost" className="px-1 h-auto text-primary underline-offset-4 hover:underline" onClick={onSwitchToSignup} data-testid="link-signup">
                {t('auth.signup')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SignupFormProps {
  onSubmit?: (data: { name: string; email: string; password: string; companyName: string }) => Promise<{ requiresEmailConfirmation: boolean } | void>;
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSubmit, onSwitchToLogin }: SignupFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      setIsSubmitting(true);
      const result = await onSubmit({ name, email, password, companyName });
      if (result && typeof result === 'object' && 'requiresEmailConfirmation' in result) {
        if (result.requiresEmailConfirmation) {
          toast({
            title: t('auth.signup'),
            description: t('auth.checkEmail'),
          });
        } else {
          toast({
            title: t('auth.signup'),
            description: t('auth.signupSuccess'),
          });
        }
      } else {
        toast({
          title: t('auth.signup'),
          description: t('auth.signupSuccess'),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: t('auth.signup'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">CleanTeams</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.signup')}</CardTitle>
            <CardDescription>{t('auth.trialNote')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">{t('auth.companyName')}</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Sparkle Clean NYC"
                  required
                  data-testid="input-company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Silva"
                  required
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">{t('auth.email')}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  data-testid="input-signup-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">{t('auth.password')}</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-signup-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-signup">
                {t('auth.signup')}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{t('auth.hasAccount')} </span>
              <Button variant="ghost" className="px-1 h-auto text-primary underline-offset-4 hover:underline" onClick={onSwitchToLogin} data-testid="link-login">
                {t('auth.login')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
