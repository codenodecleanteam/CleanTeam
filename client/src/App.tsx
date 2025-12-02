import { useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import LandingPage from '@/components/LandingPage';
import { LoginForm, SignupForm } from '@/components/AuthForms';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import CompanyAdminDashboard from '@/components/CompanyAdminDashboard';
import CleanerMobileView from '@/components/CleanerMobileView';
import NotFound from '@/pages/not-found';
import '@/lib/i18n';

// todo: remove mock functionality - user state simulation
type UserRole = 'superadmin' | 'owner' | 'cleaner' | null;

function App() {
  const [, setLocation] = useLocation();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', email);
    // todo: remove mock functionality - simulate different user roles based on email
    if (email.includes('admin')) {
      setUserRole('superadmin');
      setLocation('/admin');
    } else if (email.includes('cleaner')) {
      setUserRole('cleaner');
      setLocation('/cleaner');
    } else {
      setUserRole('owner');
      setLocation('/dashboard');
    }
  };

  const handleSignup = (data: { name: string; email: string; password: string; companyName: string }) => {
    console.log('Signup:', data);
    // todo: remove mock functionality
    setUserRole('owner');
    setLocation('/dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setLocation('/');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/">
            {userRole === null ? (
              showSignup ? (
                <SignupForm 
                  onSubmit={handleSignup}
                  onSwitchToLogin={() => setShowSignup(false)}
                />
              ) : (
                <LandingPage 
                  onLogin={() => setShowSignup(false)}
                  onSignup={() => setShowSignup(true)}
                />
              )
            ) : (
              userRole === 'superadmin' ? (
                <SuperAdminDashboard onLogout={handleLogout} />
              ) : userRole === 'cleaner' ? (
                <CleanerMobileView cleanerName="Maria Santos" onLogout={handleLogout} />
              ) : (
                <CompanyAdminDashboard 
                  companyName="Sparkle Clean NYC" 
                  trialDaysLeft={22}
                  onLogout={handleLogout}
                />
              )
            )}
          </Route>
          <Route path="/login">
            <LoginForm 
              onSubmit={handleLogin}
              onSwitchToSignup={() => { setShowSignup(true); setLocation('/'); }}
            />
          </Route>
          <Route path="/signup">
            <SignupForm 
              onSubmit={handleSignup}
              onSwitchToLogin={() => setLocation('/login')}
            />
          </Route>
          <Route path="/admin">
            <SuperAdminDashboard onLogout={handleLogout} />
          </Route>
          <Route path="/dashboard">
            <CompanyAdminDashboard 
              companyName="Sparkle Clean NYC" 
              trialDaysLeft={22}
              onLogout={handleLogout}
            />
          </Route>
          <Route path="/cleaner">
            <CleanerMobileView cleanerName="Maria Santos" onLogout={handleLogout} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
