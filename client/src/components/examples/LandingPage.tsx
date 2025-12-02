import LandingPage from '../LandingPage';
import '@/lib/i18n';

export default function LandingPageExample() {
  return (
    <LandingPage 
      onLogin={() => console.log('Login clicked')}
      onSignup={() => console.log('Signup clicked')}
    />
  );
}
