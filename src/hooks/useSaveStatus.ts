import { useState, useEffect, useRef, useCallback } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setSaveStatus = useCallback((newStatus: SaveStatus) => {
    setStatus(newStatus);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (newStatus === 'saved' || newStatus === 'error') {
      timerRef.current = setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { status, setSaveStatus };
}

export function getSaveButtonStyles(status: SaveStatus) {
  switch (status) {
    case 'saving':
      return "bg-black text-white cursor-wait";
    case 'saved':
      return "bg-green-600 hover:bg-green-700 text-white border-green-700 shadow-[0_0_15px_rgba(22,163,74,0.5)]";
    case 'error':
      return "bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)]";
    default:
      return "bg-black hover:bg-zinc-900 text-white border-zinc-800";
  }
}
