import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutosave<T>(
  data: T,
  onSave: (data: T) => Promise<void> | void,
  debounceMs: number = 1000,
  storageKey?: string
) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedData, setLastSavedData] = useState<string>(JSON.stringify(data));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage on mount if storageKey is provided
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // We don't necessarily want to trigger a save immediately, 
          // just make sure the UI reflects it if needed.
          // However, usually the component owner handles the initial state.
        } catch (e) {
          console.error("Error parsing local storage", e);
        }
      }
    }
  }, [storageKey]);

  const performSave = useCallback(async (currentData: T) => {
    setStatus('saving');
    try {
      await onSave(currentData);
      setLastSavedData(JSON.stringify(currentData));
      
      // Clear local storage backup on successful remote save
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      
      setStatus('saved');
      // Reset to idle after 2 seconds of showing "Saved"
      setTimeout(() => setStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
    } catch (error) {
      console.error('Autosave failed:', error);
      setStatus('error');
      // Retry once after 3 seconds
      setTimeout(() => performSave(currentData), 3000);
    }
  }, [onSave, storageKey]);

  useEffect(() => {
    const currentDataStr = JSON.stringify(data);
    
    // Only save if data actually changed
    if (currentDataStr !== lastSavedData) {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      setStatus('saving'); // Show "Saving..." as soon as change starts
      
      // Update local storage backup immediately
      if (storageKey) {
        localStorage.setItem(storageKey, currentDataStr);
      }
      
      timerRef.current = setTimeout(() => {
        performSave(data);
      }, debounceMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, lastSavedData, debounceMs, performSave, storageKey]);

  return { status };
}
