import { useState } from "react";
import { type NewsItem } from "@/data/newsData";
import { ExternalLink, ArrowRight, Bookmark } from "lucide-react";

export function HeadlineCard({ item }: { item: NewsItem }) {
  return (
    <article className="border-t-2 border-foreground pt-4 mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
          {item.category}
        </span>
        {item.isBreaking && (
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary animate-pulse">
            Breaking
          </span>
        )}
        <span className="text-[11px] text-muted-foreground ml-auto">{item.timeAgo}</span>
      </div>

      <h2 className="font-display text-[28px] sm:text-[36px] font-bold leading-[1.08] tracking-tight text-foreground mb-4">
        {item.title}
      </h2>

      <p className="text-[14px] leading-[1.7] text-muted-foreground mb-4 max-w-2xl">
        {item.summary}
      </p>

      <div className="flex flex-wrap gap-4 mb-4">
        {item.takeaways.map((t, i) => (
          <div key={i} className="flex gap-2 text-[13px] text-foreground/80 leading-[1.6]">
            <ArrowRight className="h-3.5 w-3.5 text-takeaway shrink-0 mt-1" />
            <span>{t}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <span className="text-[11px] font-semibold text-foreground">{item.source}</span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors ml-auto"
        >
          read more
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

export function StoryRow({ item, index, isBookmarked, onToggleBookmark }: { item: NewsItem; index: number; isBookmarked?: boolean; onToggleBookmark?: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="border-t border-border pt-4 opacity-0 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <p className="text-[11px] text-muted-foreground mb-2">
        {item.source} · {item.timeAgo}
      </p>

      <h3 className="font-display text-[18px] sm:text-[20px] font-bold leading-[1.2] tracking-tight text-foreground mb-3">
        {item.title}
      </h3>

      <p className="text-[13px] leading-[1.7] text-muted-foreground mb-3">
        {item.summary}
      </p>

      {expanded && item.takeaways && item.takeaways.length > 0 && (
        <div className="mb-3 border-l-2 border-takeaway pl-3 py-1 animate-fade-in">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] mb-2 text-takeaway">
            Takeaways
          </p>
          {item.takeaways.map((t, i) => (
            <div key={i} className="flex gap-2 text-[12px] text-foreground/80 leading-[1.6] mb-1">
              <ArrowRight className="h-3 w-3 text-takeaway shrink-0 mt-1" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-[11px] font-semibold text-takeaway">
          {expanded ? "collapse" : "Takeaways"}
        </span>
        <div className="flex items-center gap-3">
          {onToggleBookmark && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
            </button>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
          >
            read more
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
