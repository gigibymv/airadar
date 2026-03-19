import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onClick: () => void;
  isFetching: boolean;
  label?: string;
  className?: string;
}

export function RefreshButton({ onClick, isFetching, label = "Update news", className }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isFetching}
      aria-label={label}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground border border-border hover:border-input transition-colors disabled:opacity-40 rounded-none",
        className
      )}
    >
      <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
