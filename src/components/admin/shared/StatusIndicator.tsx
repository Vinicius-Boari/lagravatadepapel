
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={cn("flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-right-2", className)}>
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
          <span className="text-zinc-400">Salvando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          <span className="text-green-500">Alterações salvas</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span className="text-red-500">Erro ao salvar</span>
        </>
      )}
    </div>
  );
}
