import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, Car, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

type CleanerStatus = "active" | "inactive";
type CleanerLanguage = "en" | "pt" | "es";

interface CleanerRecord {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  language: CleanerLanguage | null;
  drives: boolean;
  status: CleanerStatus;
  area: string | null;
}

interface CleanerFormState {
  id?: string;
  name: string;
  phone: string;
  email: string;
  language: CleanerLanguage;
  drives: boolean;
  area: string;
  status: CleanerStatus;
}

const initialFormState: CleanerFormState = {
  name: "",
  phone: "",
  email: "",
  language: "en",
  drives: false,
  area: "",
  status: "active",
};

export default function CleanersList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { company } = useAuth();
  const companyId = company?.id;
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<CleanerFormState>(initialFormState);

  const { data: cleaners = [], isLoading, isError, error } = useQuery({
    queryKey: ["cleaners", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("cleaners")
        .select("id, name, phone, email, language, drives, status, area")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CleanerRecord[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: CleanerFormState) => {
      if (!companyId) throw new Error("Empresa não encontrada para o usuário atual.");
      const baseData = {
        name: payload.name.trim(),
        phone: payload.phone.trim() || null,
        email: payload.email.trim() || null,
        language: payload.language,
        drives: payload.drives,
        status: payload.status,
        area: payload.area.trim() || null,
        company_id: companyId,
      };

      if (payload.id) {
        const { error } = await supabase
          .from("cleaners")
          .update(baseData)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cleaners").insert(baseData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: t("cleaners.title"),
        description: t("common.savedSuccessfully"),
      });
      queryClient.invalidateQueries({ queryKey: ["cleaners", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company-metrics", companyId] });
      setDialogOpen(false);
      setFormState(initialFormState);
    },
    onError: (err: any) => {
      const message =
        err?.message || t("common.genericError", { defaultValue: "Erro ao salvar dados." });
      toast({
        title: t("cleaners.title"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const filteredCleaners = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return cleaners.filter((cleaner) => {
      const haystack = `${cleaner.name ?? ""} ${cleaner.area ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [cleaners, searchQuery]);

  const getLanguageLabel = (code?: string | null) => {
    const labels: Record<string, string> = {
      en: "English",
      pt: "Português",
      es: "Español",
    };
    if (!code) return "—";
    return labels[code] || code;
  };

  const handleDialogToggle = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormState(initialFormState);
    }
  };

  const handleEdit = (cleaner: CleanerRecord) => {
    setFormState({
      id: cleaner.id,
      name: cleaner.name ?? "",
      phone: cleaner.phone ?? "",
      email: cleaner.email ?? "",
      language: (cleaner.language as CleanerLanguage) || "en",
      drives: cleaner.drives,
      area: cleaner.area ?? "",
      status: cleaner.status,
    });
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      toast({
        title: t("cleaners.title"),
        description: t("common.requiredField"),
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(formState);
  };

  if (!companyId) {
    return (
      <Alert>
        <AlertTitle>{t("cleaners.title")}</AlertTitle>
        <AlertDescription>
          {t("common.companyAccessRequired", {
            defaultValue: "Disponível apenas para administradores de empresa.",
          })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('cleaners.title')}</h2>
          <p className="text-muted-foreground text-sm">Manage your cleaning team members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogToggle}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormState(initialFormState)} data-testid="button-add-cleaner">
              <Plus className="h-4 w-4 mr-2" />
              {t('cleaners.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {formState.id ? t('common.edit') : t('cleaners.add')}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={handleSave}>
              <div className="space-y-2">
                <Label htmlFor="cleaner-name">{t('cleaners.name')}</Label>
                <Input
                  id="cleaner-name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                  data-testid="input-cleaner-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaner-phone">{t('cleaners.phone')}</Label>
                <Input
                  id="cleaner-phone"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  data-testid="input-cleaner-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaner-email">{t('cleaners.email')}</Label>
                <Input
                  id="cleaner-email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  data-testid="input-cleaner-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaner-area">{t('cleaners.area')}</Label>
                <Input
                  id="cleaner-area"
                  value={formState.area}
                  onChange={(e) => setFormState({ ...formState, area: e.target.value })}
                  placeholder="Manhattan, Brooklyn..."
                  data-testid="input-cleaner-area"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('cleaners.language')}</Label>
                <Select
                  value={formState.language}
                  onValueChange={(val: CleanerLanguage) => setFormState({ ...formState, language: val })}
                >
                  <SelectTrigger data-testid="select-cleaner-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('cleaners.status')}</Label>
                <Select
                  value={formState.status}
                  onValueChange={(val: CleanerStatus) => setFormState({ ...formState, status: val })}
                >
                  <SelectTrigger data-testid="select-cleaner-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('cleaners.active')}</SelectItem>
                    <SelectItem value="inactive">{t('cleaners.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cleaner-drives">{t('cleaners.drives')}</Label>
                <Switch
                  id="cleaner-drives"
                  checked={formState.drives}
                  onCheckedChange={(checked) => setFormState({ ...formState, drives: checked })}
                  data-testid="switch-cleaner-drives"
                />
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-save-cleaner"
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
              data-testid="input-search-cleaners"
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
                        {cleaner.phone || '—'}
                      </div>
                    </TableCell>
                    <TableCell>{getLanguageLabel(cleaner.language)}</TableCell>
                    <TableCell>{cleaner.area || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={cleaner.status === 'active' ? 'default' : 'secondary'}>
                        {cleaner.status === 'active' ? t('cleaners.active') : t('cleaners.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(cleaner)}
                        data-testid={`button-edit-cleaner-${cleaner.id}`}
                      >
                        {t('common.edit')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredCleaners.length === 0 && (
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
    </div>
  );
}
