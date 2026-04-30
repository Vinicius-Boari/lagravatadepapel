import { useState, useEffect } from "react";
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
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
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
  console.log("[BackupExport] rendering");
  const [backups, setBackups] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Custom token from localStorage as used in useAuth hook
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
    if (!adminToken) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    setIsUpdatingSettings(true);
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
      toast.success("Configurações salvas com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este backup permanentemente? Esta ação não pode ser desfeita.")) {
      return;
    }

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
    } catch (error) {
      // toast.promise handles it
    }
  };

  const handleRestore = async (id: string) => {
    const adminToken = getAdminToken();
    toast.promise(restoreFn({ data: { adminToken, id } }), {
      loading: "Restaurando sistema (isso pode levar alguns segundos)...",
      success: () => {
        setTimeout(() => window.location.reload(), 2000);
        return "Sistema restaurado com sucesso! A página será recarregada.";
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Backup e Restauração</h2>
          <p className="text-red-500/70">Mantenha seus dados seguros com backups automáticos e manuais.</p>
        </div>
        <Button 
          onClick={handleRunBackup} 
          disabled={isRunningBackup}
          className="bg-red-600 hover:bg-red-700 text-white font-bold"
        >
          {isRunningBackup ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
          Executar Backup Agora
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center text-lg">
              <Settings className="mr-2 w-5 h-5" /> Configurações
            </CardTitle>
            <CardDescription className="text-red-500/60">Configure o agendamento automático.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-3 bg-zinc-800/50 rounded-lg border border-red-900/10">
              <div className="space-y-0.5">
                <Label className="text-red-500 font-bold">Backup Automático</Label>
                <p className="text-[10px] text-zinc-500">Ativa a execução em segundo plano.</p>
              </div>
              <Switch 
                checked={!!settings?.auto_enabled} 
                onCheckedChange={(val) => setSettings((prev: any) => ({ ...(prev || {}), auto_enabled: val }))}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-red-500/70 font-bold uppercase tracking-wider">Intervalo entre Backups</Label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={settings?.interval_value ?? ""}
                  onChange={(e) => setSettings((prev: any) => ({ ...(prev || {}), interval_value: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-red-500 focus:border-red-500 w-20"
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

            <div className="space-y-3">
              <Label className="text-xs text-red-500/70 font-bold uppercase tracking-wider">Política de Retenção</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={settings?.retention_count ?? ""}
                    onChange={(e) => setSettings((prev: any) => ({ ...(prev || {}), retention_count: e.target.value }))}
                    className="bg-zinc-950 border-zinc-800 text-red-500 focus:border-red-500 w-20"
                  />
                  <span className="text-xs text-zinc-500">últimos backups</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40"
              onClick={handleUpdateSettings}
              disabled={isUpdatingSettings}
            >
              {isUpdatingSettings && <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Configurações
            </Button>

            {settings?.next_run_at && settings.auto_enabled && (
              <div className="p-3 bg-red-900/5 rounded-lg border border-red-900/10 flex items-center space-x-3">
                <Clock className="w-4 h-4 text-red-500/50" />
                <div className="text-[10px]">
                  <p className="text-zinc-500">Próximo backup agendado para:</p>
                  <p className="text-red-500 font-medium">
                    {format(new Date(settings.next_run_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center text-lg">
              <History className="mr-2 w-5 h-5" /> Histórico de Backups
            </CardTitle>
            <CardDescription className="text-red-500/60">Lista de versões salvas no storage.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backups.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 italic text-sm">
                  Nenhum backup encontrado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                        <th className="pb-3 pl-2 font-bold">Data / Hora</th>
                        <th className="pb-3 font-bold">Origem</th>
                        <th className="pb-3 font-bold">Tamanho</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 text-right pr-2 font-bold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {backups.map((b) => (
                        <tr key={b.id} className="group hover:bg-zinc-800/20 transition-colors">
                          <td className="py-4 pl-2 font-medium">
                            <div className="text-red-500">{b.created_at ? format(new Date(b.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "N/A"}</div>
                            <div className="text-[10px] text-zinc-600 font-mono">{b.id.split('-')[0]}...</div>
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase",
                              b.trigger === 'auto' ? "border-blue-900/30 text-blue-500 bg-blue-900/10" : "border-red-900/30 text-red-500 bg-red-900/10"
                            )}>
                              {b.trigger === 'auto' ? 'Automático' : 'Manual'}
                            </span>
                          </td>
                          <td className="py-4 text-zinc-400">
                            {formatSize(b.size_bytes)}
                          </td>
                          <td className="py-4">
                            {b.status === 'success' && (
                              <div className="flex items-center text-green-500 text-xs font-bold">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Sucesso
                              </div>
                            )}
                            {b.status === 'processing' && (
                              <div className="flex items-center text-blue-500 text-xs font-bold animate-pulse">
                                <RefreshCcw className="w-3 h-3 mr-1 animate-spin" /> Processando
                              </div>
                            )}
                            {b.status === 'error' && (
                              <div className="flex items-center text-red-600 text-xs font-bold" title={b.error_message}>
                                <AlertCircle className="w-3 h-3 mr-1" /> Falha
                              </div>
                            )}
                          </td>
                          <td className="py-4 text-right pr-2">
                            <div className="flex items-center justify-end space-x-1">
                              {b.status === 'success' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                    onClick={() => handleDownload(b.id)}
                                    title="Baixar Backup"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                        title="Restaurar"
                                      >
                                        <Upload className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-red-500">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Restaurar este backup?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-500">
                                          Esta ação é irreversível e substituirá todos os dados atuais (páginas, posts, mídias e configurações) pelos dados deste backup de {b.created_at ? format(new Date(b.created_at), "dd/MM/yyyy HH:mm") : "data desconhecida"}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-red-500 hover:bg-zinc-700">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-red-600 text-white hover:bg-red-700 font-bold"
                                          onClick={() => handleRestore(b.id)}
                                        >
                                          Sim, Restaurar Agora
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                onClick={() => handleDelete(b.id)}
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl border-l-4 border-l-red-600">
           <CardContent className="pt-6 flex items-start space-x-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Database className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h4 className="font-bold">Dados Protegidos</h4>
                <p className="text-xs text-zinc-500 mt-1">O backup inclui posts do instagram, páginas, configurações e mídias.</p>
              </div>
           </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl border-l-4 border-l-blue-600">
           <CardContent className="pt-6 flex items-start space-x-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold">Agendamento Inteligente</h4>
                <p className="text-xs text-zinc-500 mt-1">O sistema roda em segundo plano mesmo com o painel fechado.</p>
              </div>
           </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl border-l-4 border-l-green-600">
           <CardContent className="pt-6 flex items-start space-x-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <History className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-bold">Política de Retenção</h4>
                <p className="text-xs text-zinc-500 mt-1">Limpamos backups antigos automaticamente para economizar espaço.</p>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
