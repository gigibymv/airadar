import { Bookmark } from "lucide-react";
import { StoryRow } from "@/components/NewsCard";
import { UseCaseCard } from "@/components/UseCaseCard";
import { CommunityCard } from "@/components/CommunityCard";
import { formatRelativeTime } from "@/domain/content/time";
import { type NewsCategory, type NewsItem } from "@/data/newsData";
import {
  type BookmarkCategory,
  type Bookmark as SavedBookmark,
  type NewsBookmark,
} from "@/hooks/useBookmarks";

interface SavedTabProps {
  getByCategory: <C extends BookmarkCategory>(category: C) => Extract<SavedBookmark, { category: C }>[];
  isLoading: boolean;
  errorMessage: string | null;
  onToggleNewsBookmark: (bookmark: SavedBookmark) => void;
  onToggleUseCaseBookmark: (bookmark: SavedBookmark) => void;
  onToggleCommunityBookmark: (bookmark: SavedBookmark) => void;
}

function isNewsCategory(value: unknown): value is NewsCategory {
  return (
    value === "LLMs" ||
    value === "Robotics" ||
    value === "Research" ||
    value === "Industry" ||
    value === "Policy"
  );
}

function toSavedNewsItem(bookmark: NewsBookmark): NewsItem {
  const d = bookmark.data;
  return {
    id: bookmark.id,
    title: bookmark.title,
    summary: d.summary || "Saved from Daily Brief.",
    takeaways: Array.isArray(d.takeaways) ? d.takeaways : [],
    source: bookmark.source,
    url: bookmark.url,
    category: isNewsCategory(d.category) ? d.category : "Industry",
    timeAgo: d.timeAgo?.trim() ? d.timeAgo : formatRelativeTime(bookmark.savedAt),
    isBreaking: d.isBreaking ?? false,
  };
}

export function SavedTab({
  getByCategory,
  isLoading,
  errorMessage,
  onToggleNewsBookmark,
  onToggleUseCaseBookmark,
  onToggleCommunityBookmark,
}: SavedTabProps) {
  const news = getByCategory("news");
  const useCases = getByCategory("usecases");
  const community = getByCategory("community");
  const total = news.length + useCases.length + community.length;

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight text-foreground leading-[1.1]">
          Saved items
        </h2>
        <p className="text-[11px] text-muted-foreground mt-1">{total} bookmarked</p>
      </div>

      {isLoading && (
        <div className="text-center py-16 border-t border-border">
          <p className="text-[13px] text-muted-foreground italic">
            Loading saved items...
          </p>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="text-center py-16 border-t border-destructive">
          <p className="text-[13px] text-destructive italic">{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && news.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
              news
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2">
            {news.map((b, i) => (
              <StoryRow
                key={b.id}
                item={toSavedNewsItem(b)}
                index={i}
                isBookmarked={true}
                onToggleBookmark={() => onToggleNewsBookmark(b)}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && useCases.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
              use cases
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2">
            {useCases.map((b, i) => (
              <UseCaseCard
                key={b.id}
                post={b.data}
                index={i}
                isBookmarked={true}
                onToggleBookmark={() => onToggleUseCaseBookmark(b)}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && community.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
              community
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2">
            {community.map((b, i) => (
              <CommunityCard
                key={b.id}
                post={b.data}
                index={i}
                isBookmarked={true}
                onToggleBookmark={() => onToggleCommunityBookmark(b)}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && total === 0 && (
        <div className="text-center py-16 border-t border-border">
          <Bookmark className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-[13px] text-muted-foreground italic">
            No saved items yet. Bookmark news, use cases, or community posts to find them here.
          </p>
        </div>
      )}
    </div>
  );
}
