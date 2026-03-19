import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useNewsArticles, useCommunityPosts } from "@/hooks/useNewsData";
import { useUseCases } from "@/hooks/useUseCases";
import { useFeedRefresh } from "@/hooks/useFeedRefresh";
import { useCommunitySearch } from "@/hooks/useCommunitySearch";
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
  const { displayName } = useAuth();
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

  const {
    query: communityQuery,
    setQuery: setCommunityQuery,
    results: communitySearchResults,
    isSearching: isCommunitySearching,
    hasSearched: hasCommunitySearched,
    search: handleCommunitySearch,
    reset: handleCommunitySearchReset,
  } = useCommunitySearch();

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
      showGlobalSearch={activeTab === "news"}
      mobileMenuOpen={mobileMenuOpen}
      onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
      mobileSearchOpen={mobileSearchOpen}
      onToggleMobileSearch={() => setMobileSearchOpen((open) => !open)}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
    >
      {activeTab === "briefing" && <DailyBriefTab />}

      {activeTab === "news" && (
        <LatestNewsTab
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          showAllNews={showAllNews}
          onShowAllNews={() => setShowAllNews(true)}
          isRefreshing={isRefreshing}
          onRefreshAll={handleRefreshAll}
          newsArticles={newsArticles}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
        />
      )}

      {activeTab === "usecases" && (
        <UseCasesTab
          useCasePosts={useCasePosts}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
        />
      )}

      {activeTab === "community" && (
        <CommunityTab
          communityQuery={communityQuery}
          onCommunityQueryChange={setCommunityQuery}
          onCommunitySearch={handleCommunitySearch}
          isCommunitySearching={isCommunitySearching}
          hasCommunitySearched={hasCommunitySearched}
          communitySearchResults={communitySearchResults}
          communityPosts={communityPosts}
          isRefreshing={isRefreshing}
          onRefreshAll={handleRefreshAll}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
          onResetSearch={handleCommunitySearchReset}
        />
      )}

      {activeTab === "saved" && (
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
      )}

      {activeTab === "settings" && <SettingsTab />}
    </AppShellLayout>
  );
};

export default Index;
