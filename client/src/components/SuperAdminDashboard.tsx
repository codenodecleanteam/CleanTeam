import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MetricCard from './MetricCard';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Building2, CreditCard, Clock, CalendarCheck, Search, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CompanyRow {
  id: string;
  name: string;
  subscription_status: string | null;
  trial_ends_at: string | null;
  created_at: string;
  is_blocked: boolean;
}

interface SuperAdminDashboardProps {
  onLogout?: () => void;
}

export default function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isSuperAdmin = profile?.role === 'superadmin';

  const {
    data: companies = [],
    isLoading: isLoadingCompanies,
    error: companiesError,
  } = useQuery({
    queryKey: ['superadmin-companies'],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, subscription_status, trial_ends_at, created_at, is_blocked')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const {
    data: cleaners = [],
    isLoading: isLoadingCleaners,
  } = useQuery({
    queryKey: ['superadmin-cleaners'],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleaners')
        .select('id, company_id');
      if (error) throw error;
      return data;
    },
  });

  const {
    data: clients = [],
    isLoading: isLoadingClients,
  } = useQuery({
    queryKey: ['superadmin-clients'],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_id');
      if (error) throw error;
      return data;
    },
  });

  const {
    data: schedules = [],
    isLoading: isLoadingSchedules,
  } = useQuery({
    queryKey: ['superadmin-schedules'],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('id, company_id');
      if (error) throw error;
      return data;
    },
  });

  const aggregateByCompany = (rows: any[] = []) => {
    const map = new Map<string, number>();
    rows.forEach((row) => {
      if (!row.company_id) return;
      map.set(row.company_id, (map.get(row.company_id) ?? 0) + 1);
    });
    return map;
  };

  const cleanerCounts = useMemo(() => aggregateByCompany(cleaners), [cleaners]);
  const clientCounts = useMemo(() => aggregateByCompany(clients), [clients]);
  const scheduleCounts = useMemo(() => aggregateByCompany(schedules), [schedules]);

  const companiesWithStats = useMemo(() => {
    return companies.map((company: CompanyRow) => ({
      ...company,
      cleaners: cleanerCounts.get(company.id) ?? 0,
      clients: clientCounts.get(company.id) ?? 0,
      jobs: scheduleCounts.get(company.id) ?? 0,
      status: company.subscription_status ?? 'trial',
    }));
  }, [companies, cleanerCounts, clientCounts, scheduleCounts]);

  const filteredCompanies = companiesWithStats.filter(company =>
    company.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Trial</Badge>;
      case 'trial_expired':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const toggleCompanyStatusMutation = useMutation<
    { block: boolean },
    Error,
    { companyId: string; block: boolean }
  >({
    mutationFn: async ({ companyId, block }) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_blocked: block })
        .eq('id', companyId);
      if (error) throw error;
      return { block };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
      toast({
        title: t('superadmin.companies'),
        description: variables?.block
          ? t('superadmin.suspendSuccess')
          : t('superadmin.unsuspendSuccess'),
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : t('common.genericError');
      toast({
        title: t('superadmin.companies'),
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleToggleCompanyStatus = (company: CompanyRow) => {
    toggleCompanyStatusMutation.mutate({
      companyId: company.id,
      block: !company.is_blocked,
    });
  };

  const isUpdatingCompany = (companyId: string) =>
    toggleCompanyStatusMutation.isPending &&
    toggleCompanyStatusMutation.variables?.companyId === companyId;

  const metrics = useMemo(() => {
    return {
      totalCompanies: companiesWithStats.length,
      activeSubscriptions: companiesWithStats.filter(c => c.subscription_status === 'active').length,
      inTrial: companiesWithStats.filter(c => c.subscription_status === 'trial').length,
      totalJobs: schedules.length,
    };
  }, [companiesWithStats, schedules]);

  if (!isSuperAdmin) {
    return (
      <Alert className="m-4">
        <AlertTitle>{t('nav.dashboard')}</AlertTitle>
        <AlertDescription>
          {t('common.companyAccessRequired', {
            defaultValue: 'Somente superadmins podem acessar este painel.',
          })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">CleanTeams</span>
            <Badge variant="secondary" className="ml-2">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              {t('nav.logout')}
            </Button>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('superadmin.title')}</h1>
          <p className="text-muted-foreground">Manage all companies and view system metrics</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t('superadmin.totalCompanies')}
            value={metrics.totalCompanies}
            icon={Building2}
            trend={{ value: 8, positive: true }}
          />
          <MetricCard
            title={t('superadmin.activeSubscriptions')}
            value={metrics.activeSubscriptions}
            icon={CreditCard}
          />
          <MetricCard
            title={t('superadmin.inTrial')}
            value={metrics.inTrial}
            icon={Clock}
          />
          <MetricCard
            title={t('superadmin.totalJobs')}
            value={metrics.totalJobs}
            icon={CalendarCheck}
            trend={{ value: 15, positive: true }}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <CardTitle>{t('superadmin.companies')}</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-companies"
              />
            </div>
          </CardHeader>
          <CardContent>
            {(isLoadingCompanies || isLoadingCleaners || isLoadingClients || isLoadingSchedules) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.loading')}
              </div>
            )}
          {companiesError && (
            <p className="text-sm text-destructive pb-4">
              {companiesError.message || t('common.genericError')}
            </p>
          )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cleaners</TableHead>
                    <TableHead className="text-right">Clients</TableHead>
                    <TableHead className="text-right">Jobs</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                      <TableCell className="font-medium">
                         <div className="flex items-center gap-2">
                          {company.name}
                          {company.is_blocked && (
                            <Badge variant="destructive" className="uppercase text-[10px]">
                              {t('superadmin.blockedLabel', { defaultValue: 'Blocked' })}
                            </Badge>
                          )}
                        </div>
                        {company.trial_ends_at && (
                          <p className="text-xs text-muted-foreground">
                            Trial ends {formatDistanceToNow(new Date(company.trial_ends_at), { addSuffix: true })}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell className="text-right">{company.cleaners}</TableCell>
                      <TableCell className="text-right">{company.clients}</TableCell>
                      <TableCell className="text-right">{company.jobs}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" data-testid={`button-view-${company.id}`}>
                            View
                          </Button>
                          <Button
                            variant={company.is_blocked ? 'secondary' : 'destructive'}
                            size="sm"
                            onClick={() => handleToggleCompanyStatus(company)}
                            disabled={isUpdatingCompany(company.id)}
                            data-testid={`button-toggle-${company.id}`}
                          >
                            {isUpdatingCompany(company.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {company.is_blocked
                              ? t('superadmin.unsuspend', { defaultValue: 'Reativar' })
                              : t('superadmin.suspend', { defaultValue: 'Suspender' })}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!companiesError && filteredCompanies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
