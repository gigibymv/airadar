import { Search, Loader2 } from "lucide-react";

interface CommunitySearchProps {
  query: string;
  onChange: (query: string) => void;
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export function CommunitySearch({ query, onChange, onSearch, isSearching }: CommunitySearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border pt-4">
      <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-[0.15em]">
        Search Reddit & GitHub
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search AI agents, frameworks, tools..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-input text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all bg-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || query.trim().length < 3}
          className="px-5 py-2.5 border border-border text-foreground text-[13px] font-semibold hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              Search
            </>
          )}
        </button>
      </div>
    </form>
  );
}
