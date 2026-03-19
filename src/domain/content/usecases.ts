import type { Tables } from "@/integrations/supabase/types";
import { formatRelativeTime } from "@/domain/content/time";
import {
  type UseCasePost,
  type UseCaseCategory,
  type UseCaseType,
  normalizeUseCaseCategory,
  normalizeUseCaseType,
} from "@/data/useCaseData";
import { decodeHtmlEntities } from "@/lib/text";

type RawUseCaseRecord = Tables<"use_cases">;

interface NormalizedUseCase {
  id: string;
  title: string;
  summary: string;
  toolsUsed: string[];
  productivityGain: string;
  source: "reddit" | "linkedin" | "github";
  author: string;
  url: string;
  createdAt: string;
  upvotes?: number;
  likes?: number;
  stars?: number;
  comments: number;
  type: UseCaseType;
  category: UseCaseCategory;
  isHighlighted: boolean;
  highlightedDate?: string;
  highlightedRank?: number;
  howItHelpsYou?: string;
  implementationSteps?: string[];
}

function normalizeUseCaseSource(source: string): "reddit" | "linkedin" | "github" {
  if (source === "linkedin") return "linkedin";
  if (source === "github") return "github";
  return "reddit";
}

export function normalizeUseCaseRecord(row: RawUseCaseRecord): NormalizedUseCase {
  return {
    id: row.id,
    title: decodeHtmlEntities(row.title),
    summary: decodeHtmlEntities(row.summary),
    toolsUsed: (row.tools_used || []).map((value) => decodeHtmlEntities(value)),
    productivityGain: decodeHtmlEntities(row.productivity_gain || ""),
    source: normalizeUseCaseSource(row.source),
    author: decodeHtmlEntities(row.author),
    url: row.url,
    createdAt: row.created_at,
    upvotes: row.upvotes || undefined,
    likes: row.likes || undefined,
    stars: row.stars || undefined,
    comments: row.comments || 0,
    type: normalizeUseCaseType(row.type),
    category: normalizeUseCaseCategory(row.category),
    isHighlighted: Boolean(row.is_highlighted),
    highlightedDate:
      typeof row.highlighted_date === "string"
        ? row.highlighted_date
        : undefined,
    highlightedRank:
      typeof row.highlighted_rank === "number"
        ? row.highlighted_rank
        : undefined,
  };
}

export function normalizeUseCaseSearchResult(
  raw: unknown,
  fallbackId: string
): NormalizedUseCase {
  const item = (raw as Record<string, unknown>) || {};

  return {
    id: typeof item.id === "string" ? item.id : fallbackId,
    title: typeof item.title === "string" ? decodeHtmlEntities(item.title) : "",
    summary: typeof item.summary === "string" ? decodeHtmlEntities(item.summary) : "",
    toolsUsed: Array.isArray(item.toolsUsed)
      ? item.toolsUsed
          .filter((v): v is string => typeof v === "string")
          .map((value) => decodeHtmlEntities(value))
      : [],
    productivityGain:
      typeof item.productivityGain === "string"
        ? decodeHtmlEntities(item.productivityGain)
        : "",
    source: normalizeUseCaseSource(
      typeof item.source === "string" ? item.source : "reddit"
    ),
    author:
      typeof item.author === "string"
        ? decodeHtmlEntities(item.author)
        : "Anonymous",
    url: typeof item.url === "string" ? item.url : "#",
    createdAt: new Date().toISOString(),
    upvotes: typeof item.upvotes === "number" ? item.upvotes : undefined,
    likes: typeof item.likes === "number" ? item.likes : undefined,
    stars: typeof item.stars === "number" ? item.stars : undefined,
    comments: typeof item.comments === "number" ? item.comments : 0,
    type: normalizeUseCaseType(item.type),
    category: normalizeUseCaseCategory(item.category),
    isHighlighted: Boolean(item.isHighlighted),
    highlightedDate:
      typeof item.highlightedDate === "string"
        ? item.highlightedDate
        : undefined,
    highlightedRank:
      typeof item.highlightedRank === "number"
        ? item.highlightedRank
        : undefined,
    howItHelpsYou:
      typeof item.howItHelpsYou === "string"
        ? decodeHtmlEntities(item.howItHelpsYou)
        : undefined,
    implementationSteps: Array.isArray(item.implementationSteps)
      ? item.implementationSteps
          .filter((v): v is string => typeof v === "string")
          .map((value) => decodeHtmlEntities(value))
      : undefined,
  };
}

export function toUseCaseViewModel(useCase: NormalizedUseCase): UseCasePost {
  return {
    id: useCase.id,
    title: useCase.title,
    author: useCase.author,
    source: useCase.source,
    summary: useCase.summary,
    toolsUsed: useCase.toolsUsed,
    productivityGain: useCase.productivityGain,
    howItHelpsYou: useCase.howItHelpsYou,
    implementationSteps: useCase.implementationSteps,
    url: useCase.url,
    timeAgo: formatRelativeTime(useCase.createdAt),
    upvotes: useCase.upvotes,
    likes: useCase.likes,
    stars: useCase.stars,
    comments: useCase.comments,
    type: useCase.type,
    category: useCase.category,
    isHighlighted: useCase.isHighlighted,
    highlightedDate: useCase.highlightedDate,
    highlightedRank: useCase.highlightedRank,
  };
}
