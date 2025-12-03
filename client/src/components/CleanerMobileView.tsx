import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CleanerJobCard from './CleanerJobCard';
import JobReportModal from './JobReportModal';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Sparkles, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
type JobRole = 'driver' | 'helper';

interface JobItem {
  id: string;
  clientName: string;
  address: string;
  date: string;
  time: string;
  status: JobStatus;
  role: JobRole;
  teamMembers: string[];
}

interface CleanerMobileViewProps {
  cleanerName?: string;
  onLogout?: () => void;
}

export default function CleanerMobileView({ cleanerName, onLogout }: CleanerMobileViewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [reportModal, setReportModal] = useState<{ open: boolean; jobId: string | null; jobName: string }>({
    open: false,
    jobId: null,
    jobName: '',
  });

  const { data: cleanerRecord, isLoading: isLoadingCleaner } = useQuery({
    queryKey: ['cleaner-profile', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleaners')
        .select('id, company_id, profile_id, name')
        .eq('profile_id', profile!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const cleanerId = cleanerRecord?.id;
  const companyId = cleanerRecord?.company_id;
  const displayName = cleanerName || cleanerRecord?.name || profile?.name || 'Cleaner';

  const { data: companyCleaners = [] } = useQuery({
    queryKey: ['cleaner-company-members', companyId],
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

  const { data: companyClients = [] } = useQuery({
    queryKey: ['cleaner-company-clients', companyId],
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

  const { data: schedules = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['cleaner-jobs', cleanerId],
    enabled: !!cleanerId,
    queryFn: async () => {
      if (!cleanerId || !companyId) return [];
      const orFilter = [`drive_id.eq.${cleanerId}`, `helper1_id.eq.${cleanerId}`, `helper2_id.eq.${cleanerId}`].join(',');
      const { data, error } = await supabase
        .from('schedules')
        .select('id, job_date, start_time, status, client_id, drive_id, helper1_id, helper2_id')
        .eq('company_id', companyId)
        .or(orFilter)
        .order('job_date', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const cleanerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    companyCleaners.forEach((cleaner: any) => {
      map.set(cleaner.id, cleaner.name);
    });
    return map;
  }, [companyCleaners]);

  const clientMap = useMemo(() => {
    const map = new Map<string, { name: string; address: string }>();
    companyClients.forEach((client: any) => {
      map.set(client.id, { name: client.name, address: client.address });
    });
    return map;
  }, [companyClients]);

  const jobs: JobItem[] = useMemo(() => {
    if (!cleanerId) return [];
    return schedules.map((schedule: any) => {
      const clientInfo = clientMap.get(schedule.client_id) || { name: '-', address: '-' };
      const teamMembers = [schedule.drive_id, schedule.helper1_id, schedule.helper2_id]
        .filter(Boolean)
        .map((id) => cleanerNameMap.get(id as string) || '-')
        .filter((name, index, arr) => name && arr.indexOf(name) === index);
      return {
        id: schedule.id,
        clientName: clientInfo.name,
        address: clientInfo.address,
        date: schedule.job_date,
        time: schedule.start_time
          ? new Date(schedule.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '--:--',
        status: schedule.status as JobStatus,
        role: schedule.drive_id === cleanerId ? 'driver' : 'helper',
        teamMembers,
      };
    });
  }, [schedules, clientMap, cleanerNameMap, cleanerId]);

  const today = new Date().toISOString().slice(0, 10);
  const todayJobs = jobs.filter((job) => job.date === today);
  const upcomingJobs = jobs.filter((job) => job.date !== today);

  const startJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from('schedules').update({ status: 'in_progress' }).eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs', cleanerId] });
      toast({
        title: t('cleaner.start'),
        description: t('common.savedSuccessfully'),
      });
    },
    onError: (error) => {
      toast({
        title: t('cleaner.start'),
        description: error instanceof Error ? error.message : t('common.genericError'),
        variant: 'destructive',
      });
    },
  });

  const completeJobMutation = useMutation({
    mutationFn: async ({ jobId, report }: { jobId: string; report: { issues: string; extras: string; notes: string } }) => {
      if (!cleanerId) throw new Error('Cleaner not found');
      const { error: updateError } = await supabase
        .from('schedules')
        .update({ status: 'completed' })
        .eq('id', jobId);
      if (updateError) throw updateError;
      const { error: reportError } = await supabase.from('reports').insert({
        schedule_id: jobId,
        cleaner_id: cleanerId,
        issues: report.issues || null,
        extra_tasks: report.extras || null,
        notes: report.notes || null,
        end_time: new Date().toISOString(),
      });
      if (reportError) throw reportError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs', cleanerId] });
      toast({
        title: t('cleaner.complete'),
        description: t('common.savedSuccessfully'),
      });
      setReportModal({ open: false, jobId: null, jobName: '' });
    },
    onError: (error) => {
      toast({
        title: t('cleaner.complete'),
        description: error instanceof Error ? error.message : t('common.genericError'),
        variant: 'destructive',
      });
    },
  });

  const handleStartJob = (jobId: string) => {
    if (startJobMutation.isPending) return;
    startJobMutation.mutate(jobId);
  };

  const handleCompleteJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setReportModal({ open: true, jobId, jobName: job.clientName });
  };

  const handleSubmitReport = (report: { issues: string; extras: string; notes: string }) => {
    if (!reportModal.jobId || completeJobMutation.isPending) return;
    completeJobMutation.mutate({ jobId: reportModal.jobId, report });
  };

  if (isLoadingCleaner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cleanerRecord) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-muted-foreground">
        <div>
          <h2 className="text-xl font-semibold mb-2">{t('cleaners.title')}</h2>
          <p>{t('common.companyAccessRequired')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">CleanTeams</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="p-4 pb-24 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('cleaner.myAgenda')}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcome')}, {displayName}</p>
        </div>

        {isLoadingJobs && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('common.loading')}
          </div>
        )}

        {todayJobs.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">{t('cleaner.today')}</h2>
              <Badge variant="secondary">{todayJobs.length}</Badge>
            </div>
            <div className="space-y-4">
              {todayJobs.map((job) => (
                <CleanerJobCard
                  key={job.id}
                  job={job}
                  onStart={handleStartJob}
                  onComplete={handleCompleteJob}
                />
              ))}
            </div>
          </section>
        )}

        {upcomingJobs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">{t('cleaner.upcoming')}</h2>
              <Badge variant="secondary">{upcomingJobs.length}</Badge>
            </div>
            <div className="space-y-4">
              {upcomingJobs.map((job) => (
                <CleanerJobCard
                  key={job.id}
                  job={job}
                  onStart={handleStartJob}
                  onComplete={handleCompleteJob}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoadingJobs && jobs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('common.noResults')}
          </div>
        )}
      </main>

      <JobReportModal
        open={reportModal.open}
        onClose={() => setReportModal({ open: false, jobId: null, jobName: '' })}
        onSubmit={handleSubmitReport}
        jobName={reportModal.jobName}
      />
    </div>
  );
}
