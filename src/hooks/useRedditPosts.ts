import { useState, useEffect, useCallback } from "react";
import { type CommunityPost } from "@/data/newsData";

const SUBREDDITS = [
  "artificial",
  "MachineLearning",
  "LocalLLaMA",
  "ChatGPT",
];

function timeAgo(utcSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - utcSeconds;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function stripHtml(html: string): string {
  return html
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#x200B;/g, "")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchSubreddit(sub: string): Promise<CommunityPost[]> {
  const resp = await fetch(
    `https://www.reddit.com/r/${sub}/hot.json?limit=8&t=day`,
    {
      headers: { "User-Agent": "AI-Radar/1.0" },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!resp.ok) return [];
  const data = await resp.json();
  const posts = data?.data?.children ?? [];

  return posts
    .map((child: any) => {
      const p = child?.data;
      if (!p || p.stickied || p.over_18 || !p.title || p.title === "[deleted]") return null;

      const selftext = stripHtml(p.selftext || "");
      const description = selftext.length > 60
        ? selftext.slice(0, 320) + (selftext.length > 320 ? "…" : "")
        : `Hot discussion in r/${sub} — ${(p.score ?? 0).toLocaleString()} upvotes, ${p.num_comments ?? 0} comments.`;

      return {
        id: p.id || p.name,
        title: p.title.slice(0, 140),
        source: "reddit" as const,
        subreddit: `r/${sub}`,
        description,
        howItHelps: `Stay current on what the r/${sub} community is discussing right now — real practitioners sharing experiences, tools, and insights.`,
        author: p.author || "Anonymous",
        timeAgo: timeAgo(p.created_utc ?? 0),
        upvotes: p.score ?? 0,
        comments: p.num_comments ?? 0,
        url: `https://www.reddit.com${p.permalink}`,
      } satisfies CommunityPost;
    })
    .filter(Boolean) as CommunityPost[];
}

export function useRedditPosts() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(SUBREDDITS.map(fetchSubreddit));
      const all: CommunityPost[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") all.push(...r.value);
      }
      // Sort by upvotes descending, dedupe by id
      const deduped = Array.from(new Map(all.map((p) => [p.id, p])).values());
      deduped.sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
      setPosts(deduped.slice(0, 15));
    } catch {
      setError("Could not load Reddit posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { posts, loading, error, refetch: fetch };
}
