import { useState } from "react";
import { ArrowRight, Bookmark } from "lucide-react";
import { type TldrItem } from "@/data/tldrData";
import { useTldrItems } from "@/hooks/useNewsData";
import { useBookmarks } from "@/hooks/useBookmarks";

const tldrCategories = ["all", "headlines", "research", "tools", "launches"] as const;
type TldrCategory = (typeof tldrCategories)[number];

interface TldrCardProps {
  item: TldrItem;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

function TldrCard({ item, isBookmarked, onToggleBookmark }: TldrCardProps) {
  return (
    <article className="border-t border-border pt-4">
      <p className="text-[12px] text-muted-foreground mb-2">{item.readTime} read</p>
      <h4 className="font-display text-[18px] sm:text-[20px] font-bold leading-[1.2] tracking-tight text-foreground mb-3">
        {item.title}
      </h4>
      <p className="text-[14px] leading-[1.7] text-muted-foreground mb-4">{item.summary}</p>
      <div className="flex items-center justify-between">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-foreground hover:text-primary transition-colors"
        >
          read more
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
        {onToggleBookmark && (
          <button
            onClick={onToggleBookmark}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
          </button>
        )}
      </div>
    </article>
  );
}

export function TldrSection() {
  const [activeCategory, setActiveCategory] = useState<TldrCategory>("all");
  const { data: tldrItems = [] } = useTldrItems();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const filtered =
    activeCategory === "all"
      ? tldrItems
      : tldrItems.filter((item) => item.category === activeCategory);

  const headlines = filtered.filter((i) => i.category === "headlines");
  const research = filtered.filter((i) => i.category === "research");
  const tools = filtered.filter((i) => i.category === "tools");
  const launches = filtered.filter((i) => i.category === "launches");

  const sections =
    activeCategory === "all"
      ? [
          { label: "headlines", items: headlines },
          { label: "research & analysis", items: research },
          { label: "tools & repos", items: tools },
          { label: "launches", items: launches },
        ].filter((s) => s.items.length > 0)
      : [{ label: activeCategory, items: filtered }];

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Curated from{" "}
            <a
              href="https://tldr.tech/ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              tldr.tech/ai
            </a>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tldrCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-[10px] font-display font-semibold uppercase tracking-[0.12em] transition-colors rounded-none ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
              {section.label}
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-6">
            {section.items.map((item) => (
              <TldrCard
                key={item.id}
                item={item}
                isBookmarked={isBookmarked(item.id)}
                onToggleBookmark={() =>
                  toggleBookmark({
                    id: item.id,
                    category: "news",
                    title: item.title,
                    url: item.url,
                    source: "TLDR AI",
                    data: item,
                  })
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
