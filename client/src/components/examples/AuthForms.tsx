import { LoginForm } from '../AuthForms';
import '@/lib/i18n';

export default function AuthFormsExample() {
  return (
    <LoginForm 
      onSubmit={(email, password) => console.log('Login:', email, password)}
      onSwitchToSignup={() => console.log('Switch to signup')}
    />
  );
}
