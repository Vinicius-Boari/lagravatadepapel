import { useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { 
  Database, 
  Download, 
  Upload, 
  History, 
  RefreshCcw,
  Settings, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Save,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useSaveStatus, getSaveButtonStyles } from "@/hooks/useSaveStatus";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  listBackups, 
  getBackupSettings, 
  updateBackupSettings, 
  runBackupNow, 
  restoreBackupFn, 
  deleteBackupFn,
  getBackupDownloadUrl
} from "@/server/backup.functions";

export function BackupExport() {
  const [backups, setBackups] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  
  const { status, setSaveStatus } = useSaveStatus();

  const getAdminToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("lg_auth_token") || "";
  };

  const listBackupsFn = useServerFn(listBackups);
  const getSettingsFn = useServerFn(getBackupSettings);
  const updateSettingsFn = useServerFn(updateBackupSettings);
  const runNowFn = useServerFn(runBackupNow);
  const restoreFn = useServerFn(restoreBackupFn);
  const deleteFn = useServerFn(deleteBackupFn);
  const getDownloadFn = useServerFn(getBackupDownloadUrl);

  const fetchData = async () => {
    try {
      const adminToken = getAdminToken();
      if (!adminToken) {
        setIsLoading(false);
        return;
      }

      const [backupsRes, settingsRes] = await Promise.all([
        listBackupsFn({ data: { adminToken } }),
        getSettingsFn({ data: { adminToken } })
      ]);
      setBackups(backupsRes.backups || []);
      setSettings(settingsRes.settings || null);
    } catch (error: any) {
      console.error("Backup fetch error:", error);
      toast.error("Erro ao carregar dados de backup.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBackup = async () => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    setIsRunningBackup(true);
    try {
      await toast.promise(runNowFn({ data: { adminToken } }), {
        loading: "Iniciando backup...",
        success: () => {
          fetchData();
          return "Backup concluído com sucesso!";
        },
        error: (err) => {
          fetchData();
          return `Erro ao executar backup: ${err.message}`;
        }
      });
    } finally {
      setIsRunningBackup(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;
    const adminToken = getAdminToken();
    if (!adminToken) return;

    setSaveStatus('saving');
    try {
      await updateSettingsFn({ data: {
        adminToken,
        data: {
          auto_enabled: !!settings.auto_enabled,
          interval_value: Number(settings.interval_value || 1),
          interval_unit: settings.interval_unit || "hours",
          retention_count: Number(settings.retention_count || 1),
          retention_days: settings.retention_days ? Number(settings.retention_days) : null
        }
      }});
      setSaveStatus('saved');
      toast.success("Configurações de backup salvas!");
      fetchData();
    } catch (error: any) {
      setSaveStatus('error');
      console.error("Error saving backup settings:", error);
      toast.error("Erro ao salvar configurações.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este backup permanentemente?")) return;

    const adminToken = getAdminToken();
    try {
      await toast.promise(deleteFn({ data: { adminToken, id } }), {
        loading: "Excluindo backup...",
        success: () => {
          fetchData();
          return "Backup excluído.";
        },
        error: (err) => `Erro ao excluir backup: ${err.message}`
      });
    } catch (error) {}
  };

  const handleRestore = async (id: string) => {
    const adminToken = getAdminToken();
    toast.promise(restoreFn({ data: { adminToken, id } }), {
      loading: "Restaurando sistema...",
      success: () => {
        setTimeout(() => window.location.reload(), 2000);
        return "Sistema restaurado com sucesso!";
      },
      error: (err) => `Erro na restauração: ${err.message}`
    });
  };

  const handleDownload = async (id: string) => {
    try {
      const adminToken = getAdminToken();
      const { url } = await getDownloadFn({ data: { adminToken, id } });
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Erro ao gerar link de download.");
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20 text-red-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 md:top-16 bg-zinc-950/80 backdrop-blur-sm z-50 py-4 -mt-4 border-b border-zinc-800/50 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Backup e Restauração</h2>
          <p className="text-red-500/70">Mantenha seus dados seguros.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleRunBackup} 
            disabled={isRunningBackup}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isRunningBackup ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
            Backup Agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-500 flex items-center text-lg">
                <Settings className="mr-2 w-5 h-5" /> Configurações
              </CardTitle>
            </div>
            <Button 
              onClick={handleUpdateSettings}
              className={cn("transition-all duration-300 w-32", getSaveButtonStyles(status))}
            >
              {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {status === 'saved' ? 'Salvo!' : status === 'error' ? 'Erro!' : 'Salvar'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-red-900/10">
              <Label className="text-red-500 font-bold">Backup Automático</Label>
              <Switch 
                checked={!!settings?.auto_enabled} 
                onCheckedChange={(val) => setSettings((prev: any) => ({ ...(prev || {}), auto_enabled: val }))}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-red-500/70 font-bold">Intervalo</Label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={settings?.interval_value ?? ""}
                  onChange={(e) => setSettings((prev: any) => ({ ...(prev || {}), interval_value: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-red-500 w-20"
                />
                <Select 
                  value={settings?.interval_unit || "hours"} 
                  onValueChange={(val) => setSettings((prev: any) => ({ ...(prev || {}), interval_unit: val }))}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-red-500">
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center text-lg">
              <History className="mr-2 w-5 h-5" /> Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backups.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 bg-zinc-800/20 rounded-lg border border-zinc-800">
                  <div>
                    <div className="text-red-500 font-bold">{b.created_at ? format(new Date(b.created_at), "dd/MM/yyyy HH:mm") : "N/A"}</div>
                    <div className="text-[10px] text-zinc-500">{formatSize(b.size_bytes)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(b.id)}><Download className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRestore(b.id)}><RefreshCcw className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
