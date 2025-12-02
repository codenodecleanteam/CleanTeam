import SuperAdminDashboard from '../SuperAdminDashboard';
import '@/lib/i18n';

export default function SuperAdminDashboardExample() {
  return <SuperAdminDashboard onLogout={() => console.log('Logout clicked')} />;
}
