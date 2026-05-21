/**
 * useInstagramPosts Hook
 * 
 * Fetches and manages Instagram posts stored in Supabase.
 * Supports real-time updates and filtering by publication status.
 */
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
      try {
        let q = supabase
          .from("instagram_posts")
          .select("*")
          .order("position", { ascending: true })
          .order("posted_at", { ascending: false });
        if (!opts.all) q = q.eq("is_published", true);
        const { data, error } = await q;
        
        if (error) {
          console.error("Supabase error fetching instagram posts:", error);
          // Don't toast here to avoid spamming the user on every background refresh
          return;
        }

        if (!mounted) return;
        setPosts((data ?? []) as InstagramPost[]);
      } catch (err) {
        console.error("Critical error loading instagram posts:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel("instagram_posts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "instagram_posts" },
        () => load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [opts.all]);

  return { posts, loading, reload: () => setLoading(true) };
}
