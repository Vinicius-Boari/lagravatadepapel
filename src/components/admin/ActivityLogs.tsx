/**
 * ActivityLogs Component
 * 
 * Displays a searchable audit trail of administrative actions.
 * Fetches data from the 'admin_logs' table in Supabase.
 * Allows filtering by user email, action type, or entity.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  History, Search, Filter, Calendar, User as UserIcon, Tag, Loader2
} from "lucide-react";
import { SectionHeader } from "./shared/SectionHeader";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) setLogs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_logs'
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs = logs.filter(log => 
    log.user_email.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.entity_type && log.entity_type.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-red-500 flex items-center gap-2"><Loader2 className="animate-spin" /> Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <SectionHeader 
        title="Log de Atividades"
        subtitle="Acompanhe todas as alterações realizadas no painel"
        icon={History}
      />


      <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              className="pl-10 bg-zinc-800 border-red-900 text-red-500" 
              placeholder="Filtrar por usuário, ação ou tipo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950 border-zinc-800">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-red-400"><UserIcon className="w-3.5 h-3.5 inline mr-2" />Usuário</TableHead>
              <TableHead className="text-red-400"><Tag className="w-3.5 h-3.5 inline mr-2" />Ação</TableHead>
              <TableHead className="text-red-400">Entidade</TableHead>
              <TableHead className="text-red-400 text-right"><Calendar className="w-3.5 h-3.5 inline mr-2" />Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="font-medium text-red-500">{log.user_email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-900/10 border-red-900/50 text-red-400 capitalize">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-500 text-xs font-mono">
                  {log.entity_type ? `${log.entity_type} / ${log.entity_id?.substring(0, 8)}...` : '-'}
                </TableCell>
                <TableCell className="text-right text-red-400/60 text-xs">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-zinc-500 italic">
                  Nenhuma atividade encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
