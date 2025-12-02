import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CleanerJobCard from './CleanerJobCard';
import JobReportModal from './JobReportModal';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Sparkles, LogOut } from 'lucide-react';

type JobStatus = 'scheduled' | 'in_progress' | 'completed';
type JobRole = 'driver' | 'helper';

interface Job {
  id: string;
  clientName: string;
  address: string;
  date: string;
  time: string;
  status: JobStatus;
  role: JobRole;
  teamMembers: string[];
}

// todo: remove mock functionality
const mockJobs: Job[] = [
  { 
    id: '1', 
    clientName: 'Johnson Residence', 
    address: '123 Park Ave, Manhattan, NY 10022', 
    date: '2024-01-15', 
    time: '09:00', 
    status: 'in_progress', 
    role: 'driver', 
    teamMembers: ['Ana Rodriguez', 'Carmen Lopez'] 
  },
  { 
    id: '2', 
    clientName: 'Smith Family', 
    address: '456 Brooklyn St, Brooklyn, NY 11201', 
    date: '2024-01-15', 
    time: '14:00', 
    status: 'scheduled', 
    role: 'driver', 
    teamMembers: ['Patricia Silva'] 
  },
  { 
    id: '3', 
    clientName: 'Chen Apartment', 
    address: '789 Queens Blvd, Queens, NY 11375', 
    date: '2024-01-16', 
    time: '10:00', 
    status: 'scheduled', 
    role: 'helper', 
    teamMembers: ['Maria Santos', 'Carmen Lopez'] 
  },
];

interface CleanerMobileViewProps {
  cleanerName?: string;
  onLogout?: () => void;
}

export default function CleanerMobileView({ cleanerName = 'Maria', onLogout }: CleanerMobileViewProps) {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [reportModal, setReportModal] = useState<{ open: boolean; jobId: string | null; jobName: string }>({
    open: false,
    jobId: null,
    jobName: '',
  });

  const handleStartJob = (jobId: string) => {
    setJobs(jobs.map(j => 
      j.id === jobId ? { ...j, status: 'in_progress' as const } : j
    ));
    console.log('Job started:', jobId);
  };

  const handleCompleteJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setReportModal({ open: true, jobId, jobName: job.clientName });
    }
  };

  const handleSubmitReport = (report: { issues: string; extras: string; notes: string }) => {
    if (reportModal.jobId) {
      setJobs(jobs.map(j => 
        j.id === reportModal.jobId ? { ...j, status: 'completed' as const } : j
      ));
      console.log('Report submitted for job:', reportModal.jobId, report);
    }
  };

  const todayJobs = jobs.filter(j => j.date === '2024-01-15');
  const upcomingJobs = jobs.filter(j => j.date !== '2024-01-15');

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
          <p className="text-muted-foreground">{t('dashboard.welcome')}, {cleanerName}</p>
        </div>

        {todayJobs.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">{t('cleaner.today')}</h2>
              <Badge variant="secondary">{todayJobs.length}</Badge>
            </div>
            <div className="space-y-4">
              {todayJobs.map(job => (
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
              {upcomingJobs.map(job => (
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

        {jobs.length === 0 && (
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
