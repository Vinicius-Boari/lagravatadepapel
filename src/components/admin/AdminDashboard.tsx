import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Palette, 
  Image as ImageIcon, 
  FileText, 
  Instagram, 
  Link as LinkIcon, 
  Settings, 
  Users, 
  History, 
  Database,
  LogOut,
  Menu,
  ChevronRight,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sub-components (placeholders for now to avoid massive file)
const DashboardOverview = () => <div className="p-6">Dashboard Overview Content</div>;
const VisualIdentity = () => <div className="p-6">Visual Identity Content</div>;
const MediaLibrary = () => <div className="p-6">Media Library Content</div>;
const SiteContent = () => <div className="p-6">Site Content Editor</div>;
const InstagramIntegration = () => <div className="p-6">Instagram API Settings</div>;
const ExternalIntegrations = () => <div className="p-6">Google Analytics, Pixel, etc.</div>;
const PagesRoutes = () => <div className="p-6">Pages and Redirects</div>;
const SiteSettings = () => <div className="p-6">Global Settings</div>;
const UserManagement = () => <div className="p-6">Manage Administrators (Owner Only)</div>;
const ActivityLogs = () => <div className="p-6">Activity History</div>;
const BackupExport = () => <div className="p-6">JSON Backup and Export</div>;

export function AdminDashboard() {
  const { user, role, logout, isOwner } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "visual", label: "Identidade Visual", icon: Palette },
    { id: "media", label: "Mídia", icon: ImageIcon },
    { id: "content", label: "Conteúdo", icon: FileText },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "integrations", label: "Integrações", icon: LinkIcon },
    { id: "pages", label: "Páginas", icon: FileText },
    { id: "settings", label: "Configurações", icon: Settings },
    ...(isOwner ? [{ id: "users", label: "Gestão de Usuários", icon: Users }] : []),
    { id: "logs", label: "Log de Atividades", icon: History },
    { id: "backup", label: "Backup", icon: Database },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardOverview />;
      case "visual": return <VisualIdentity />;
      case "media": return <MediaLibrary />;
      case "content": return <SiteContent />;
      case "instagram": return <InstagramIntegration />;
      case "integrations": return <ExternalIntegrations />;
      case "pages": return <PagesRoutes />;
      case "settings": return <SiteSettings />;
      case "users": return isOwner ? <UserManagement /> : null;
      case "logs": return <ActivityLogs />;
      case "backup": return <BackupExport />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col border-r border-zinc-800 bg-zinc-900 transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-zinc-800">
          <div className={cn("font-bold text-lg overflow-hidden whitespace-nowrap", !sidebarOpen && "hidden")}>
            Admin Panel
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center px-6 py-3 transition-colors",
                activeTab === item.id 
                  ? "bg-zinc-800 text-zinc-100 border-r-2 border-white" 
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              )}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="ml-4 font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center px-4 py-3 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-4 font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2 text-sm text-zinc-400">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-100 font-medium">
              {menuItems.find(m => m.id === activeTab)?.label}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right mr-2">
              <div className="text-sm font-medium text-zinc-100">{user?.full_name}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                {role === "owner" ? "Dono" : "Administrador"}
              </div>
            </div>
            <div className="p-2 rounded-full bg-zinc-800 border border-zinc-700">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}