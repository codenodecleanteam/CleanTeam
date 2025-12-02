import HeroSection from '../HeroSection';
import '@/lib/i18n';

export default function HeroSectionExample() {
  return <HeroSection onStartTrial={() => console.log('Start trial clicked')} />;
}
