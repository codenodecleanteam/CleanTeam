import Header from '../Header';
import '@/lib/i18n';

export default function HeaderExample() {
  return (
    <Header 
      onLogin={() => console.log('Login clicked')}
      onSignup={() => console.log('Signup clicked')}
    />
  );
}
