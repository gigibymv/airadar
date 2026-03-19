import { type CommunityPost } from "@/data/newsData";
import { useMemo, useState } from "react";
import { RefreshButton } from "@/components/RefreshButton";
import { CommunityCard } from "@/components/CommunityCard";

interface CommunityTabProps {
  communityPosts: CommunityPost[];
  isRefreshing: boolean;
  onRefreshAll: () => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (item: {
    id: string;
    category: "community";
    title: string;
    url: string;
    source: string;
    data: CommunityPost;
  }) => void;
}

export function CommunityTab({
  communityPosts,
  isRefreshing,
  onRefreshAll,
  isBookmarked,
  onToggleBookmark,
}: CommunityTabProps) {
  const [activeSource, setActiveSource] = useState<"github" | "reddit">("reddit");

  const trendingBySource = useMemo(
    () => communityPosts.filter((post) => post.source === activeSource),
    [activeSource, communityPosts]
  );

  const sourceLabel = activeSource === "reddit" ? "Reddit" : "GitHub";

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <p className="text-[11px] text-muted-foreground mb-1">
          AI agents · LLMs · Models · Industry updates
        </p>
        <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight text-foreground leading-[1.1]">
          Community
        </h2>
      </div>

      <div className="inline-flex border border-border bg-background">
        <button
          type="button"
          onClick={() => setActiveSource("reddit")}
          className={`px-4 py-2 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors ${
            activeSource === "reddit"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Reddit
        </button>
        <button
          type="button"
          onClick={() => setActiveSource("github")}
          className={`px-4 py-2 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors ${
            activeSource === "github"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          GitHub
        </button>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
            trending {sourceLabel.toLowerCase()}
          </h3>
          <div className="flex-1 h-px bg-border" />
          <RefreshButton onClick={onRefreshAll} isFetching={isRefreshing} />
        </div>

        {trendingBySource.length > 0 ? (
          <div className="space-y-2">
            {trendingBySource.map((post, i) => (
              <CommunityCard
                key={post.id}
                post={post}
                index={i}
                isBookmarked={isBookmarked(post.id)}
                onToggleBookmark={() =>
                  onToggleBookmark({
                    id: post.id,
                    category: "community",
                    title: post.title,
                    url: post.url,
                    source: post.source,
                    data: post,
                  })
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground italic py-6">
            No {sourceLabel} items available yet.
          </p>
        )}
      </div>
    </div>
  );
}
