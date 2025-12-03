import { useEffect, useMemo } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/components/LandingPage";
import { LoginForm, SignupForm } from "@/components/AuthForms";
import SuperAdminDashboard from "@/components/SuperAdminDashboard";
import CompanyAdminDashboard from "@/components/CompanyAdminDashboard";
import CleanerMobileView from "@/components/CleanerMobileView";
import { SetupCompany } from "@/components/SetupCompany";
import { BlockedCompanyScreen } from "@/components/BlockedCompanyScreen";
import NotFound from "@/pages/not-found";
import "@/lib/i18n";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { useRouting } from "@/hooks/useRouting";

const roleRouteMap: Record<string, string> = {
  superadmin: "/admin",
  owner: "/dashboard",
  admin: "/dashboard",
  cleaner: "/cleaner",
};

const FullscreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

function RedirectTo({ to }: { to: string }) {
  const { navigate } = useRouting();
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  return null;
}

function App() {
  const { location, navigate } = useRouting();
  const { session, profile, company, initializing, pendingSetupUser, signIn, signUp, signOut } =
    useAuth();

  const dashboardRoute = profile ? roleRouteMap[profile.role] ?? "/dashboard" : "/dashboard";

  const trialDaysLeft = useMemo(() => {
    if (!company?.trialEndsAt) return undefined;
    const days = differenceInCalendarDays(new Date(company.trialEndsAt), new Date());
    return Math.max(days, 0);
  }, [company?.trialEndsAt]);

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
    navigate("/");
  };

  const handleSignup = async (data: {
    name: string;
    email: string;
    password: string;
    companyName: string;
  }) => {
    const result = await signUp(data);
    if (!result.requiresEmailConfirmation) {
      navigate("/");
    }
    return result;
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      if (typeof window !== "undefined") {
        window.location.assign("/");
      } else {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    if (initializing || !session || !profile || company?.isBlocked) return;
    const publicRoutes = ["/", "/login", "/signup"];
    if (publicRoutes.includes(location)) {
      navigate(dashboardRoute);
    }
  }, [initializing, session, profile, company?.isBlocked, dashboardRoute, location, navigate]);

  if (initializing) {
    return <FullscreenLoader />;
  }

  const isMissingProfile = session && !pendingSetupUser && !profile;
  if (isMissingProfile) {
    return <FullscreenLoader />;
  }

  if (session && pendingSetupUser) {
    return <SetupCompany />;
  }

  if (session && company?.isBlocked) {
    return (
      <TooltipProvider>
        <Toaster />
        <BlockedCompanyScreen onLogout={handleLogout} />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        <Route path="/">
          {!session ? (
            <LandingPage onLogin={() => navigate("/login")} onSignup={() => navigate("/signup")} />
          ) : (
            <RedirectTo to={dashboardRoute} />
          )}
        </Route>
        <Route path="/login">
          {!session ? (
            <LoginForm onSubmit={handleLogin} onSwitchToSignup={() => navigate("/signup")} />
          ) : (
            <RedirectTo to={dashboardRoute} />
          )}
        </Route>
        <Route path="/signup">
          {!session ? (
            <SignupForm onSubmit={handleSignup} onSwitchToLogin={() => navigate("/login")} />
          ) : (
            <RedirectTo to={dashboardRoute} />
          )}
        </Route>
        <Route path="/admin">
          {session && profile?.role === "superadmin" ? (
            <SuperAdminDashboard onLogout={handleLogout} />
          ) : (
            <RedirectTo to={session ? dashboardRoute : "/"} />
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
            <RedirectTo to={session ? dashboardRoute : "/"} />
          )}
        </Route>
        <Route path="/cleaner">
          {session && profile?.role === "cleaner" ? (
            <CleanerMobileView cleanerName={profile.name} onLogout={handleLogout} />
          ) : (
            <RedirectTo to={session ? dashboardRoute : "/"} />
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
