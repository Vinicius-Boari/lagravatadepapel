import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Eye, 
  History, 
  Globe, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
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
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalLogs: 0,
    siteStatus: "Online",
    lastUpdate: "---"
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [adminsRes, logsRes, recentLogsRes] = await Promise.all([
          supabase.from("admin_users").select("id", { count: "exact", head: true }),
          supabase.from("admin_logs").select("id", { count: "exact", head: true }),
          supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(5)
        ]);

        setStats({
          totalAdmins: adminsRes.count || 0,
          totalLogs: logsRes.count || 0,
          siteStatus: "Online",
          lastUpdate: recentLogsRes.data?.[0]?.created_at 
            ? new Date(recentLogsRes.data[0].created_at).toLocaleString('pt-BR') 
            : "---"
        });

        setRecentLogs(recentLogsRes.data || []);
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { title: "Total de Administradores", value: stats.totalAdmins, icon: Users, color: "text-blue-500" },
    { title: "Logs de Atividades", value: stats.totalLogs, icon: History, color: "text-purple-500" },
    { title: "Status do Site", value: stats.siteStatus, icon: Globe, color: "text-green-500" },
    { title: "Última Alteração", value: stats.lastUpdate, icon: Clock, color: "text-zinc-400", isDate: true },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{card.title}</CardTitle>
              <card.icon className={cn("w-4 h-4", card.color)} />
            </CardHeader>
            <CardContent>
              <div className={cn("font-bold", card.isDate ? "text-sm" : "text-2xl")}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 w-5 h-5 text-zinc-400" />
              Resumo de Acessos
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-zinc-500 italic">
            Gráfico de acessos em breve (Integração Google Analytics)
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <History className="mr-2 w-5 h-5 text-zinc-400" />
              Últimas Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400">Usuário</TableHead>
                  <TableHead className="text-zinc-400">Ação</TableHead>
                  <TableHead className="text-zinc-400">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-300">{log.user_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300 capitalize">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-xs">
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}