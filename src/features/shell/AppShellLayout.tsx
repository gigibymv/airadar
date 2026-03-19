import { type ReactNode } from "react";
import { format } from "date-fns";
import { Search, Menu, X } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { appNavItems, appTabs, type Tab } from "@/features/shell/navigation";

interface AppShellLayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  displayName: string;
  showGlobalSearch: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  mobileSearchOpen: boolean;
  onToggleMobileSearch: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  children: ReactNode;
}

export function AppShellLayout({
  activeTab,
  onTabChange,
  displayName,
  showGlobalSearch,
  mobileMenuOpen,
  onToggleMobileMenu,
  mobileSearchOpen,
  onToggleMobileSearch,
  searchQuery,
  onSearchQueryChange,
  children,
}: AppShellLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />

      <main className="flex-1 overflow-auto min-w-0">
        <div className="border-b border-border px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              onClick={onToggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <img
              src="/ai-icon.png"
              alt="AI Radar mark"
              className="lg:hidden h-6 w-6 object-contain shrink-0"
            />
            <p className="font-display text-base font-bold text-foreground lg:hidden truncate">
              AI Radar
            </p>
            <time className="text-[11px] text-muted-foreground hidden sm:block">
              Hey {displayName} · {format(new Date(), "EEEE, MMMM d, yyyy")}
            </time>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showGlobalSearch && (
              <>
                <button
                  className="sm:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={onToggleMobileSearch}
                  aria-label="Toggle search"
                >
                  <Search className="h-4 w-4" />
                </button>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search latest news..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-input text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all w-52 bg-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {showGlobalSearch && mobileSearchOpen && (
          <div className="sm:hidden border-b border-border px-4 py-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search latest news..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-input text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all bg-transparent"
              />
            </div>
          </div>
        )}

        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border animate-fade-in">
            {appNavItems.map((item) => (
              <button
                key={item.key}
                onClick={() => item.tab && onTabChange(item.tab)}
                className={`w-full text-left px-5 py-3.5 text-[13px] transition-colors ${
                  item.tab === activeTab && item.enabled
                    ? "text-foreground font-semibold border-l-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                } ${!item.enabled ? "opacity-30 cursor-not-allowed" : ""}`}
                disabled={!item.enabled}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="px-4 sm:px-8 py-6 md:py-8 max-w-6xl">
          <div className="relative mb-8">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-1 border-b border-border">
              {appTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`pb-3 text-[13px] font-display font-semibold transition-colors whitespace-nowrap shrink-0 -mb-px ${
                    activeTab === tab.key
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
          </div>

          {children}

          <footer className="mt-12 sm:mt-16 pt-6 border-t border-border flex flex-col sm:flex-row items-center gap-2 justify-between pb-8">
            <p className="font-display text-base font-semibold text-foreground/40">
              AI Radar
            </p>
            <p className="text-[10px] text-muted-foreground">
              ©2026 MV Intelligence
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
