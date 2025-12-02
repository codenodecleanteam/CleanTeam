import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Users, Home, Calendar, FileText, Settings, Sparkles } from 'lucide-react';

type ActiveView = 'overview' | 'cleaners' | 'clients' | 'schedule' | 'reports' | 'settings';

interface AdminSidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  companyName?: string;
}

export default function AdminSidebar({ activeView, onViewChange, companyName = 'My Company' }: AdminSidebarProps) {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'overview' as const, label: t('dashboard.overview'), icon: LayoutDashboard },
    { id: 'cleaners' as const, label: t('dashboard.cleaners'), icon: Users },
    { id: 'clients' as const, label: t('dashboard.clients'), icon: Home },
    { id: 'schedule' as const, label: t('dashboard.schedule'), icon: Calendar },
    { id: 'reports' as const, label: t('dashboard.reports'), icon: FileText },
    { id: 'settings' as const, label: t('dashboard.settings'), icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">CleanTeams</span>
            <span className="text-xs text-muted-foreground truncate">{companyName}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    data-testid={`nav-${item.id}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
