import { type CommunityPost } from "@/data/newsData";
import { useMemo } from "react";
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
  const githubPosts = useMemo(
    () => communityPosts.filter((post) => post.source === "github"),
    [communityPosts]
  );

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

      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
            trending github
          </h3>
          <div className="flex-1 h-px bg-border" />
          <RefreshButton onClick={onRefreshAll} isFetching={isRefreshing} />
        </div>

        {isRefreshing ? (
          <p className="text-[13px] text-muted-foreground italic py-6">Loading GitHub posts…</p>
        ) : githubPosts.length > 0 ? (
          <div className="space-y-2">
            {githubPosts.map((post, i) => (
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
            No GitHub items available yet.
          </p>
        )}
      </div>
    </div>
  );
}
