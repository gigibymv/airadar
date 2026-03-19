import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type CommunityPost } from "@/data/newsData";

export function useCommunitySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommunityPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-community", {
        body: { query: q },
      });
      if (error) throw error;
      setResults(data?.results || []);
    } catch (err) {
      console.error("Community search failed:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const reset = useCallback(() => {
    setHasSearched(false);
    setResults([]);
  }, []);

  return { query, setQuery, results, isSearching, hasSearched, search, reset };
}
