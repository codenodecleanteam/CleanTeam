import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Building2, CreditCard, Clock, CalendarCheck, Search, Sparkles, LogOut } from 'lucide-react';

// todo: remove mock functionality
const mockCompanies = [
  { id: '1', name: 'Sparkle Clean NYC', status: 'active', cleaners: 8, clients: 24, jobs: 156, trialEnds: null },
  { id: '2', name: 'Fresh Home Services', status: 'trial', cleaners: 4, clients: 12, jobs: 45, trialEnds: '2024-01-15' },
  { id: '3', name: 'Premium Maids Co', status: 'active', cleaners: 12, clients: 38, jobs: 289, trialEnds: null },
  { id: '4', name: 'NYC Clean Team', status: 'trial_expired', cleaners: 3, clients: 8, jobs: 22, trialEnds: '2023-12-01' },
  { id: '5', name: 'Elite Cleaning NY', status: 'active', cleaners: 6, clients: 18, jobs: 98, trialEnds: null },
];

interface SuperAdminDashboardProps {
  onLogout?: () => void;
}

export default function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  // todo: remove mock functionality
  const metrics = {
    totalCompanies: mockCompanies.length,
    activeSubscriptions: mockCompanies.filter(c => c.status === 'active').length,
    inTrial: mockCompanies.filter(c => c.status === 'trial').length,
    totalJobs: mockCompanies.reduce((sum, c) => sum + c.jobs, 0),
  };

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
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell className="text-right">{company.cleaners}</TableCell>
                      <TableCell className="text-right">{company.clients}</TableCell>
                      <TableCell className="text-right">{company.jobs}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" data-testid={`button-view-${company.id}`}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
