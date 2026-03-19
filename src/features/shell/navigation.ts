import {
  LayoutDashboard,
  Newspaper,
  GitBranch,
  Bookmark,
  Lightbulb,
  Settings,
} from "lucide-react";

export type Tab = "briefing" | "news" | "usecases" | "community" | "saved" | "settings";

export interface NavItem {
  key: Tab | "settings";
  label: string;
  tab?: Tab;
  icon:
    | typeof LayoutDashboard
    | typeof Newspaper
    | typeof GitBranch
    | typeof Lightbulb
    | typeof Bookmark
    | typeof Settings;
  enabled: boolean;
}

export const appNavItems: NavItem[] = [
  { key: "briefing", label: "Daily Brief", tab: "briefing", icon: LayoutDashboard, enabled: true },
  { key: "news", label: "Latest News", tab: "news", icon: Newspaper, enabled: false },
  { key: "community", label: "Community", tab: "community", icon: GitBranch, enabled: true },
  { key: "usecases", label: "Use Cases", tab: "usecases", icon: Lightbulb, enabled: true },
  { key: "saved", label: "Saved", tab: "saved", icon: Bookmark, enabled: true },
  { key: "settings", label: "Settings", tab: "settings", icon: Settings, enabled: true },
];

export const appTabs = appNavItems.filter((item): item is NavItem & { tab: Tab } =>
  Boolean(item.tab && item.enabled)
);
