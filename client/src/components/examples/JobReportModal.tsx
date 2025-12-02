import { useState } from 'react';
import JobReportModal from '../JobReportModal';
import { Button } from '@/components/ui/button';
import '@/lib/i18n';

export default function JobReportModalExample() {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Report Modal</Button>
      <JobReportModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(report) => console.log('Report submitted:', report)}
        jobName="Johnson Residence"
      />
    </div>
  );
}
