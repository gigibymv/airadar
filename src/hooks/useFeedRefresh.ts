import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseFeedRefreshOptions {
  onRefreshed: () => Promise<unknown>;
  onShowAllNewsReset?: () => void;
}

export function useFeedRefresh({ onRefreshed, onShowAllNewsReset }: UseFeedRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    onShowAllNewsReset?.();
    try {
      const { data, error } = await supabase.functions.invoke("fetch-daily-news", {
        body: { mode: "append", region: "africa" },
      });
      if (error) throw error;
      if (data?.success === false) {
        const msg: string = data?.error ?? "";
        if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
          toast.error("AI quota reached — refresh resets daily at midnight.");
        } else {
          toast.error(`Refresh failed: ${msg.slice(0, 120)}`);
        }
        return;
      }
      await onRefreshed();
      const counts = data?.counts;
      if (counts && typeof counts === "object") {
        const newsCount = Number((counts as Record<string, unknown>).news ?? 0);
        const communityCount = Number((counts as Record<string, unknown>).community ?? 0);
        const useCasesCount = Number((counts as Record<string, unknown>).use_cases ?? 0);
        toast.success(
          `Feed refreshed (${newsCount} news, ${communityCount} community, ${useCasesCount} use cases)`
        );
      } else {
        toast.success("Feed refreshed with latest articles");
      }
    } catch (err) {
      console.error("Refresh error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429") || msg.includes("quota")) {
        toast.error("AI quota reached — refresh resets daily at midnight.");
      } else {
        toast.error("Failed to refresh feed");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshed, onShowAllNewsReset]);

  return { isRefreshing, refresh };
}
