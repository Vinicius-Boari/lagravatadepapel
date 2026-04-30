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
  User,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardOverview } from "./DashboardOverview";
import { VisualIdentity } from "./VisualIdentity";
import { SiteContentEditor } from "./SiteContentEditor";
import { IntegrationsManager } from "./IntegrationsManager";

// Still placeholders for these more specialized tabs
const MediaLibrary = () => <div className="p-8 text-zinc-400 animate-in slide-in-from-bottom-2 duration-300">Biblioteca de Mídia - Funcionalidade de upload e gestão de arquivos em breve.</div>;
const PagesRoutes = () => <div className="p-8 text-zinc-400 animate-in slide-in-from-bottom-2 duration-300">Páginas e Rotas - Gestão de slugs e redirecionamentos em breve.</div>;
const UserManagement = () => <div className="p-8 text-zinc-400 animate-in slide-in-from-bottom-2 duration-300">Gestão de Usuários - Lista de administradores e criação de novas contas em breve.</div>;
const ActivityLogs = () => <div className="p-8 text-zinc-400 animate-in slide-in-from-bottom-2 duration-300">Log de Atividades - Histórico detalhado de alterações.</div>;
const BackupExport = () => <div className="p-8 text-zinc-400 animate-in slide-in-from-bottom-2 duration-300">Backup e Exportação - Salvar configurações do site em JSON.</div>;

export function AdminDashboard() {
  const { user, role, logout, isOwner } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "visual", label: "Identidade Visual", icon: Palette },
    { id: "content", label: "Conteúdo do Site", icon: FileText },
    { id: "media", label: "Mídia / Fotos e Vídeos", icon: ImageIcon },
    { id: "integrations", label: "Integrações e APIs", icon: Instagram },
    { id: "pages", label: "Páginas e Rotas", icon: LinkIcon },
    { id: "settings", label: "Configurações", icon: Settings },
    ...(isOwner ? [{ id: "users", label: "Gestão de Usuários", icon: Users }] : []),
    { id: "logs", label: "Log de Atividades", icon: History },
    { id: "backup", label: "Backup", icon: Database },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardOverview />;
      case "visual": return <VisualIdentity />;
      case "content": return <SiteContentEditor />;
      case "media": return <MediaLibrary />;
      case "integrations": return <IntegrationsManager />;
      case "pages": return <PagesRoutes />;
      case "settings": return <ActivityLogs />; // Placeholder for now
      case "users": return isOwner ? <UserManagement /> : null;
      case "logs": return <ActivityLogs />;
      case "backup": return <BackupExport />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col border-r border-zinc-800 bg-zinc-900 transition-all duration-300 ease-in-out z-50",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-zinc-800">
          <div className={cn("font-bold text-lg overflow-hidden whitespace-nowrap flex items-center", !sidebarOpen && "hidden")}>
            <Monitor className="mr-2 w-5 h-5 text-red-500" />
            Painel Admin
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-zinc-800">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center px-6 py-3 transition-all relative group",
                activeTab === item.id 
                  ? "bg-zinc-800/50 text-white" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30"
              )}
            >
              {activeTab === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />}
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-red-500" : "group-hover:text-zinc-300")} />
              {sidebarOpen && <span className="ml-4 font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-4 font-medium text-sm">Sair do Painel</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors" onClick={() => setActiveTab("dashboard")}>Início</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-100 font-medium">
              {menuItems.find(m => m.id === activeTab)?.label}
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-zinc-100">{user?.full_name}</div>
                <div className={cn(
                  "text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded",
                  role === "owner" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {role === "owner" ? "Dono" : "Administrador"}
                </div>
              </div>
              <div className="p-2 rounded-full bg-zinc-800 border border-zinc-700 shadow-inner">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}