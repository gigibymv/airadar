import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import { normalizeCommunityPost, toCommunityPostViewModel } from "@/domain/content/news";
import type { NewsItem, CommunityPost } from "@/data/newsData";
import type { UseCasePost } from "@/data/useCaseData";

export type BookmarkCategory = "news" | "usecases" | "community";
type BookmarkRow = Tables<"bookmarks">;

interface BaseBookmark {
  id: string;
  title: string;
  url: string;
  source: string;
  savedAt: string;
}

export type NewsBookmark = BaseBookmark & { category: "news"; data: NewsItem };
export type CommunityBookmark = BaseBookmark & { category: "community"; data: CommunityPost };
export type UseCaseBookmark = BaseBookmark & { category: "usecases"; data: UseCasePost };
export type Bookmark = NewsBookmark | CommunityBookmark | UseCaseBookmark;

export type BookmarkInput =
  | Omit<NewsBookmark, "savedAt">
  | Omit<CommunityBookmark, "savedAt">
  | Omit<UseCaseBookmark, "savedAt">;

function isBookmarkCategory(value: string): value is BookmarkCategory {
  return value === "news" || value === "usecases" || value === "community";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toBookmark(row: BookmarkRow): Bookmark | null {
  if (!isBookmarkCategory(row.category)) return null;
  if (!row.item_id || !row.title || !row.url || !row.source || !row.saved_at) return null;
  if (!isRecord(row.data)) return null;

  const base: BaseBookmark = {
    id: row.item_id,
    title: row.title,
    url: row.url,
    source: row.source,
    savedAt: row.saved_at,
  };

  switch (row.category) {
    case "news":
      return { ...base, category: "news", data: row.data as NewsItem };
    case "community":
      return { ...base, category: "community", data: row.data as CommunityPost };
    case "usecases":
      return { ...base, category: "usecases", data: row.data as UseCasePost };
  }
}

function sameBookmarkIdentity(
  bookmark: Pick<Bookmark, "id" | "category">,
  target: Pick<Bookmark, "id" | "category">
) {
  return bookmark.id === target.id && bookmark.category === target.category;
}


export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookmarks from database
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      setError(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: loadError } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .order("saved_at", { ascending: false });

        if (loadError) throw loadError;

        if (data) {
          const parsed = data.map(toBookmark).filter((b): b is Bookmark => Boolean(b));
          const communityBookmarks = parsed.filter((b) => b.category === "community");

          if (communityBookmarks.length > 0) {
            const urls = communityBookmarks
              .map((b) => (typeof b.url === "string" ? b.url : ""))
              .filter(Boolean);

            if (urls.length > 0) {
              const { data: latestCommunity, error: communityError } = await supabase
                .from("community_posts")
                .select("*")
                .in("url", urls);

              if (!communityError && latestCommunity) {
                const byUrl = new Map(
                  latestCommunity.map((row) => [
                    row.url,
                    toCommunityPostViewModel(normalizeCommunityPost(row)),
                  ])
                );

                setBookmarks(
                  parsed.map((bookmark): Bookmark => {
                    if (bookmark.category !== "community") return bookmark;
                    const latest = byUrl.get(bookmark.url);
                    if (!latest) return bookmark;
                    const updated: CommunityBookmark = {
                      ...bookmark,
                      title: latest.title || bookmark.title,
                      source: latest.source || bookmark.source,
                      data: latest,
                    };
                    return updated;
                  })
                );
                return;
              }
            }
          }

          setBookmarks(parsed);
        }
      } catch (err) {
        console.error("Bookmark load failed:", err);
        setError("Failed to load saved items.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const isBookmarked = useCallback(
    (id: string, category?: BookmarkCategory) =>
      bookmarks.some((b) => b.id === id && (!category || b.category === category)),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (item: BookmarkInput): Promise<void> => {
      if (!user) {
        setError("Authentication required to save items.");
        return;
      }

      const exists = bookmarks.some((b) => sameBookmarkIdentity(b, item));
      setError(null);

      if (exists) {
        const previousBookmarks = bookmarks;
        setBookmarks((prev) =>
          prev.filter((b) => !sameBookmarkIdentity(b, item))
        );

        const { error: deleteError } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", item.id)
          .eq("category", item.category);

        if (deleteError) {
          console.error("Bookmark remove failed:", deleteError);
          setError("Failed to remove saved item.");
          setBookmarks(previousBookmarks);
        }
      } else {
        const previousBookmarks = bookmarks;
        const newBookmark = { ...item, savedAt: new Date().toISOString() } as Bookmark;
        setBookmarks((prev) => [newBookmark, ...prev]);

        const { error: insertError } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          item_id: item.id,
          category: item.category,
          title: item.title,
          url: item.url,
          source: item.source,
          data: item.data,
        });

        if (insertError) {
          console.error("Bookmark add failed:", insertError);
          setError("Failed to save item.");
          setBookmarks(previousBookmarks);
        }
      }
    },
    [user, bookmarks]
  );

  const getByCategory = useCallback(
    <C extends BookmarkCategory>(category: C) =>
      bookmarks.filter((b): b is Extract<Bookmark, { category: C }> => b.category === category),
    [bookmarks]
  );

  const removeBookmark = useCallback(
    async (id: string, category?: BookmarkCategory) => {
      if (!user) {
        setError("Authentication required to remove saved items.");
        return;
      }

      setError(null);
      const previousBookmarks = bookmarks;
      setBookmarks((prev) =>
        prev.filter((b) => !(b.id === id && (!category || b.category === category)))
      );

      let deleteQuery = supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", id);

      if (category) {
        deleteQuery = deleteQuery.eq("category", category);
      }

      const { error: deleteError } = await deleteQuery;

      if (deleteError) {
        console.error("Bookmark remove failed:", deleteError);
        setError("Failed to remove saved item.");
        setBookmarks(previousBookmarks);
      }
    },
    [user, bookmarks]
  );

  return {
    bookmarks,
    loading,
    error,
    isBookmarked,
    toggleBookmark,
    getByCategory,
    removeBookmark,
  };
}
