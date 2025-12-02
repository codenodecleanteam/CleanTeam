import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Car, Users, Play, CheckCircle } from 'lucide-react';

interface CleanerJobCardProps {
  job: {
    id: string;
    clientName: string;
    address: string;
    date: string;
    time: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    role: 'driver' | 'helper';
    teamMembers: string[];
  };
  onStart?: (jobId: string) => void;
  onComplete?: (jobId: string) => void;
}

export default function CleanerJobCard({ job, onStart, onComplete }: CleanerJobCardProps) {
  const { t } = useTranslation();

  const getStatusBadge = () => {
    switch (job.status) {
      case 'scheduled':
        return <Badge variant="secondary">{t('schedule.scheduled')}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{t('schedule.inProgress')}</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{t('schedule.completed')}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Card className="hover-elevate" data-testid={`card-job-${job.id}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">{job.clientName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{job.address}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDate(job.date)} - {job.time}</span>
          </div>
          <Badge variant="outline" className="gap-1">
            {job.role === 'driver' ? <Car className="h-3 w-3" /> : <Users className="h-3 w-3" />}
            {t('cleaner.youAre')}: {job.role === 'driver' ? t('cleaner.driver') : t('cleaner.helper')}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          <span className="font-medium">Team:</span> {job.teamMembers.join(', ')}
        </div>

        {job.status === 'scheduled' && (
          <Button 
            className="w-full h-14 text-base"
            onClick={() => onStart?.(job.id)}
            data-testid={`button-start-job-${job.id}`}
          >
            <Play className="h-5 w-5 mr-2" />
            {t('cleaner.start')}
          </Button>
        )}

        {job.status === 'in_progress' && (
          <Button 
            className="w-full h-14 text-base bg-green-600 hover:bg-green-700"
            onClick={() => onComplete?.(job.id)}
            data-testid={`button-complete-job-${job.id}`}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {t('cleaner.complete')}
          </Button>
        )}

        {job.status === 'completed' && (
          <div className="flex items-center justify-center gap-2 h-14 text-green-600 dark:text-green-400 font-medium">
            <CheckCircle className="h-5 w-5" />
            {t('schedule.completed')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
