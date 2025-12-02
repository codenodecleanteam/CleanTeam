import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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
import { Users, Home, CalendarCheck, FileText, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';

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
  const { company } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('overview');

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const companyId = company?.id;
  const resolvedCompanyName = company?.name ?? companyName;

  const { data: metrics, isLoading: isLoadingMetrics, isError } = useQuery({
    queryKey: ['company-metrics', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) {
        return { cleaners: 0, clients: 0, scheduledJobs: 0, completedThisWeek: 0 };
      }

      const [cleanersRes, clientsRes, schedulesRes, completedRes] = await Promise.all([
        supabase
          .from('cleaners')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId),
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId),
        supabase
          .from('schedules')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId),
        supabase
          .from('schedules')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('status', 'completed'),
      ]);

      const safeCount = (res: { count: number | null } | null) => res?.count ?? 0;

      return {
        cleaners: safeCount(cleanersRes),
        clients: safeCount(clientsRes),
        scheduledJobs: safeCount(schedulesRes),
        completedThisWeek: safeCount(completedRes),
      };
    },
  });

  const metricsData =
    metrics ?? { cleaners: 0, clients: 0, scheduledJobs: 0, completedThisWeek: 0 };

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
            {isLoadingMetrics && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.loading')}
              </div>
            )}
            {isError && (
              <p className="text-sm text-destructive">
                {t('common.genericError')}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title={t('dashboard.cleaners')}
                value={metricsData.cleaners}
                icon={Users}
                description="Active team members"
              />
              <MetricCard
                title={t('dashboard.clients')}
                value={metricsData.clients}
                icon={Home}
                description="Registered locations"
              />
              <MetricCard
                title="Scheduled Jobs"
                value={metricsData.scheduledJobs}
                icon={CalendarCheck}
                description="This week"
              />
              <MetricCard
                title="Completed"
                value={metricsData.completedThisWeek}
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
          companyName={resolvedCompanyName}
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
