import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Calendar, Clock, Car, Users, Loader2, PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ScheduleFormInputs {
  clientId: string;
  driverId: string;
  helper1Id: string;
  helper2Id?: string;
  date: string;
  time: string;
}

export default function ScheduleView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const form = useForm<ScheduleFormInputs>({
    defaultValues: {
      clientId: '',
      driverId: '',
      helper1Id: '',
      helper2Id: '',
      date: '',
      time: '',
    },
  });

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

  const {
    data: schedules = [],
    isLoading: isLoadingSchedules,
    isError: schedulesError,
    error: schedulesErrorData,
  } = useQuery({
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

  const createScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormInputs) => {
      if (!data.date || !data.time) {
        throw new Error(t('common.requiredField'));
      }
      const scheduledAt = new Date(`${data.date}T${data.time}`);
      const assignedIds = [data.driverId, data.helper1Id, data.helper2Id].filter(Boolean) as string[];

      if (assignedIds.length > 0) {
        const orFilter = assignedIds
          .map((id) => `drive_id.eq.${id},helper1_id.eq.${id},helper2_id.eq.${id}`)
          .join(',');
        const { data: conflicts, error: conflictError } = await supabase
          .from('schedules')
          .select('id, start_time')
          .eq('company_id', companyId)
          .eq('job_date', data.date)
          .or(orFilter);
        if (conflictError) throw conflictError;
        const hasConflict = conflicts?.some((conflict) => {
          if (!conflict.start_time) return false;
          const conflictTime = new Date(conflict.start_time);
          const diff = Math.abs(conflictTime.getTime() - scheduledAt.getTime());
          return diff < 60 * 60 * 1000;
        });
        if (hasConflict) {
          throw new Error(
            t('schedule.conflict', {
              defaultValue: 'Conflito de agenda para a equipe selecionada.',
            })
          );
        }
      }

      const { error } = await supabase.from('schedules').insert({
        company_id: companyId,
        client_id: data.clientId,
        job_date: data.date,
        start_time: scheduledAt.toISOString(),
        drive_id: data.driverId,
        helper1_id: data.helper1Id,
        helper2_id: data.helper2Id || null,
        status: 'scheduled',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', companyId] });
      toast({
        title: t('schedule.title'),
        description: t('common.savedSuccessfully'),
      });
      form.reset();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('schedule.title'),
        description: error instanceof Error ? error.message : t('common.genericError'),
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ scheduleId, status }: { scheduleId: string; status: string }) => {
      const { error } = await supabase
        .from('schedules')
        .update({ status })
        .eq('id', scheduleId);
      if (error) throw error;
    },
    onMutate: ({ scheduleId }) => {
      setStatusUpdatingId(scheduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', companyId] });
      toast({
        title: t('schedule.title'),
        description: t('common.savedSuccessfully'),
      });
    },
    onSettled: () => {
      setStatusUpdatingId(null);
    },
    onError: (error) => {
      toast({
        title: t('schedule.title'),
        description: error instanceof Error ? error.message : t('common.genericError'),
        variant: 'destructive',
      });
    },
  });

  const handleCreateJob = form.handleSubmit((values) => {
    createScheduleMutation.mutate(values);
  });

  const handleStatusChange = (scheduleId: string, status: string) => {
    updateStatusMutation.mutate({ scheduleId, status });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('schedule.title')}</h2>
          <p className="text-muted-foreground text-sm">Manage cleaning appointments</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-add-job">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('schedule.addJob')}
        </Button>
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
              {schedulesErrorData?.message || t('common.genericError')}
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
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <Label htmlFor={`status-${job.id}`} className="text-xs">
                          {t('schedule.status')}
                        </Label>
                        <select
                          id={`status-${job.id}`}
                          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          disabled={statusUpdatingId === job.id}
                        >
                          <option value="scheduled">{t('schedule.scheduled')}</option>
                          <option value="in_progress">{t('schedule.inProgress')}</option>
                          <option value="completed">{t('schedule.completed')}</option>
                          <option value="cancelled">{t('schedule.cancelled')}</option>
                        </select>
                      </div>
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
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('schedule.addJob')}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateJob}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">{t('schedule.client')}</Label>
                <select
                  id="client"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...form.register('clientId', { required: true })}
                >
                  <option value="">{t('common.select', { defaultValue: 'Selecione' })}</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">{t('schedule.date')}</Label>
                <Input type="date" id="date" {...form.register('date', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">{t('schedule.time')}</Label>
                <Input type="time" id="time" {...form.register('time', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver">{t('schedule.driver')}</Label>
                <select
                  id="driver"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...form.register('driverId', { required: true })}
                >
                  <option value="">{t('common.select', { defaultValue: 'Selecione' })}</option>
                  {cleaners.map((cleaner: any) => (
                    <option key={cleaner.id} value={cleaner.id}>
                      {cleaner.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="helper1">{t('schedule.helper1')}</Label>
                <select
                  id="helper1"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...form.register('helper1Id', { required: true })}
                >
                  <option value="">{t('common.select', { defaultValue: 'Selecione' })}</option>
                  {cleaners.map((cleaner: any) => (
                    <option key={cleaner.id} value={cleaner.id}>
                      {cleaner.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="helper2">{t('schedule.helper2')}</Label>
                <select
                  id="helper2"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...form.register('helper2Id')}
                >
                  <option value="">{t('common.select', { defaultValue: 'Selecione' })}</option>
                  {cleaners.map((cleaner: any) => (
                    <option key={cleaner.id} value={cleaner.id}>
                      {cleaner.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createScheduleMutation.isPending}>
                {createScheduleMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
