import { type NewsCategory } from "@/data/newsData";

const categories: NewsCategory[] = ["LLMs", "Robotics", "Research", "Industry", "Policy"];

interface CategoryFilterProps {
  active: NewsCategory | null;
  onSelect: (cat: NewsCategory | null) => void;
}

export function CategoryFilter({ active, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onSelect(null)}
        className={`text-[13px] font-display font-semibold transition-colors pb-1 ${
          active === null
            ? "text-foreground border-b-2 border-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(active === cat ? null : cat)}
          className={`text-[13px] font-display font-semibold transition-colors pb-1 ${
            active === cat
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
