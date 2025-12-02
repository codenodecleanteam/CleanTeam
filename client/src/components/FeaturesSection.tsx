import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Smartphone, FileText } from 'lucide-react';

const featureIcons = {
  scheduling: Calendar,
  clients: Users,
  mobile: Smartphone,
  reports: FileText,
};

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = ['scheduling', 'clients', 'mobile', 'reports'] as const;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          {t('features.title')}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((key) => {
            const Icon = featureIcons[key];
            return (
              <Card key={key} className="hover-elevate" data-testid={`card-feature-${key}`}>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(`features.${key}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
