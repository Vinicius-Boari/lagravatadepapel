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
  Loader2,
  FileArchive,
  MoreVertical,
  Check,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const listBackupsFn = useServerFn(listBackups);
  const getSettingsFn = useServerFn(getBackupSettings);
  const updateSettingsFn = useServerFn(updateBackupSettings);
  const runNowFn = useServerFn(runBackupNow);
  const restoreFn = useServerFn(restoreBackupFn);
  const deleteFn = useServerFn(deleteBackupFn);
  const getDownloadFn = useServerFn(getBackupDownloadUrl);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [backupsRes, settingsRes] = await Promise.all([
        listBackupsFn({ headers }),
        getSettingsFn({ headers }),
      ]);
      setBackups(backupsRes?.backups || []);
      setSettings(settingsRes?.settings || {
        backup_type: "Supabase (Nativo)",
        bucket_name: "backups",
        backup_path: "/data/backups",
        interval_unit: "days",
        interval_value: 1,
        retention_days: 30,
        auto_enabled: true
      });
    } catch (error: any) {
      console.error("Backup fetch error:", error);
      const errorMessage = error instanceof Response ? `Erro ${error.status}: ${error.statusText}` : error.message || "Erro desconhecido";
      toast.error(`Erro ao carregar dados de backup: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBackup = async () => {
    setIsRunningBackup(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      await toast.promise(runNowFn({ headers }), {
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

  const handleUpdateSettings = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!settings) return;

    setSaveStatus('saving');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      const dataToSave = {
        auto_enabled: !!settings.auto_enabled,
        interval_value: Number(settings.interval_value || 1),
        interval_unit: settings.interval_unit || "days",
        retention_count: Number(settings.retention_count || 10),
        retention_days: Number(settings.retention_days || 30),
        backup_type: settings.backup_type || "Supabase (Nativo)",
        bucket_name: settings.bucket_name || "backups",
        backup_path: settings.backup_path || "/data/backups"
      };

      await updateSettingsFn({ data: dataToSave, headers });

      setSaveStatus('saved');
      toast.success("Configurações de backup salvas!");
      fetchData();
    } catch (error: any) {
      setSaveStatus('error');
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este backup?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      await toast.promise(deleteFn({ data: { id }, headers }), {
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
    if (!confirm("Isso irá restaurar o sistema para este ponto. Continuar?")) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    toast.promise(restoreFn({ data: { id }, headers }), {
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      const { url } = await getDownloadFn({ data: { id }, headers });
      if (url) window.open(url, '_blank');
      else toast.error("URL de download não disponível.");
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
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Backup</h2>
          <p className="text-zinc-400 text-sm">Gerencie as cópias de segurança do seu sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRunBackup} 
            disabled={isRunningBackup}
            variant="outline"
            className="border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
          >
            {isRunningBackup ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Backup Agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Card */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-4">
            <CardTitle className="text-zinc-100 text-lg flex items-center">
              Configurações de Backup
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Configure como seus backups devem ser realizados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Tipo de Backup</Label>
                <Select 
                  value={settings?.backup_type || "Supabase (Nativo)"} 
                  onValueChange={(val) => setSettings((prev: any) => ({ ...prev, backup_type: val }))}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectItem value="Supabase (Nativo)">Supabase (Nativo)</SelectItem>
                    <SelectItem value="Externo (S3)">Externo (S3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Bucket do Supabase</Label>
                <Input 
                  value={settings?.bucket_name || ""}
                  onChange={(e) => setSettings((prev: any) => ({ ...prev, bucket_name: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  placeholder="backups"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Caminho do Backup</Label>
                <Input 
                  value={settings?.backup_path || ""}
                  onChange={(e) => setSettings((prev: any) => ({ ...prev, backup_path: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  placeholder="/data/backups"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Frequência</Label>
                <Select 
                  value={settings?.interval_unit === "days" ? "daily" : "hours"} 
                  onValueChange={(val) => setSettings((prev: any) => ({ 
                    ...prev, 
                    interval_unit: val === "daily" ? "days" : "hours",
                    interval_value: val === "daily" ? 1 : 4
                  }))}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="hours">A cada 4 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Retenção (dias)</Label>
                <Input 
                  type="number"
                  value={settings?.retention_days || ""}
                  onChange={(e) => setSettings((prev: any) => ({ ...prev, retention_days: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  placeholder="30"
                />
              </div>

              <div className="flex items-end pb-1">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-enabled"
                    checked={!!settings?.auto_enabled} 
                    onCheckedChange={(val) => setSettings((prev: any) => ({ ...prev, auto_enabled: val }))}
                  />
                  <Label htmlFor="auto-enabled" className="text-zinc-300 cursor-pointer">Backup Automático</Label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                onClick={handleUpdateSettings}
                className={cn("w-full transition-all duration-300", 
                  status === 'saved' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                )}
                disabled={status === 'saving'}
              >
                {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {status === 'saved' ? 'Configurações Salvas!' : 'Salvar Configurações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backups Recentes Card */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-4">
            <CardTitle className="text-zinc-100 text-lg flex items-center">
              Backups Recentes
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Histórico das últimas cópias de segurança realizadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium">Data</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Tamanho</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-center">Status</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                      Nenhum backup encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  backups.map((b) => (
                    <TableRow key={b.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                      <TableCell className="text-zinc-300 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{b.created_at ? format(new Date(b.created_at), "dd/MM/yyyy") : "N/A"}</span>
                          <span className="text-[10px] text-zinc-500">{b.created_at ? format(new Date(b.created_at), "HH:mm") : ""}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300">{formatSize(b.size_bytes)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {b.status === "completed" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                              <Check className="w-3 h-3 mr-1" /> Sucesso
                            </span>
                          ) : b.status === "failed" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                              <X className="w-3 h-3 mr-1" /> Falha
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                              <Clock className="w-3 h-3 mr-1" /> Pendente
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                            onClick={() => handleDownload(b.id)}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-400 hover:text-blue-400"
                            onClick={() => handleRestore(b.id)}
                            title="Restaurar"
                          >
                            <RefreshCcw className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-400 hover:text-red-500"
                            onClick={() => handleDelete(b.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
