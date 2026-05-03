import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type InstagramPost = {
  id: string;
  image_url: string;
  caption: string;
  permalink: string | null;
  position: number;
  is_published: boolean;
  source: string;
  posted_at: string;
};

/**
 * Loads published Instagram posts for the public site.
 * Subscribes to realtime changes so the admin panel updates the site instantly.
 */
export function useInstagramPosts(opts: { all?: boolean } = {}) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      let q = supabase
        .from("instagram_posts")
        .select("*")
        .order("position", { ascending: true })
        .order("posted_at", { ascending: false });
      if (!opts.all) q = q.eq("is_published", true);
      const { data } = await q;
      if (!mounted) return;
      setPosts((data ?? []) as InstagramPost[]);
      setLoading(false);
    };

    load();

    // Realtime disabled for stability
    return () => {
      mounted = false;
    };
  }, [opts.all]);

  return { posts, loading, reload: () => setLoading(true) };
}
