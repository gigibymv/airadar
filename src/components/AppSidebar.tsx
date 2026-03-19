import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { appNavItems, type Tab } from "@/features/shell/navigation";

interface AppSidebarProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export function AppSidebar({ activeTab = "briefing", onTabChange }: AppSidebarProps) {
  const { user, displayName, signOut } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col w-[220px] border-r border-border bg-background shrink-0">
      <div className="px-6 pt-7 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <img
            src="/ai-icon.png"
            alt="AI Radar mark"
            className="h-7 w-7 object-contain"
          />
          <p className="font-display text-xl font-bold text-foreground tracking-tight">
            AI Radar
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Daily AI Briefing
        </p>
      </div>

      <nav className="flex flex-col py-4 flex-1 px-4">
        {appNavItems.map((item) => {
          const isActive = item.tab === activeTab && item.enabled;
          return (
            <button
              key={item.key}
              onClick={() => item.tab && onTabChange?.(item.tab)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[13px] transition-all text-left",
                isActive
                  ? "text-foreground font-semibold border-l-2 border-foreground -ml-px"
                  : "text-muted-foreground hover:text-foreground",
                !item.enabled && "opacity-30 cursor-not-allowed"
              )}
              disabled={!item.enabled}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-border space-y-3">
        {user && (
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-foreground truncate">
              {displayName}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                {user.email}
              </p>
              <button
                onClick={signOut}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          ©2026 MV Intelligence
        </p>
      </div>
    </aside>
  );
}
