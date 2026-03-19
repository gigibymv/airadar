import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { NewsItem } from "@/data/newsData";
import type { TldrItem } from "@/data/tldrData";
import type { CommunityPost } from "@/data/newsData";
import {
  normalizeNewsArticle,
  normalizeCommunityPost,
  normalizeTldrItem,
  toCommunityPostViewModel,
  toNewsItemViewModel,
  toTldrItemViewModel,
} from "@/domain/content/news";

export function useNewsArticles() {
  const queryClient = useQueryClient();

  // Subscribe to realtime changes on news_articles
  useEffect(() => {
    const channel = supabase
      .channel("news-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news_articles" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["news-articles"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["news-articles"],
    queryFn: async (): Promise<NewsItem[]> => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("published_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      if (!data || data.length === 0) return [];

      return data.map((row) => toNewsItemViewModel(normalizeNewsArticle(row)));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for near-realtime
  });
}

export function useTldrItems() {
  return useQuery({
    queryKey: ["tldr-items"],
    queryFn: async (): Promise<TldrItem[]> => {
      const { data, error } = await supabase
        .from("tldr_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      return data.map((row) => toTldrItemViewModel(normalizeTldrItem(row)));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommunityPosts() {
  return useQuery({
    queryKey: ["community-posts"],
    queryFn: async (): Promise<CommunityPost[]> => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("published_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      if (!data || data.length === 0) return [];

      return data.map((row) =>
        toCommunityPostViewModel(normalizeCommunityPost(row))
      );
    },
    staleTime: 5 * 60 * 1000,
  });
}
