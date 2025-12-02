import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from '../AdminSidebar';
import '@/lib/i18n';

export default function AdminSidebarExample() {
  const [activeView, setActiveView] = useState<'overview' | 'cleaners' | 'clients' | 'schedule' | 'reports' | 'settings'>('overview');
  
  return (
    <SidebarProvider>
      <AdminSidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        companyName="Sparkle Clean NYC"
      />
    </SidebarProvider>
  );
}
