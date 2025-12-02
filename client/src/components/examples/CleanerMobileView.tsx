import CleanerMobileView from '../CleanerMobileView';
import '@/lib/i18n';

export default function CleanerMobileViewExample() {
  return <CleanerMobileView cleanerName="Maria Santos" onLogout={() => console.log('Logout')} />;
}
