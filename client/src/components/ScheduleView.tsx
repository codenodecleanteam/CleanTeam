import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Calendar, Clock, Car, Users } from 'lucide-react';

// todo: remove mock functionality
const mockSchedules = [
  { id: '1', date: '2024-01-15', time: '09:00', clientName: 'Johnson Residence', driverName: 'Maria Santos', helper1: 'Ana Rodriguez', helper2: 'Carmen Lopez', status: 'scheduled' },
  { id: '2', date: '2024-01-15', time: '14:00', clientName: 'Smith Family', driverName: 'Lucia Fernandez', helper1: 'Patricia Silva', helper2: null, status: 'in_progress' },
  { id: '3', date: '2024-01-16', time: '10:00', clientName: 'Chen Apartment', driverName: 'Maria Santos', helper1: 'Carmen Lopez', helper2: null, status: 'scheduled' },
  { id: '4', date: '2024-01-16', time: '15:00', clientName: 'Williams House', driverName: 'Lucia Fernandez', helper1: 'Ana Rodriguez', helper2: 'Patricia Silva', status: 'scheduled' },
  { id: '5', date: '2024-01-14', time: '09:00', clientName: 'Garcia Condo', driverName: 'Maria Santos', helper1: 'Ana Rodriguez', helper2: null, status: 'completed' },
];

const mockCleaners = [
  { id: '1', name: 'Maria Santos', drives: true },
  { id: '2', name: 'Ana Rodriguez', drives: false },
  { id: '3', name: 'Lucia Fernandez', drives: true },
  { id: '4', name: 'Patricia Silva', drives: false },
  { id: '5', name: 'Carmen Lopez', drives: false },
];

const mockClients = [
  { id: '1', name: 'Johnson Residence' },
  { id: '2', name: 'Smith Family' },
  { id: '3', name: 'Chen Apartment' },
  { id: '4', name: 'Williams House' },
  { id: '5', name: 'Garcia Condo' },
];

export default function ScheduleView() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    date: '',
    time: '',
    clientId: '',
    driverId: '',
    helper1Id: '',
    helper2Id: '',
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

  const handleAddJob = () => {
    console.log('Adding job:', newJob);
    setDialogOpen(false);
    setNewJob({ date: '', time: '', clientId: '', driverId: '', helper1Id: '', helper2Id: '' });
  };

  const drivers = mockCleaners.filter(c => c.drives);
  const helpers = mockCleaners.filter(c => !c.drives);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('schedule.title')}</h2>
          <p className="text-muted-foreground text-sm">Manage cleaning appointments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-job">
              <Plus className="h-4 w-4 mr-2" />
              {t('schedule.addJob')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('schedule.addJob')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-date">{t('schedule.date')}</Label>
                  <Input
                    id="job-date"
                    type="date"
                    value={newJob.date}
                    onChange={(e) => setNewJob({ ...newJob, date: e.target.value })}
                    data-testid="input-job-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-time">{t('schedule.time')}</Label>
                  <Input
                    id="job-time"
                    type="time"
                    value={newJob.time}
                    onChange={(e) => setNewJob({ ...newJob, time: e.target.value })}
                    data-testid="input-job-time"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('schedule.client')}</Label>
                <Select
                  value={newJob.clientId}
                  onValueChange={(val) => setNewJob({ ...newJob, clientId: val })}
                >
                  <SelectTrigger data-testid="select-job-client">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('schedule.driver')}</Label>
                <Select
                  value={newJob.driverId}
                  onValueChange={(val) => setNewJob({ ...newJob, driverId: val })}
                >
                  <SelectTrigger data-testid="select-job-driver">
                    <SelectValue placeholder="Select driver..." />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('schedule.helper1')}</Label>
                  <Select
                    value={newJob.helper1Id}
                    onValueChange={(val) => setNewJob({ ...newJob, helper1Id: val })}
                  >
                    <SelectTrigger data-testid="select-job-helper1">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {helpers.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('schedule.helper2')}</Label>
                  <Select
                    value={newJob.helper2Id}
                    onValueChange={(val) => setNewJob({ ...newJob, helper2Id: val })}
                  >
                    <SelectTrigger data-testid="select-job-helper2">
                      <SelectValue placeholder="Optional..." />
                    </SelectTrigger>
                    <SelectContent>
                      {helpers.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleAddJob} data-testid="button-save-job">
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Showing all upcoming jobs</span>
          </div>
        </CardHeader>
        <CardContent>
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
                {mockSchedules.map((job) => (
                  <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                    <TableCell className="font-medium">{formatDate(job.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {job.time}
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
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" data-testid={`button-edit-job-${job.id}`}>
                        {t('common.edit')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
