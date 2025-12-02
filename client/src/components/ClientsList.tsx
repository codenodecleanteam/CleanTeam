import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

type ClientFrequency = "weekly" | "bi-weekly" | "monthly" | "one-time";

interface ClientRecord {
  id: string;
  name: string;
  address: string | null;
  frequency: ClientFrequency | null;
  notes: string | null;
}

interface ClientFormState {
  id?: string;
  name: string;
  address: string;
  frequency: ClientFrequency;
  notes: string;
}

const initialClientForm: ClientFormState = {
  name: "",
  address: "",
  frequency: "weekly",
  notes: "",
};

export default function ClientsList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { company } = useAuth();
  const companyId = company?.id;
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<ClientFormState>(initialClientForm);

  const { data: clients = [], isLoading, isError, error } = useQuery({
    queryKey: ["clients", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, address, frequency, notes")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ClientRecord[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: ClientFormState) => {
      if (!companyId) throw new Error("Empresa não encontrada para o usuário atual.");
      const base = {
        name: payload.name.trim(),
        address: payload.address.trim(),
        frequency: payload.frequency,
        notes: payload.notes.trim() || null,
        company_id: companyId,
      };
      if (payload.id) {
        const { error } = await supabase
          .from("clients")
          .update(base)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert(base);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: t("clients.title"),
        description: t("common.savedSuccessfully"),
      });
      queryClient.invalidateQueries({ queryKey: ["clients", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company-metrics", companyId] });
      setDialogOpen(false);
      setFormState(initialClientForm);
    },
    onError: (err: any) => {
      toast({
        title: t("clients.title"),
        description:
          err?.message || t("common.genericError", { defaultValue: "Erro ao salvar cliente." }),
        variant: "destructive",
      });
    },
  });

  const filteredClients = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return clients.filter((client) => {
      const haystack = `${client.name ?? ""} ${client.address ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [clients, searchQuery]);

  const getFrequencyLabel = (freq?: string | null) => {
    const labels: Record<string, string> = {
      weekly: t('clients.weekly'),
      'bi-weekly': t('clients.biweekly'),
      monthly: t('clients.monthly'),
      'one-time': t('clients.onetime'),
    };
    if (!freq) return '—';
    return labels[freq] || freq;
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormState(initialClientForm);
    }
  };

  const handleEdit = (client: ClientRecord) => {
    setFormState({
      id: client.id,
      name: client.name ?? "",
      address: client.address ?? "",
      frequency: (client.frequency as ClientFrequency) || "weekly",
      notes: client.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.address.trim()) {
      toast({
        title: t("clients.title"),
        description: t("common.requiredField"),
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(formState);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('clients.title')}</h2>
          <p className="text-muted-foreground text-sm">Manage your client locations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormState(initialClientForm)} data-testid="button-add-client">
              <Plus className="h-4 w-4 mr-2" />
              {t('clients.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formState.id ? t('common.edit') : t('clients.add')}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={handleSaveClient}>
              <div className="space-y-2">
                <Label htmlFor="client-name">{t('clients.name')}</Label>
                <Input
                  id="client-name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Johnson Residence"
                  required
                  data-testid="input-client-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-address">{t('clients.address')}</Label>
                <Input
                  id="client-address"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  placeholder="123 Main St, Manhattan, NY"
                  required
                  data-testid="input-client-address"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('clients.frequency')}</Label>
                <Select
                  value={formState.frequency}
                  onValueChange={(val: ClientFrequency) =>
                    setFormState({ ...formState, frequency: val })
                  }
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
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  placeholder="Special instructions..."
                  data-testid="textarea-client-notes"
                />
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-save-client"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.saving')}
                  </span>
                ) : (
                  t('common.save')
                )}
              </Button>
            </form>
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
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.loading')}
            </div>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              {error?.message || t('common.genericError')}
            </p>
          )}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(client)}
                        data-testid={`button-edit-client-${client.id}`}
                      >
                        {t('common.edit')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
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
