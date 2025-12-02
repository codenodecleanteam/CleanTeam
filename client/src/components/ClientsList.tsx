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
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Search, MapPin } from 'lucide-react';

// todo: remove mock functionality
const mockClients = [
  { id: '1', name: 'Johnson Residence', address: '123 Park Ave, Manhattan, NY 10022', frequency: 'weekly', notes: 'Key under mat' },
  { id: '2', name: 'Smith Family', address: '456 Brooklyn St, Brooklyn, NY 11201', frequency: 'bi-weekly', notes: 'Dog friendly cleaner needed' },
  { id: '3', name: 'Chen Apartment', address: '789 Queens Blvd, Queens, NY 11375', frequency: 'monthly', notes: '' },
  { id: '4', name: 'Williams House', address: '321 Bronx Ave, Bronx, NY 10451', frequency: 'weekly', notes: 'Allergies - no strong scents' },
  { id: '5', name: 'Garcia Condo', address: '654 5th Ave, Manhattan, NY 10019', frequency: 'bi-weekly', notes: 'Doorman building' },
];

export default function ClientsList() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    address: '',
    frequency: 'weekly',
    notes: '',
  });

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: t('clients.weekly'),
      'bi-weekly': t('clients.biweekly'),
      monthly: t('clients.monthly'),
      'one-time': t('clients.onetime'),
    };
    return labels[freq] || freq;
  };

  const handleAddClient = () => {
    console.log('Adding client:', newClient);
    setDialogOpen(false);
    setNewClient({ name: '', address: '', frequency: 'weekly', notes: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('clients.title')}</h2>
          <p className="text-muted-foreground text-sm">Manage your client locations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-client">
              <Plus className="h-4 w-4 mr-2" />
              {t('clients.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('clients.add')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">{t('clients.name')}</Label>
                <Input
                  id="client-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Johnson Residence"
                  data-testid="input-client-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-address">{t('clients.address')}</Label>
                <Input
                  id="client-address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="123 Main St, Manhattan, NY"
                  data-testid="input-client-address"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('clients.frequency')}</Label>
                <Select
                  value={newClient.frequency}
                  onValueChange={(val) => setNewClient({ ...newClient, frequency: val })}
                >
                  <SelectTrigger data-testid="select-client-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{t('clients.weekly')}</SelectItem>
                    <SelectItem value="bi-weekly">{t('clients.biweekly')}</SelectItem>
                    <SelectItem value="monthly">{t('clients.monthly')}</SelectItem>
                    <SelectItem value="one-time">{t('clients.onetime')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-notes">{t('clients.notes')}</Label>
                <Textarea
                  id="client-notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder="Special instructions..."
                  data-testid="textarea-client-notes"
                />
              </div>
              <Button className="w-full" onClick={handleAddClient} data-testid="button-save-client">
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-clients"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('clients.name')}</TableHead>
                  <TableHead>{t('clients.address')}</TableHead>
                  <TableHead>{t('clients.frequency')}</TableHead>
                  <TableHead>{t('clients.notes')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{client.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getFrequencyLabel(client.frequency)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
                        {client.notes || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" data-testid={`button-edit-client-${client.id}`}>
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
