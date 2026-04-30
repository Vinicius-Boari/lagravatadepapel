import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS, type Content, type ContentKey } from "@/lib/site-content-defaults";

export function useSiteContent() {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: async (): Promise<Content> => {
      const { data, error } = await supabase.from("site_content").select("key, value");
      if (error) throw error;

      const result: Record<string, unknown> = { ...DEFAULTS };
      for (const row of data ?? []) {
        const key = row.key as ContentKey;
        if (key in DEFAULTS) {
          // Merge with defaults so missing fields fall back gracefully
          result[key] = { ...(DEFAULTS as Record<string, unknown>)[key] as object, ...(row.value as object) };
        }
      }
      return result as Content;
    },
    staleTime: 30_000,
  });
}
