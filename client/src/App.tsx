import { useEffect, useMemo } from "react";
import { Switch, Route, useLocation } from "wouter";
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
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";

const roleRouteMap: Record<string, string> = {
  superadmin: "/admin",
  owner: "/dashboard",
  admin: "/dashboard",
  cleaner: "/cleaner",
};

const Redirect = ({ to }: { to: string }) => {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [setLocation, to]);
  return null;
};

const FullscreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

function App() {
  const [, setLocation] = useLocation();
  const { session, profile, company, initializing, signIn, signUp, signOut } = useAuth();

  const dashboardRoute = profile ? roleRouteMap[profile.role] ?? "/dashboard" : "/dashboard";

  const trialDaysLeft = useMemo(() => {
    if (!company?.trialEndsAt) return undefined;
    const days = differenceInCalendarDays(new Date(company.trialEndsAt), new Date());
    return Math.max(days, 0);
  }, [company?.trialEndsAt]);

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
    setLocation("/");
  };

  const handleSignup = async (data: { name: string; email: string; password: string; companyName: string }) => {
    await signUp(data);
    setLocation("/");
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  if (initializing) {
    return <FullscreenLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/">
            {!session ? (
              <LandingPage
                onLogin={() => setLocation("/login")}
                onSignup={() => setLocation("/signup")}
              />
            ) : (
              <Redirect to={dashboardRoute} />
            )}
          </Route>
          <Route path="/login">
            {!session ? (
              <LoginForm
                onSubmit={handleLogin}
                onSwitchToSignup={() => setLocation("/signup")}
              />
            ) : (
              <Redirect to={dashboardRoute} />
            )}
          </Route>
          <Route path="/signup">
            {!session ? (
              <SignupForm
                onSubmit={handleSignup}
                onSwitchToLogin={() => setLocation("/login")}
              />
            ) : (
              <Redirect to={dashboardRoute} />
            )}
          </Route>
          <Route path="/admin">
            {session && profile?.role === "superadmin" ? (
              <SuperAdminDashboard onLogout={handleLogout} />
            ) : (
              <Redirect to={session ? dashboardRoute : "/"} />
            )}
          </Route>
          <Route path="/dashboard">
            {session && ["owner", "admin"].includes(profile?.role ?? "") ? (
              <CompanyAdminDashboard
                companyName={company?.name ?? "Sua Empresa"}
                trialDaysLeft={trialDaysLeft}
                onLogout={handleLogout}
              />
            ) : (
              <Redirect to={session ? dashboardRoute : "/"} />
            )}
          </Route>
          <Route path="/cleaner">
            {session && profile?.role === "cleaner" ? (
              <CleanerMobileView cleanerName={profile.name} onLogout={handleLogout} />
            ) : (
              <Redirect to={session ? dashboardRoute : "/"} />
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
