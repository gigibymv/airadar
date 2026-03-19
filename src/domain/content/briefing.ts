import type { Tables } from "@/integrations/supabase/types";
import { decodeHtmlEntities } from "@/lib/text";

type RawExecutiveBriefingRecord = Tables<"executive_briefings">;

export interface BriefingItemViewModel {
  title: string;
  sources: string[];
  source_urls: string[];
  earliest_source_date: string | null;
  summary: string;
  strategic_implications: string;
  concept_explained: string | null;
  why_it_matters_now: string;
}

export interface ExecutiveBriefingViewModel {
  id: string;
  published_date: string;
  global_items: BriefingItemViewModel[];
  africa_items: BriefingItemViewModel[] | null;
  africa_no_update: boolean;
  signals_to_watch: string[];
}

function normalizeBriefingItem(raw: unknown): BriefingItemViewModel | null {
  const item = (raw as Record<string, unknown>) || {};
  if (typeof item.title !== "string" || !item.title.trim()) return null;

  const sources = Array.isArray(item.sources)
    ? item.sources.filter((v): v is string => typeof v === "string")
    : [];
  const sourceUrls = Array.isArray(item.source_urls)
    ? item.source_urls.filter((v): v is string => typeof v === "string")
    : [];

  return {
    title: decodeHtmlEntities(item.title),
    sources: sources.map((value) => decodeHtmlEntities(value)),
    source_urls: sourceUrls,
    earliest_source_date:
      typeof item.earliest_source_date === "string"
        ? item.earliest_source_date
        : null,
    summary:
      typeof item.summary === "string"
        ? decodeHtmlEntities(item.summary)
        : "",
    strategic_implications:
      typeof item.strategic_implications === "string"
        ? decodeHtmlEntities(item.strategic_implications)
        : "",
    concept_explained:
      typeof item.concept_explained === "string"
        ? decodeHtmlEntities(item.concept_explained)
        : null,
    why_it_matters_now:
      typeof item.why_it_matters_now === "string"
        ? decodeHtmlEntities(item.why_it_matters_now)
        : "",
  };
}

function normalizeBriefingItemList(raw: unknown): BriefingItemViewModel[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeBriefingItem)
    .filter((item): item is BriefingItemViewModel => Boolean(item));
}

export function toExecutiveBriefingViewModel(
  row: RawExecutiveBriefingRecord
): ExecutiveBriefingViewModel {
  return {
    id: row.id,
    published_date: row.published_date,
    global_items: normalizeBriefingItemList(row.global_items),
    africa_items: row.africa_items
      ? normalizeBriefingItemList(row.africa_items)
      : null,
    africa_no_update: row.africa_no_update,
    signals_to_watch: Array.isArray(row.signals_to_watch)
      ? row.signals_to_watch
          .filter((v): v is string => typeof v === "string")
          .map((value) => decodeHtmlEntities(value))
      : [],
  };
}
