import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type UseCasePost } from "@/data/useCaseData";
import {
  normalizeUseCaseRecord,
  toUseCaseViewModel,
} from "@/domain/content/usecases";

export function useUseCases() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("use-cases-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "use_cases" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["use-cases"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["use-cases"],
    queryFn: async (): Promise<UseCasePost[]> => {
      const { data, error } = await supabase
        .from("use_cases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) return [];

      return data.map((row) => toUseCaseViewModel(normalizeUseCaseRecord(row)));
    },
    staleTime: 2 * 60 * 1000,
  });
}
