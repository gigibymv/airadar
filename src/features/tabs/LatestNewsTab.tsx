import { type NewsCategory, type NewsItem } from "@/data/newsData";
import { CategoryFilter } from "@/components/CategoryFilter";
import { RefreshButton } from "@/components/RefreshButton";
import { StoryRow } from "@/components/NewsCard";

interface LatestNewsTabProps {
  activeCategory: NewsCategory | null;
  onCategoryChange: (category: NewsCategory | null) => void;
  searchQuery: string;
  showAllNews: boolean;
  onShowAllNews: () => void;
  isRefreshing: boolean;
  onRefreshAll: () => void;
  newsArticles: NewsItem[];
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (item: {
    id: string;
    category: "news";
    title: string;
    url: string;
    source: string;
    data: NewsItem;
  }) => void;
}

const INITIAL_NEWS_COUNT = 10;

export function LatestNewsTab({
  activeCategory,
  onCategoryChange,
  searchQuery,
  showAllNews,
  onShowAllNews,
  isRefreshing,
  onRefreshAll,
  newsArticles,
  isBookmarked,
  onToggleBookmark,
}: LatestNewsTabProps) {
  const filtered = activeCategory
    ? newsArticles.filter((n) => n.category === activeCategory)
    : newsArticles;

  const searchFiltered = !searchQuery.trim()
    ? filtered
    : filtered.filter((n) => {
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q);
      });

  const visibleArticles = showAllNews
    ? searchFiltered
    : searchFiltered.slice(0, INITIAL_NEWS_COUNT);
  const hasMoreNews = searchFiltered.length > INITIAL_NEWS_COUNT && !showAllNews;

  return (
    <div className="space-y-6 sm:space-y-8">
      <CategoryFilter active={activeCategory} onSelect={onCategoryChange} />

      <div className="flex items-center gap-4">
        <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
          latest
        </h3>
        <div className="flex-1 h-px bg-border" />
        <RefreshButton onClick={onRefreshAll} isFetching={isRefreshing} />
      </div>

      <div className="space-y-2">
        {visibleArticles.map((item, i) => (
          <StoryRow
            key={item.id}
            item={item}
            index={i}
            isBookmarked={isBookmarked(item.id)}
            onToggleBookmark={() =>
              onToggleBookmark({
                id: item.id,
                category: "news",
                title: item.title,
                url: item.url,
                source: item.source,
                data: item,
              })
            }
          />
        ))}
      </div>

      {hasMoreNews && (
        <button
          onClick={onShowAllNews}
          className="w-full mt-4 py-3 text-[13px] font-display font-semibold text-muted-foreground hover:text-foreground border border-border hover:border-input transition-colors"
        >
          Load more ({searchFiltered.length - INITIAL_NEWS_COUNT} older items)
        </button>
      )}

      {searchFiltered.length === 0 && (
        <p className="text-[13px] text-muted-foreground italic py-12 text-center">
          {searchQuery
            ? "No stories match your search."
            : "No stories in this category today."}
        </p>
      )}
    </div>
  );
}
