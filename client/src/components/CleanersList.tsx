import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Car, Phone } from 'lucide-react';

// todo: remove mock functionality
const mockCleaners = [
  { id: '1', name: 'Maria Santos', phone: '(347) 555-0101', email: 'maria@email.com', language: 'pt', drives: true, status: 'active', area: 'Manhattan' },
  { id: '2', name: 'Ana Rodriguez', phone: '(347) 555-0102', email: 'ana@email.com', language: 'es', drives: false, status: 'active', area: 'Brooklyn' },
  { id: '3', name: 'Lucia Fernandez', phone: '(347) 555-0103', email: 'lucia@email.com', language: 'es', drives: true, status: 'active', area: 'Queens' },
  { id: '4', name: 'Patricia Silva', phone: '(347) 555-0104', email: 'patricia@email.com', language: 'pt', drives: false, status: 'inactive', area: 'Bronx' },
  { id: '5', name: 'Carmen Lopez', phone: '(347) 555-0105', email: 'carmen@email.com', language: 'es', drives: false, status: 'active', area: 'Manhattan' },
];

export default function CleanersList() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCleaner, setNewCleaner] = useState({
    name: '',
    phone: '',
    email: '',
    language: 'en',
    drives: false,
    area: '',
  });

  const filteredCleaners = mockCleaners.filter(cleaner =>
    cleaner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cleaner.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLanguageLabel = (code: string) => {
    const labels: Record<string, string> = { en: 'English', pt: 'Portugues', es: 'Espanol' };
    return labels[code] || code;
  };

  const handleAddCleaner = () => {
    console.log('Adding cleaner:', newCleaner);
    setDialogOpen(false);
    setNewCleaner({ name: '', phone: '', email: '', language: 'en', drives: false, area: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('cleaners.title')}</h2>
          <p className="text-muted-foreground text-sm">Manage your cleaning team members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-cleaner">
              <Plus className="h-4 w-4 mr-2" />
              {t('cleaners.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('cleaners.add')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cleaner-name">{t('cleaners.name')}</Label>
                <Input
                  id="cleaner-name"
                  value={newCleaner.name}
                  onChange={(e) => setNewCleaner({ ...newCleaner, name: e.target.value })}
                  data-testid="input-cleaner-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaner-phone">{t('cleaners.phone')}</Label>
                <Input
                  id="cleaner-phone"
                  value={newCleaner.phone}
                  onChange={(e) => setNewCleaner({ ...newCleaner, phone: e.target.value })}
                  data-testid="input-cleaner-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaner-email">{t('cleaners.email')}</Label>
                <Input
                  id="cleaner-email"
                  type="email"
                  value={newCleaner.email}
                  onChange={(e) => setNewCleaner({ ...newCleaner, email: e.target.value })}
                  data-testid="input-cleaner-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaner-area">{t('cleaners.area')}</Label>
                <Input
                  id="cleaner-area"
                  value={newCleaner.area}
                  onChange={(e) => setNewCleaner({ ...newCleaner, area: e.target.value })}
                  placeholder="Manhattan, Brooklyn..."
                  data-testid="input-cleaner-area"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('cleaners.language')}</Label>
                <Select
                  value={newCleaner.language}
                  onValueChange={(val) => setNewCleaner({ ...newCleaner, language: val })}
                >
                  <SelectTrigger data-testid="select-cleaner-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Portugues</SelectItem>
                    <SelectItem value="es">Espanol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cleaner-drives">{t('cleaners.drives')}</Label>
                <Switch
                  id="cleaner-drives"
                  checked={newCleaner.drives}
                  onCheckedChange={(checked) => setNewCleaner({ ...newCleaner, drives: checked })}
                  data-testid="switch-cleaner-drives"
                />
              </div>
              <Button className="w-full" onClick={handleAddCleaner} data-testid="button-save-cleaner">
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
              data-testid="input-search-cleaners"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('cleaners.name')}</TableHead>
                  <TableHead>{t('cleaners.phone')}</TableHead>
                  <TableHead>{t('cleaners.language')}</TableHead>
                  <TableHead>{t('cleaners.area')}</TableHead>
                  <TableHead>{t('cleaners.status')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCleaners.map((cleaner) => (
                  <TableRow key={cleaner.id} data-testid={`row-cleaner-${cleaner.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cleaner.name}</span>
                        {cleaner.drives && (
                          <Badge variant="secondary" className="gap-1">
                            <Car className="h-3 w-3" />
                            Driver
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {cleaner.phone}
                      </div>
                    </TableCell>
                    <TableCell>{getLanguageLabel(cleaner.language)}</TableCell>
                    <TableCell>{cleaner.area}</TableCell>
                    <TableCell>
                      <Badge variant={cleaner.status === 'active' ? 'default' : 'secondary'}>
                        {cleaner.status === 'active' ? t('cleaners.active') : t('cleaners.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" data-testid={`button-edit-cleaner-${cleaner.id}`}>
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
