import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Download, 
  Upload, 
  History, 
  RefreshCcw,
  FileJson,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export function BackupExport() {
  const { content } = useSiteContent();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", `backup_lagravata_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success("Backup exportado com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar backup.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-red-500">Backup e Restauração</h2>
        <p className="text-red-500/70">Mantenha a segurança dos seus dados exportando ou restaurando configurações.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <Download className="mr-2 w-5 h-5" /> Exportar Dados
            </CardTitle>
            <CardDescription className="text-red-500/60">Baixe um arquivo JSON com todas as configurações atuais do site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/20 flex items-center space-x-4">
               <FileJson className="w-8 h-8 text-red-500 opacity-50" />
               <div className="flex-1">
                 <p className="text-sm font-bold text-red-500">Configurações Completas</p>
                 <p className="text-xs text-zinc-500">Inclui textos, cores, links e metadados.</p>
               </div>
               <Button onClick={handleExport} disabled={isExporting}>
                 {isExporting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Baixar JSON"}
               </Button>
            </div>
            <p className="text-[10px] text-zinc-500 italic">Recomendamos fazer um backup antes de grandes alterações.</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <Upload className="mr-2 w-5 h-5" /> Restaurar Backup
            </CardTitle>
            <CardDescription className="text-red-500/60">Importe um arquivo JSON para restaurar uma versão anterior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-900/5 rounded-lg border border-red-900/20">
               <div className="flex items-start space-x-3 text-red-500 mb-4">
                 <AlertTriangle className="w-5 h-5 shrink-0" />
                 <p className="text-xs leading-relaxed font-medium">Atenção: A restauração substituirá permanentemente todas as configurações atuais do site.</p>
               </div>
               <Button variant="outline" className="w-full border-red-900 text-red-500 hover:bg-red-900/20" onClick={() => toast.info("Funcionalidade de importação em breve.")}>
                 Selecionar Arquivo
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center text-lg">
            <History className="mr-2 w-5 h-5" /> Snapshots Automáticos
          </CardTitle>
          <CardDescription className="text-red-500/60">Histórico de versões salvas pelo sistema.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center py-10 text-zinc-600 italic text-sm">
             Nenhum snapshot automático gerado recentemente.
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
