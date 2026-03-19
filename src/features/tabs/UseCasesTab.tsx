import { useMemo, useState } from "react";
import {
  type UseCasePost,
  type UseCaseType,
} from "@/data/useCaseData";
import { UseCaseCard } from "@/components/UseCaseCard";

interface UseCasesTabProps {
  useCasePosts: UseCasePost[];
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (item: {
    id: string;
    category: "usecases";
    title: string;
    url: string;
    source: string;
    data: UseCasePost;
  }) => void;
}

export function UseCasesTab({
  useCasePosts,
  isBookmarked,
  onToggleBookmark,
}: UseCasesTabProps) {
  const [activeType, setActiveType] = useState<UseCaseType>("person");
  const today = new Date().toISOString().slice(0, 10);

  const tabItems = useMemo(
    () => useCasePosts.filter((post) => post.type === activeType),
    [activeType, useCasePosts]
  );

  const FEATURED_COUNT = 5;

  const featuredItems = useMemo(() => {
    const highlighted = tabItems
      .filter((post) => post.isHighlighted && post.highlightedDate === today)
      .sort(
        (a, b) =>
          (a.highlightedRank ?? Number.MAX_SAFE_INTEGER) -
          (b.highlightedRank ?? Number.MAX_SAFE_INTEGER)
      )
      .slice(0, FEATURED_COUNT);

    if (highlighted.length >= FEATURED_COUNT) return highlighted;

    const highlightedIds = new Set(highlighted.map((p) => p.id));
    const padding = tabItems
      .filter((p) => !highlightedIds.has(p.id))
      .slice(0, FEATURED_COUNT - highlighted.length);

    return [...highlighted, ...padding];
  }, [tabItems, today]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <p className="text-[11px] text-muted-foreground mb-1">
          Practical workflows · Teams and operators · Measurable outcomes
        </p>
        <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight text-foreground leading-[1.1]">
          Practical AI use cases
        </h2>
        <p className="text-[11px] text-muted-foreground mt-2">
          Updated daily by cron.
        </p>
      </div>

      <div className="space-y-4">
        <div className="inline-flex border border-border bg-background">
          <button
            type="button"
            onClick={() => setActiveType("person")}
            className={`px-4 py-2 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors ${
              activeType === "person"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            by people
          </button>
          <button
            type="button"
            onClick={() => setActiveType("company")}
            className={`px-4 py-2 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors ${
              activeType === "company"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            by companies
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
            5 highlighted use cases of the day
          </h3>
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground">
            {activeType === "person" ? "People" : "Companies"} · all categories
          </span>
        </div>
        {featuredItems.length > 0 ? (
          <div className="space-y-2">
            {featuredItems.map((post, i) => (
              <UseCaseCard
                key={post.id}
                post={post}
                index={i}
                isBookmarked={isBookmarked(post.id)}
                onToggleBookmark={() =>
                  onToggleBookmark({
                    id: post.id,
                    category: "usecases",
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
            No curated use cases available yet for this tab and category.
          </p>
        )}
      </div>
    </div>
  );
}
