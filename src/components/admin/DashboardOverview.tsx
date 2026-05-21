import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { 
  Users, 
  Eye, 
  History, 
  Globe, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  PenTool,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function loadStats() {
      try {
        const [adminsRes, logsRes, recentLogsRes] = await Promise.all([
          supabase.from("user_roles").select("user_id", { count: "exact", head: true }).in("role", ["admin", "owner"]),
          supabase.from("admin_logs").select("id", { count: "exact", head: true }),
          supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(5)
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
        }
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    loadStats();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    { title: "Total de Administradores", value: stats.totalAdmins, icon: Users, color: "text-red-500" },
    { title: "Logs de Atividades", value: stats.totalLogs, icon: History, color: "text-red-500" },
    { title: "Status do Site", value: stats.siteStatus, icon: Globe, color: "text-red-500" },
    { title: "Última Alteração", value: stats.lastUpdate, icon: Clock, color: "text-zinc-400", isDate: true },
  ];

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
      
      <div className="bg-gradient-to-r from-red-900/20 to-zinc-900 border border-red-900/30 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="bg-red-600 p-4 rounded-2xl shadow-lg shadow-red-900/40 animate-pulse">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Editor Visual Wix</h3>
            <p className="text-red-500/70 text-sm max-w-md">Novo sistema de edição completa! Altere textos, cores e imagens clicando diretamente no site.</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate({ to: "/admin/visual-editor" })}
          className="bg-white hover:bg-zinc-100 text-black font-bold h-14 px-8 rounded-xl flex items-center gap-2 group transition-all"
        >
          Abrir Editor Visual
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}