import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Clock, Car, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ScheduleView() {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">{t('schedule.scheduled')}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{t('schedule.inProgress')}</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{t('schedule.completed')}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{t('schedule.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (time?: string | null) => {
    if (!time) return '-';
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) {
      return time.slice(11, 16);
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const { company } = useAuth();
  const companyId = company?.id;

  const { data: schedules = [], isLoading: isLoadingSchedules, isError: schedulesError } = useQuery({
    queryKey: ['schedules', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('schedules')
        .select('id, job_date, start_time, client_id, drive_id, helper1_id, helper2_id, status')
        .eq('company_id', companyId)
        .order('job_date', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, address')
        .eq('company_id', companyId);
      if (error) throw error;
      return data;
    },
  });

  const { data: cleaners = [] } = useQuery({
    queryKey: ['cleaners', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('cleaners')
        .select('id, name')
        .eq('company_id', companyId);
      if (error) throw error;
      return data;
    },
  });

  const cleanerMap = useMemo(() => {
    const map = new Map<string, string>();
    cleaners.forEach((cleaner: any) => {
      map.set(cleaner.id, cleaner.name);
    });
    return map;
  }, [cleaners]);

  const clientMap = useMemo(() => {
    const map = new Map<string, { name?: string; address?: string }>();
    clients.forEach((client: any) => {
      map.set(client.id, { name: client.name, address: client.address });
    });
    return map;
  }, [clients]);

  const parsedSchedules = useMemo(() => {
    return schedules.map((schedule: any) => {
      const clientInfo = clientMap.get(schedule.client_id) || {};
      return {
        id: schedule.id,
        date: schedule.job_date,
        time: schedule.start_time,
        status: schedule.status,
        clientName: clientInfo.name || '-',
        clientAddress: clientInfo.address || '-',
        driverName: cleanerMap.get(schedule.drive_id) || '-',
        helper1: cleanerMap.get(schedule.helper1_id) || '-',
        helper2: schedule.helper2_id ? cleanerMap.get(schedule.helper2_id) || '-' : null,
      };
    });
  }, [schedules, clientMap, cleanerMap]);

  if (!companyId) {
    return (
      <Alert>
        <AlertTitle>{t('schedule.title')}</AlertTitle>
        <AlertDescription>
          {t('common.companyAccessRequired', {
            defaultValue: 'Disponível apenas para administradores de empresa.',
          })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('schedule.title')}</h2>
          <p className="text-muted-foreground text-sm">Manage cleaning appointments</p>
        </div>
        <div className="rounded-md border px-4 py-2 text-sm text-muted-foreground">
          {t('schedule.addJob')} • {t('common.comingSoon', { defaultValue: 'Em breve' })}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Showing all upcoming jobs</span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSchedules && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.loading')}
            </div>
          )}
          {schedulesError && (
            <p className="text-sm text-destructive">
              {t('common.genericError')}
            </p>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('schedule.date')}</TableHead>
                  <TableHead>{t('schedule.time')}</TableHead>
                  <TableHead>{t('schedule.client')}</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>{t('schedule.status')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedSchedules.map((job) => (
                  <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                    <TableCell className="font-medium">
                      {job.date ? formatDate(job.date) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(job.time)}
                      </div>
                    </TableCell>
                    <TableCell>{job.clientName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Car className="h-3 w-3 text-primary" />
                          {job.driverName}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {job.helper1}
                          {job.helper2 && `, ${job.helper2}`}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{job.clientAddress}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {t('common.actions')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoadingSchedules && parsedSchedules.length === 0 && (
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
    </div>
  );
}
