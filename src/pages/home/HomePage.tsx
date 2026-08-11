import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import HomeBanner from "./components/HomeBanner";
import HomeCategoryChips from "./components/HomeCategoryChips";
import HomeFilterSheet from "./components/HomeFilterSheet";
import HomePopularList from "./components/HomePopularList";
import HomeSortTabs, { type SortKey } from "./components/HomeSortTabs";
import HomePostList from "./components/HomePostList";
import HomeTutorialOverlay from "./components/HomeTutorialOverlay";

import { ROUTES } from "../../app/router/routes";
import { getPosts } from "../../features/group-buy/api/groupBuyApi";
import SurfaceCard from "../../shared/components/damara/SurfaceCard";
import SectionHeader from "../../shared/components/damara/SectionHeader";
import { HOME_CANVAS } from "../../shared/constants/homeTheme";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import type { HomeCategoryId } from "./constants/homeCategoryChipsData";
import type { HomePost } from "./types";
import type { ApiPostStatus } from "../../shared/api/swaggerTypes";

const CATEGORY_API_MAP: Partial<Record<HomeCategoryId, string>> = {
  food: "food",
  daily: "daily",
  beauty: "beauty",
  stationery: "school",
};

function getPostsPayload(data: unknown): HomePost[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const record = data as { posts?: unknown; items?: unknown };
  if (Array.isArray(record.posts)) return record.posts as HomePost[];
  if (Array.isArray(record.items)) return record.items as HomePost[];
  return [];
}

export default function HomePage() {
  const nav = useNavigate();
  const [activeCategory, setActiveCategory] = useState<HomeCategoryId>("all");
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const [statusFilter, setStatusFilter] = useState<ApiPostStatus>("open");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const apiCategory = activeCategory === "all" ? undefined : CATEGORY_API_MAP[activeCategory];

  const fetchHomePosts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      const res = await getPosts(30, 0, apiCategory, userId, sortBy, statusFilter);
      setPosts(getPostsPayload(res.data));
    } catch (error) {
      console.error("Failed to fetch home posts", error);
      setPosts([]);
      setErrorMessage("공동구매 목록을 불러오지 못했어요.");
      toast.error("공동구매 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [apiCategory, sortBy, statusFilter]);

  useEffect(() => {
    fetchHomePosts();
  }, [fetchHomePosts]);

  const popularPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        const aScore = Number(a.favoriteCount ?? 0) + Number(a.currentQuantity ?? 0);
        const bScore = Number(b.favoriteCount ?? 0) + Number(b.currentQuantity ?? 0);
        return bScore - aScore;
      })
      .slice(0, 6);
  }, [posts]);

  const appliedFilterCount = (activeCategory === "all" ? 0 : 1) + (statusFilter === "open" ? 0 : 1);

  return (
    <div
      data-page="home"
      style={{
        width: "100%",
        minHeight: "100dvh",
        overflowX: "hidden",
        backgroundColor: HOME_CANVAS,
      }}
    >
      <main style={{ width: "100%", overflowX: "hidden", backgroundColor: HOME_CANVAS }}>
        <div style={{ padding: "14px 20px 0" }}>
          <HomeBanner />
        </div>

        <div style={{ paddingTop: 8 }}>
          <HomeCategoryChips activeCategory={activeCategory} onChange={setActiveCategory} />
        </div>

        <HomePopularList
          posts={popularPosts}
          onItemClick={(id) => nav(ROUTES.GROUP_BUY_DETAIL.replace(":id", String(id)))}
        />

        <SurfaceCard
          aria-label="전체 공동구매 목록"
          style={{
            margin: "14px 14px 104px",
            padding: 12,
          }}
        >
          <SectionHeader title="전체 공동구매" action={<span style={{ color: "#8b95a1", fontSize: 12, fontWeight: 700 }}>{posts.length}개</span>} style={{ padding: "2px 2px 10px" }} />
          <HomeSortTabs
            sortBy={sortBy}
            totalCount={posts.length}
            appliedFilterCount={appliedFilterCount}
            onChange={setSortBy}
            onFilterClick={() => setIsFilterOpen(true)}
          />

          <HomePostList
            posts={posts}
            loading={loading}
            sortBy={sortBy}
            emptyText={errorMessage || undefined}
            onItemClick={(id) => nav(ROUTES.GROUP_BUY_DETAIL.replace(":id", String(id)))}
          />
        </SurfaceCard>
      </main>
      <HomeFilterSheet
        open={isFilterOpen}
        status={statusFilter}
        onApply={setStatusFilter}
        onClose={() => setIsFilterOpen(false)}
      />
      <HomeTutorialOverlay />
    </div>
  );
}
