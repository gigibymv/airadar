import { Link } from "react-router-dom";
import { DailyBriefTab } from "@/features/tabs/DailyBriefTab";
import { useAuth } from "@/hooks/useAuth";

export function PublicDailyBrief() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img src="/ai-icon.png" alt="AI Radar mark" className="h-7 w-7 object-contain" />
            <div>
              <p className="font-display text-xl font-bold tracking-tight">AI Radar</p>
              <p className="text-[10px] text-muted-foreground">Daily AI Briefing</p>
            </div>
          </div>
          <Link
            to={user ? "/app" : "/auth"}
            className="border border-foreground px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {user ? "Open my Radar" : "Sign in"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 md:py-8">
        <DailyBriefTab showBookmarkControls={false} />
      </main>

      <footer className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-border px-4 py-6 sm:mt-16 sm:px-8">
        <p className="font-display text-base font-semibold text-foreground/40">AI Radar</p>
        <p className="text-[10px] text-muted-foreground">©2026 MV Intelligence</p>
      </footer>
    </div>
  );
}
