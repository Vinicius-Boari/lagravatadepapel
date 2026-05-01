import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutosave<T>(
  data: T,
  onSave: (data: T) => Promise<void> | void,
  debounceMs: number = 1000
) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedData, setLastSavedData] = useState<string>(JSON.stringify(data));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const performSave = useCallback(async (currentData: T) => {
    setStatus('saving');
    try {
      await onSave(currentData);
      setLastSavedData(JSON.stringify(currentData));
      setStatus('saved');
      // Reset to idle after 2 seconds of showing "Saved"
      setTimeout(() => setStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
    } catch (error) {
      console.error('Autosave failed:', error);
      setStatus('error');
      // Retry once after 3 seconds
      setTimeout(() => performSave(currentData), 3000);
    }
  }, [onSave]);

  useEffect(() => {
    const currentDataStr = JSON.stringify(data);
    
    // Only save if data actually changed
    if (currentDataStr !== lastSavedData) {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      setStatus('saving'); // Show "Saving..." as soon as change starts
      
      timerRef.current = setTimeout(() => {
        performSave(data);
      }, debounceMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, lastSavedData, debounceMs, performSave]);

  return { status };
}
