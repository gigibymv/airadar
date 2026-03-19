import { type CommunityPost } from "@/data/newsData";
import { useMemo, useState } from "react";
import { RefreshButton } from "@/components/RefreshButton";
import { CommunitySearch } from "@/components/CommunitySearch";
import { CommunityCard } from "@/components/CommunityCard";

interface CommunityTabProps {
  communityQuery: string;
  onCommunityQueryChange: (query: string) => void;
  onCommunitySearch: (query: string) => void;
  isCommunitySearching: boolean;
  hasCommunitySearched: boolean;
  communitySearchResults: CommunityPost[];
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
  onResetSearch: () => void;
}

export function CommunityTab({
  communityQuery,
  onCommunityQueryChange,
  onCommunitySearch,
  isCommunitySearching,
  hasCommunitySearched,
  communitySearchResults,
  communityPosts,
  isRefreshing,
  onRefreshAll,
  isBookmarked,
  onToggleBookmark,
  onResetSearch,
}: CommunityTabProps) {
  const [activeSource, setActiveSource] = useState<"github" | "reddit">("reddit");

  const trendingBySource = useMemo(
    () => communityPosts.filter((post) => post.source === activeSource),
    [activeSource, communityPosts]
  );
  const searchedBySource = useMemo(
    () => communitySearchResults.filter((post) => post.source === activeSource),
    [activeSource, communitySearchResults]
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

      <CommunitySearch
        query={communityQuery}
        onChange={(q) => {
          onCommunityQueryChange(q);
          if (!q) onResetSearch();
        }}
        onSearch={onCommunitySearch}
        isSearching={isCommunitySearching}
      />

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

      {hasCommunitySearched && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
              search results
            </h3>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">
              {searchedBySource.length} {sourceLabel} results
            </span>
          </div>
          {searchedBySource.length > 0 ? (
            <div className="space-y-2">
              {searchedBySource.map((post, i) => (
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
          ) : !isCommunitySearching ? (
            <p className="text-[13px] text-muted-foreground italic py-12 text-center">
              No {sourceLabel} resources found in this search.
            </p>
          ) : null}
        </div>
      )}

      {!hasCommunitySearched && (
        <>
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
        </>
      )}
    </div>
  );
}
