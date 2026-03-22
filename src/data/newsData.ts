export type NewsCategory = "LLMs" | "Robotics" | "Research" | "Industry" | "Policy";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  takeaways: string[];
  source: string;
  url: string;
  category: NewsCategory;
  timeAgo: string;
  isBreaking?: boolean;
}

const categoryColorMap: Record<NewsCategory, string> = {
  LLMs: "bg-primary",
  Robotics: "bg-muted-foreground",
  Research: "bg-primary",
  Industry: "bg-muted-foreground",
  Policy: "bg-primary",
};

export function getCategoryColor(category: NewsCategory) {
  return categoryColorMap[category];
}

export interface CommunityPost {
  id: string;
  title: string;
  source: "github";
  subreddit?: string;
  repo?: string;
  description: string;
  howItHelps: string;
  author: string;
  timeAgo: string;
  upvotes?: number;
  stars?: number;
  comments: number;
  url: string;
}
