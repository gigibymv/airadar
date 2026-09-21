import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useNewsArticles, useCommunityPosts } from "@/hooks/useNewsData";
import { useUseCases } from "@/hooks/useUseCases";
import { useFeedRefresh } from "@/hooks/useFeedRefresh";
import { type NewsCategory } from "@/data/newsData";
import { AppShellLayout } from "@/features/shell/AppShellLayout";
import { type Tab } from "@/features/shell/navigation";
import { DailyBriefTab } from "@/features/tabs/DailyBriefTab";
import { LatestNewsTab } from "@/features/tabs/LatestNewsTab";
import { UseCasesTab } from "@/features/tabs/UseCasesTab";
import { CommunityTab } from "@/features/tabs/CommunityTab";
import { SavedTab } from "@/features/tabs/SavedTab";
import { SettingsTab } from "@/features/tabs/SettingsTab";

const Index = () => {
  const { displayName, user } = useAuth();
  const hasPersonalAccess = Boolean(user);
  const [activeTab, setActiveTab] = useState<Tab>("briefing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);

  const {
    isBookmarked,
    toggleBookmark,
    getByCategory,
    loading: bookmarksLoading,
    error: bookmarksError,
  } = useBookmarks();
  const { data: newsArticles = [], refetch: refetchNews } = useNewsArticles();
  const { data: communityPosts = [], refetch: refetchCommunity } = useCommunityPosts();
  const { data: useCasePosts = [], refetch: refetchUseCases } = useUseCases();

  const onRefreshed = useCallback(
    () => Promise.all([refetchNews(), refetchCommunity(), refetchUseCases()]),
    [refetchNews, refetchCommunity, refetchUseCases]
  );
  const { isRefreshing, refresh: handleRefreshAll } = useFeedRefresh({
    onRefreshed,
    onShowAllNewsReset: () => setShowAllNews(false),
  });

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab !== "news") setMobileSearchOpen(false);
  }, []);

  return (
    <AppShellLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      displayName={displayName}
      isPublic={!hasPersonalAccess}
      showGlobalSearch={activeTab === "news"}
      mobileMenuOpen={mobileMenuOpen}
      onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
      mobileSearchOpen={mobileSearchOpen}
      onToggleMobileSearch={() => setMobileSearchOpen((open) => !open)}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
    >
      {activeTab === "briefing" && <DailyBriefTab showBookmarkControls={hasPersonalAccess} />}

      {activeTab === "news" && (
        <LatestNewsTab
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          showAllNews={showAllNews}
          onShowAllNews={() => setShowAllNews(true)}
          isRefreshing={isRefreshing}
          onRefreshAll={hasPersonalAccess ? handleRefreshAll : undefined}
          newsArticles={newsArticles}
          isBookmarked={isBookmarked}
          onToggleBookmark={hasPersonalAccess ? toggleBookmark : undefined}
        />
      )}

      {activeTab === "usecases" && (
        <UseCasesTab
          useCasePosts={useCasePosts}
          isBookmarked={isBookmarked}
          onToggleBookmark={hasPersonalAccess ? toggleBookmark : undefined}
        />
      )}

      {activeTab === "community" && (
        <CommunityTab
          communityPosts={communityPosts}
          isRefreshing={isRefreshing}
          onRefreshAll={hasPersonalAccess ? handleRefreshAll : undefined}
          isBookmarked={isBookmarked}
          onToggleBookmark={hasPersonalAccess ? toggleBookmark : undefined}
        />
      )}

      {activeTab === "saved" &&
        (hasPersonalAccess ? (
          <SavedTab
            getByCategory={getByCategory}
            isLoading={bookmarksLoading}
            errorMessage={bookmarksError}
            onToggleNewsBookmark={(b) =>
              toggleBookmark({
                id: b.id,
                category: "news",
                title: b.title,
                url: b.url,
                source: b.source,
                data: b.data,
              })
            }
            onToggleUseCaseBookmark={(b) =>
              toggleBookmark({
                id: b.id,
                category: "usecases",
                title: b.title,
                url: b.url,
                source: b.source,
                data: b.data,
              })
            }
            onToggleCommunityBookmark={(b) =>
              toggleBookmark({
                id: b.id,
                category: "community",
                title: b.title,
                url: b.url,
                source: b.source,
                data: b.data,
              })
            }
          />
        ) : (
          <SavedTab requiresSignIn />
        ))}

      {activeTab === "settings" && <SettingsTab />}
    </AppShellLayout>
  );
};

export default Index;
