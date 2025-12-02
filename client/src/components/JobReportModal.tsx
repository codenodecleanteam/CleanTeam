import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';

interface JobReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (report: { issues: string; extras: string; notes: string }) => void;
  jobName?: string;
}

export default function JobReportModal({ open, onClose, onSubmit, jobName }: JobReportModalProps) {
  const { t } = useTranslation();
  const [issues, setIssues] = useState('');
  const [extras, setExtras] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({ issues, extras, notes });
    setIssues('');
    setExtras('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('cleaner.report.title')}
          </DialogTitle>
          {jobName && (
            <p className="text-sm text-muted-foreground">{jobName}</p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-issues">{t('cleaner.report.issues')}</Label>
            <Textarea
              id="report-issues"
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder={t('cleaner.report.issuesPlaceholder')}
              className="min-h-[80px]"
              data-testid="textarea-report-issues"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-extras">{t('cleaner.report.extras')}</Label>
            <Textarea
              id="report-extras"
              value={extras}
              onChange={(e) => setExtras(e.target.value)}
              placeholder={t('cleaner.report.extrasPlaceholder')}
              className="min-h-[80px]"
              data-testid="textarea-report-extras"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-notes">{t('cleaner.report.notes')}</Label>
            <Textarea
              id="report-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('cleaner.report.notesPlaceholder')}
              className="min-h-[80px]"
              data-testid="textarea-report-notes"
            />
          </div>
          <Button 
            className="w-full h-14 text-base" 
            onClick={handleSubmit}
            data-testid="button-submit-report"
          >
            {t('cleaner.report.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
