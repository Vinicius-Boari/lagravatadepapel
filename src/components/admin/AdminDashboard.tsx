/**
 * AdminDashboard Component
 * 
 * The main control center for website management.
 * Provides a tabbed interface for managing content, visual identity, media, users, and system settings.
 * Includes sidebar navigation and specialized components for each administrative task.
 */
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  Monitor,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardOverview } from "./DashboardOverview";
import { VisualIdentity } from "./VisualIdentity";
import { SiteContentEditor } from "./SiteContentEditor";
import { IntegrationsManager } from "./IntegrationsManager";
import { MediaLibrary } from "./MediaLibrary";
import { PagesRoutes } from "./PagesRoutes";
import { UserManagement } from "./UserManagement";
import { ActivityLogs } from "./ActivityLogs";
import { BackupExport } from "./BackupExport";
import { PostsManager } from "./PostsManager";

import { useSiteContent } from "@/hooks/useSiteContent";
import { toast } from "sonner";
import { Save, Loader2, Globe, Shield, Bell, Moon, Languages } from "lucide-react";
import { useSaveStatus, getSaveButtonStyles } from "@/hooks/useSaveStatus";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * AutoBackupTrigger Component
 * 
 * A background component that triggers a site backup every 5 minutes
 * while the admin dashboard is active.
 */
const AutoBackupTrigger = () => {
  useEffect(() => {
    const triggerAutoBackup = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      try {
        // We trigger it silently in the background
        await fetch("/api/public/hooks/run-backup", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Auto backup check failed", e);
      }
    };

    // Check every 5 minutes while dashboard is open, or immediately on load
    triggerAutoBackup();
    const interval = setInterval(triggerAutoBackup, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

const SettingsTab = () => {
  const { content, updateSection, loading: contentLoading } = useSiteContent();
  const { status, setSaveStatus } = useSaveStatus();
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    if (!contentLoading && content.settings) {
      setSettings(content.settings);
    } else if (!contentLoading && !content.settings) {
      setSettings({
        notifications: true,
        darkMode: true,
        language: "pt",
        maintenanceMode: false,
      });
    }
  }, [contentLoading, content]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const success = await updateSection("settings", settings);
      if (success) {
        setSaveStatus('saved');
        toast.success("Configurações salvas com sucesso!");
      } else {
        throw new Error();
      }
    } catch (err) {
      setSaveStatus('error');
      toast.error("Erro ao salvar configurações.");
    }
  };

  if (contentLoading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center bg-zinc-950/95 backdrop-blur-md z-[60] px-6 py-4 -mx-8 -mt-8 border-b border-zinc-800/80 shadow-2xl mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-red-600/10 p-2 rounded-lg">
            <Settings className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-500 leading-none">Configurações Gerais</h2>
            <p className="text-[10px] text-red-500/50 uppercase tracking-widest mt-1">Ajustes globais do painel e do site</p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          className={cn("transition-all duration-300 w-40 font-bold h-10 shadow-lg", getSaveButtonStyles(status))}
        >
          {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {status === 'saved' ? 'Salvo!' : status === 'error' ? 'Erro!' : 'Salvar Config.'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <Shield className="mr-2 w-5 h-5" /> Preferências do Painel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-red-900/10">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-red-500/50" />
                <div>
                  <p className="text-sm font-medium text-red-500">Notificações</p>
                  <p className="text-xs text-red-500/40">Receber alertas de novos logs e atividades.</p>
                </div>
              </div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={(val) => setSettings({...settings, notifications: val})} 
                className="data-[state=checked]:bg-red-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-red-900/10">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-red-500/50" />
                <div>
                  <p className="text-sm font-medium text-red-500">Modo Escuro (Interface)</p>
                  <p className="text-xs text-red-500/40">Alternar entre tema claro e escuro no painel.</p>
                </div>
              </div>
              <Switch 
                checked={settings.darkMode} 
                onCheckedChange={(val) => setSettings({...settings, darkMode: val})} 
                className="data-[state=checked]:bg-red-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-red-500 flex items-center"><Languages className="mr-2 w-4 h-4" /> Idioma do Painel</Label>
              <select 
                value={settings.language} 
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="w-full bg-zinc-800 border-red-900 text-red-500 rounded-md p-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
              >
                <option value="pt">Português (Brasil)</option>
                <option value="en">English (US)</option>
                <option value="es">Español</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <Globe className="mr-2 w-5 h-5" /> Status do Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-red-900/10">
              <div>
                <p className="text-sm font-medium text-red-500">Modo Manutenção</p>
                <p className="text-xs text-red-500/40">Bloquear acesso público ao site temporariamente.</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode} 
                onCheckedChange={(val) => setSettings({...settings, maintenanceMode: val})} 
                className="data-[state=checked]:bg-red-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-8 border-t border-zinc-800/50 pb-10">
        <Button 
          onClick={handleSave}
          size="lg"
          className={cn("transition-all duration-300 w-full max-w-md text-xl font-bold h-16 shadow-2xl shadow-red-900/20", getSaveButtonStyles(status))}
        >
          {status === 'saving' ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Save className="w-6 h-6 mr-2" />}
          {status === 'saved' ? 'Configurações Salvas!' : status === 'error' ? 'Erro ao Salvar!' : 'Salvar Todas as Configurações'}
        </Button>
      </div>
    </div>
  );
};

export function AdminDashboard() {
  const { user, role, logout, isOwner } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

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
      case "settings": return <SettingsTab />;
      case "users": return isOwner ? <UserManagement /> : <div className="p-8 text-red-500">Apenas o Dono pode acessar esta seção.</div>;
      case "logs": return <ActivityLogs />;
      case "backup": return <BackupExport />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-red-500 overflow-hidden font-sans">
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
                  ? "bg-zinc-800/50 text-red-500" 
                  : "text-zinc-500 hover:text-red-400 hover:bg-zinc-800/30"
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
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-4 font-medium text-sm text-red-500">Sair do Painel</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2 text-sm text-red-400">
            <span className="hover:text-red-300 cursor-pointer transition-colors" onClick={() => setActiveTab("dashboard")}>Início</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-red-500 font-medium">
              {menuItems.find(m => m.id === activeTab)?.label}
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-red-500">{user?.full_name || "Vinicius Boari Bataglia"}</div>
                <div className="text-[10px] text-zinc-400 mb-1">{user?.email || "viniciusbataglia500@gmail.com"}</div>
                <div className={cn(
                  "text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded inline-block",
                  isOwner ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                )}>
                  {isOwner ? "Dono" : role === "admin" ? "Administrador" : "Sem Acesso"}
                </div>
              </div>
              <div className="p-2 rounded-full bg-zinc-800 border border-zinc-700 shadow-inner">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <AutoBackupTrigger />
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
