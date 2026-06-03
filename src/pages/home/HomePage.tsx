import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import HomeBanner from "./components/HomeBanner";
import HomeCategoryChips from "./components/HomeCategoryChips";
import HomePopularList from "./components/HomePopularList";
import HomeSortTabs, { type SortKey } from "./components/HomeSortTabs";
import HomePostList from "./components/HomePostList";
import HomeTutorialOverlay from "./components/HomeTutorialOverlay";

import { ROUTES } from "../../app/router/routes";
import { getPosts } from "../../features/group-buy/api/groupBuyApi";
import { HOME_CANVAS } from "../../shared/constants/homeTheme";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import type { HomeCategoryId } from "./constants/homeCategoryChipsData";

const CATEGORY_API_MAP: Partial<Record<HomeCategoryId, string>> = {
  food: "food",
  daily: "daily",
  beauty: "beauty",
  stationery: "school",
};

function getPostsPayload(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).posts)) return (data as any).posts;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) return (data as any).items;
  return [];
}

export default function HomePage() {
  const nav = useNavigate();
  const [activeCategory, setActiveCategory] = useState<HomeCategoryId>("all");
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const apiCategory = activeCategory === "all" ? undefined : CATEGORY_API_MAP[activeCategory];

  const fetchHomePosts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      const res = await getPosts(30, 0, apiCategory, userId, sortBy, "open");
      setPosts(getPostsPayload(res.data));
    } catch (error) {
      console.error("Failed to fetch home posts", error);
      setPosts([]);
      setErrorMessage("공동구매 목록을 불러오지 못했어요.");
      toast.error("공동구매 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [apiCategory, sortBy]);

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

  const appliedFilterCount = activeCategory === "all" ? 0 : 1;

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

        <section
          aria-label="전체 공동구매 목록"
          style={{
            margin: "14px 14px 104px",
            padding: "12px 12px 12px",
            borderRadius: 28,
            border: "1px solid #EEF2F6",
            background: "#ffffff",
            boxShadow: "0 8px 28px rgba(15, 23, 42, 0.04)",
          }}
        >
          <HomeSortTabs
            sortBy={sortBy}
            totalCount={posts.length}
            appliedFilterCount={appliedFilterCount}
            onChange={setSortBy}
            onFilterClick={() => toast.message("필터는 곧 연결할게요.")}
          />

          <HomePostList
            posts={posts}
            loading={loading}
            sortBy={sortBy}
            emptyText={errorMessage || undefined}
            onItemClick={(id) => nav(ROUTES.GROUP_BUY_DETAIL.replace(":id", String(id)))}
          />
        </section>
      </main>
      <HomeTutorialOverlay />
    </div>
  );
}
