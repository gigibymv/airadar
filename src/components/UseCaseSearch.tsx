import { Search, Loader2 } from "lucide-react";

interface UseCaseSearchProps {
  query: string;
  onChange: (query: string) => void;
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export function UseCaseSearch({ query, onChange, onSearch, isSearching }: UseCaseSearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Describe your pain point — e.g. 'automate customer support triage'..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-[14px] border border-input text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all bg-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={isSearching || query.trim().length < 3}
        className="px-5 py-3 text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
      >
        {isSearching ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          "Search online"
        )}
      </button>
    </form>
  );
}
