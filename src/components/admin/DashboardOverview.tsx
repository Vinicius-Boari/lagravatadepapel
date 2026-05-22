import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { 
  Users, 
  History, 
  Globe, 
  TrendingUp, 
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function DashboardOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalLogs: 0,
    siteStatus: "Online",
    lastUpdate: "---"
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [backupSettings, setBackupSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async (isMounted = true) => {
    try {
      const [adminsRes, logsRes, recentLogsRes, backupRes] = await Promise.all([
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).in("role", ["admin", "owner"]),
        supabase.from("admin_logs").select("id", { count: "exact", head: true }),
        supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("backup_settings").select("*").maybeSingle()
      ]);

      if (isMounted) {
        setStats({
          totalAdmins: adminsRes.count || 0,
          totalLogs: logsRes.count || 0,
          siteStatus: "Online",
          lastUpdate: recentLogsRes.data?.[0]?.created_at 
            ? new Date(recentLogsRes.data[0].created_at).toLocaleString('pt-BR') 
            : "---"
        });

        setRecentLogs(recentLogsRes.data || []);
        setBackupSettings(backupRes.data);
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);


  useEffect(() => {
    let isMounted = true;
    
    loadStats(isMounted);

    const logsChannel = supabase
      .channel('dashboard-logs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_logs' },
        () => loadStats(isMounted)
      )
      .subscribe();

    const backupsChannel = supabase
      .channel('dashboard-backups-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'backup_settings' },
        () => loadStats(isMounted)
      )
      .subscribe();
    
    return () => {
      isMounted = false;
      supabase.removeChannel(logsChannel);
      supabase.removeChannel(backupsChannel);
    };
  }, [loadStats]);


  const cards = [
    { title: "Total de Administradores", value: stats.totalAdmins, icon: Users, color: "text-red-500" },
    { title: "Logs de Atividades", value: stats.totalLogs, icon: History, color: "text-red-500" },
    { title: "Status do Site", value: stats.siteStatus, icon: Globe, color: "text-red-500" },
    { title: "Última Alteração", value: stats.lastUpdate, icon: Clock, color: "text-zinc-400", isDate: true },
  ];

  if (loading) return <div className="p-8 text-red-500 flex items-center gap-2"><Loader2 className="animate-spin" /> Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-400">{card.title}</CardTitle>
              <card.icon className={cn("w-4 h-4", card.color)} />
            </CardHeader>
            <CardContent>
              <div className={cn("font-bold text-red-500", card.isDate ? "text-sm" : "text-2xl")}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800/50">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 w-5 h-5 text-red-400" />
            <span className="text-red-500">Cron Jobs (Monitoramento)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow className="hover:bg-transparent border-zinc-800">
                <TableHead className="text-red-400">Tarefa</TableHead>
                <TableHead className="text-red-400">Frequência</TableHead>
                <TableHead className="text-red-400">Última Execução</TableHead>
                <TableHead className="text-red-400">Próxima Execução</TableHead>
                <TableHead className="text-red-400 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                <TableCell className="font-medium text-red-300">Backup Automático Diário</TableCell>
                <TableCell className="text-zinc-400">
                  {backupSettings ? `${backupSettings.interval_value} ${backupSettings.interval_unit === 'days' ? 'dia(s)' : 'hora(s)'}` : 'Diário'}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {backupSettings?.last_run_at ? new Date(backupSettings.last_run_at).toLocaleString('pt-BR') : '---'}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {backupSettings?.next_run_at ? new Date(backupSettings.next_run_at).toLocaleString('pt-BR') : '---'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={cn(
                    "font-bold",
                    backupSettings?.auto_enabled ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {backupSettings?.auto_enabled ? "Ativo" : "Desativado"}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 w-5 h-5 text-red-400" />
              <span className="text-red-500">Resumo de Acessos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-red-500/70 italic text-center">
            Gráfico de acessos em breve (Integração Google Analytics)
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <History className="mr-2 w-5 h-5 text-red-400" />
              <span className="text-red-500">Últimas Ações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-red-400">Usuário</TableHead>
                  <TableHead className="text-red-400">Ação</TableHead>
                  <TableHead className="text-red-400">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-red-300">{log.user_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-red-300 capitalize">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-red-400/70 text-xs">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
                {recentLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-zinc-500 py-8 italic">
                      Nenhuma atividade registrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
