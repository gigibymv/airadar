import type { NewsCategory, NewsItem, CommunityPost } from "@/data/newsData";
import type { TldrItem } from "@/data/tldrData";
import type { Tables } from "@/integrations/supabase/types";
import { formatRelativeTime } from "@/domain/content/time";
import { decodeHtmlEntities } from "@/lib/text";

type RawNewsArticle = Tables<"news_articles">;
type RawCommunityPost = Tables<"community_posts">;
type RawTldrItem = Tables<"tldr_items">;

interface NormalizedNewsArticle {
  id: string;
  title: string;
  summary: string;
  takeaways: string[];
  source: string;
  url: string;
  category: NewsCategory;
  createdAt: string;
  isBreaking: boolean;
}

interface NormalizedCommunityPost {
  id: string;
  title: string;
  source: "github" | "reddit";
  subreddit?: string;
  repo?: string;
  description: string;
  howItHelps: string;
  author: string;
  createdAt: string;
  upvotes?: number;
  stars?: number;
  comments: number;
  url: string;
}

interface NormalizedTldrItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  readTime: string;
  category: TldrItem["category"];
}

function normalizeNewsCategory(category: string): NewsCategory {
  if (category === "Robotics") return "Robotics";
  if (category === "Research") return "Research";
  if (category === "Industry") return "Industry";
  if (category === "Policy") return "Policy";
  return "LLMs";
}

function normalizeCommunitySource(source: string): "github" | "reddit" {
  return source === "reddit" ? "reddit" : "github";
}

function normalizeTldrCategory(category: string): TldrItem["category"] {
  if (category === "research") return "research";
  if (category === "tools") return "tools";
  if (category === "launches") return "launches";
  return "headlines";
}

export function normalizeNewsArticle(row: RawNewsArticle): NormalizedNewsArticle {
  return {
    id: row.id,
    title: decodeHtmlEntities(row.title),
    summary: decodeHtmlEntities(row.summary),
    takeaways: (row.takeaways || []).map((value) => decodeHtmlEntities(value)),
    source: decodeHtmlEntities(row.source),
    url: row.url,
    category: normalizeNewsCategory(row.category),
    createdAt: row.created_at,
    isBreaking: row.is_breaking,
  };
}

export function normalizeCommunityPost(row: RawCommunityPost): NormalizedCommunityPost {
  return {
    id: row.id,
    title: decodeHtmlEntities(row.title),
    source: normalizeCommunitySource(row.source),
    subreddit: row.subreddit ? decodeHtmlEntities(row.subreddit) : undefined,
    repo: row.repo ? decodeHtmlEntities(row.repo) : undefined,
    description: decodeHtmlEntities(row.description),
    howItHelps: decodeHtmlEntities(row.how_it_helps),
    author: decodeHtmlEntities(row.author),
    createdAt: row.created_at,
    upvotes: row.upvotes || undefined,
    stars: row.stars || undefined,
    comments: row.comments,
    url: row.url,
  };
}

export function normalizeTldrItem(row: RawTldrItem): NormalizedTldrItem {
  return {
    id: row.id,
    title: decodeHtmlEntities(row.title),
    summary: decodeHtmlEntities(row.summary),
    url: row.url,
    readTime: decodeHtmlEntities(row.read_time),
    category: normalizeTldrCategory(row.category),
  };
}

export function toNewsItemViewModel(article: NormalizedNewsArticle): NewsItem {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    takeaways: article.takeaways,
    source: article.source,
    url: article.url,
    category: article.category,
    timeAgo: formatRelativeTime(article.createdAt),
    isBreaking: article.isBreaking,
  };
}

export function toCommunityPostViewModel(post: NormalizedCommunityPost): CommunityPost {
  return {
    id: post.id,
    title: post.title,
    source: post.source,
    subreddit: post.subreddit,
    repo: post.repo,
    description: post.description,
    howItHelps: post.howItHelps,
    author: post.author,
    timeAgo: formatRelativeTime(post.createdAt),
    upvotes: post.upvotes,
    stars: post.stars,
    comments: post.comments,
    url: post.url,
  };
}

export function toTldrItemViewModel(item: NormalizedTldrItem): TldrItem {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    url: item.url,
    readTime: item.readTime,
    category: item.category,
  };
}
