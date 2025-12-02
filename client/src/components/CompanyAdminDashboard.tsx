import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminSidebar from './AdminSidebar';
import CleanersList from './CleanersList';
import ClientsList from './ClientsList';
import ScheduleView from './ScheduleView';
import MetricCard from './MetricCard';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Users, Home, CalendarCheck, FileText, LogOut } from 'lucide-react';

type ActiveView = 'overview' | 'cleaners' | 'clients' | 'schedule' | 'reports' | 'settings';

interface CompanyAdminDashboardProps {
  companyName?: string;
  trialDaysLeft?: number;
  onLogout?: () => void;
}

export default function CompanyAdminDashboard({ 
  companyName = 'Sparkle Clean NYC', 
  trialDaysLeft,
  onLogout 
}: CompanyAdminDashboardProps) {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<ActiveView>('overview');

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // todo: remove mock functionality
  const metrics = {
    cleaners: 8,
    clients: 24,
    scheduledJobs: 12,
    completedThisWeek: 45,
  };

  const renderContent = () => {
    switch (activeView) {
      case 'cleaners':
        return <CleanersList />;
      case 'clients':
        return <ClientsList />;
      case 'schedule':
        return <ScheduleView />;
      case 'reports':
        return (
          <div className="text-center py-12 text-muted-foreground">
            Reports view coming soon...
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12 text-muted-foreground">
            Settings view coming soon...
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{t('dashboard.overview')}</h2>
              <p className="text-muted-foreground">{t('dashboard.welcome')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title={t('dashboard.cleaners')}
                value={metrics.cleaners}
                icon={Users}
                description="Active team members"
              />
              <MetricCard
                title={t('dashboard.clients')}
                value={metrics.clients}
                icon={Home}
                description="Registered locations"
              />
              <MetricCard
                title="Scheduled Jobs"
                value={metrics.scheduledJobs}
                icon={CalendarCheck}
                description="This week"
              />
              <MetricCard
                title="Completed"
                value={metrics.completedThisWeek}
                icon={FileText}
                description="Jobs this week"
                trend={{ value: 8, positive: true }}
              />
            </div>
            <ScheduleView />
          </div>
        );
    }
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          companyName={companyName}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              {trialDaysLeft !== undefined && trialDaysLeft > 0 && (
                <Badge variant="secondary" className="hidden sm:flex">
                  {trialDaysLeft} {t('subscription.trialDays')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('nav.logout')}</span>
              </Button>
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
