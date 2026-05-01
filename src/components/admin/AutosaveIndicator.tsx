import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutosaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function AutosaveIndicator({ status, className }: AutosaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2",
      status === 'saving' && "bg-zinc-800 text-zinc-400 border border-zinc-700",
      status === 'saved' && "bg-green-500/10 text-green-500 border border-green-500/20",
      status === 'error' && "bg-red-500/10 text-red-500 border border-red-500/20",
      className
    )}>
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Salvando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-3 h-3" />
          <span>Salvo</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3" />
          <span>Erro ao salvar</span>
        </>
      )}
    </div>
  );
}
