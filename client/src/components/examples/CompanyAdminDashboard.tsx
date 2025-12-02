import CompanyAdminDashboard from '../CompanyAdminDashboard';
import '@/lib/i18n';

export default function CompanyAdminDashboardExample() {
  return (
    <CompanyAdminDashboard 
      companyName="Sparkle Clean NYC" 
      trialDaysLeft={22}
      onLogout={() => console.log('Logout')}
    />
  );
}
