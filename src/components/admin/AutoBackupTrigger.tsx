import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * AutoBackupTrigger Component
 * 
 * A background component that triggers a site backup every 5 minutes
 * while the admin dashboard is active.
 */
export const AutoBackupTrigger = () => {
  useEffect(() => {
    const triggerAutoBackup = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      try {
        // We trigger it silently in the background
        await fetch("/api/public/hooks/run-backup", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Auto backup check failed", e);
      }
    };

    // Check every 5 minutes while dashboard is open, or immediately on load
    triggerAutoBackup();
    const interval = setInterval(triggerAutoBackup, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};
