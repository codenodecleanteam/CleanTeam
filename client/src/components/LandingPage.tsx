import { useTranslation } from 'react-i18next';
import Header from './Header';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

interface LandingPageProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

export default function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  const { t } = useTranslation();

  const benefits = [
    'No credit card required',
    '30-day free trial',
    'Cancel anytime',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onLogin={onLogin} onSignup={onSignup} />
      
      <HeroSection onStartTrial={onSignup} />
      
      <FeaturesSection />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to streamline your cleaning business?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join hundreds of cleaning agencies in NYC using CleanTeams to manage their teams efficiently.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            className="text-base"
            data-testid="button-footer-cta"
          >
            <Link href="/signup" onClick={onSignup}>
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CleanTeams - Smart Scheduling for Cleaning Agencies</p>
          <p className="mt-2">Made for NYC cleaning agencies</p>
        </div>
      </footer>
    </div>
  );
}
