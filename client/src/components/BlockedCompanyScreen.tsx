import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface BlockedCompanyScreenProps {
  onLogout: () => Promise<void> | void;
}

export function BlockedCompanyScreen({ onLogout }: BlockedCompanyScreenProps) {
  const { t } = useTranslation();

  const handleLogoutClick = async () => {
    await onLogout();
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle>{t("companyBlocked.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("companyBlocked.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("companyBlocked.description")}
          </p>
          <Button className="w-full" onClick={handleLogoutClick}>
            {t("companyBlocked.cta")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
