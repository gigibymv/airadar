import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  type BriefingItemViewModel as BriefingItem,
  type ExecutiveBriefingViewModel as ExecutiveBriefing,
  toExecutiveBriefingViewModel,
} from "@/domain/content/briefing";

export type { BriefingItem, ExecutiveBriefing };

export function useExecutiveBriefing() {
  return useQuery({
    queryKey: ["executive-briefing"],
    queryFn: async (): Promise<ExecutiveBriefing | null> => {
      const { data, error } = await supabase
        .from("executive_briefings")
        .select("*")
        .order("published_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return toExecutiveBriefingViewModel(data);
    },
    staleTime: 2 * 60 * 1000,
  });
}
