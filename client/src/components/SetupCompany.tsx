import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

export function SetupCompany() {
  const { t } = useTranslation();
  const { pendingSetupUser, completeOnboarding } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast({
        title: t("cleaners.title"),
        description: t("common.requiredField"),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await completeOnboarding({
        companyName: companyName.trim(),
        ownerName: ownerName.trim() || pendingSetupUser?.email?.split("@")[0],
      });
      toast({
        title: t("auth.signup"),
        description: t("auth.signupSuccess"),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: t("common.genericError"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{t("auth.companyName")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("common.requiredField")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setup-company">{t("auth.companyName")}</Label>
              <Input
                id="setup-company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Minha Empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup-name">{t("auth.name")}</Label>
              <Input
                id="setup-name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder={pendingSetupUser?.email || "Maria Silva"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.saving") : t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
