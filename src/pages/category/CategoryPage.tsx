import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ImageIcon, RotateCw, Search, Users } from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import { getPosts } from "../../features/group-buy/api/groupBuyApi";
import FavoriteHeartButton from "../../features/group-buy/components/FavoriteHeartButton";
import EmptyState from "../../shared/components/damara/EmptyState";
import { getImageUrl } from "../../shared/utils/imageUrl";
import {
  BADGE_INFO_BG,
  BADGE_INFO_TEXT,
  BADGE_URGENT_BG,
  BADGE_URGENT_TEXT,
  BRAND_PRIMARY,
  HOME_BORDER,
  HOME_CANVAS,
  SCRIM_LIGHT,
  TEXT_META,
  blue50,
  green50,
  grey100,
  grey300,
  grey400,
  grey500,
  grey900,
  purple50,
  yellow50,
} from "../../shared/constants/homeTheme";
import {
  UI_BADGE_FW,
  UI_IX_BUTTON,
  UI_IX_HOVER_GREY50,
  UI_PAGE_PAD_X,
  UI_R_BADGE,
} from "../../shared/constants/damaraUISystem";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";

type FilterId = "all" | "food" | "daily" | "beauty" | "school";

type ApiPost = {
  id: string | number;
  title?: string;
  content?: string;
  price?: string | number;
  currentQuantity?: number;
  minParticipants?: number;
  status?: string;
  deadline?: string;
  pickupLocation?: string;
  category?: string;
  groupBuyType?: string | null;
  type?: string | null;
  images?: Array<string | { imageUrl?: string; url?: string }>;
  image?: string;
  isFavorite?: boolean;
};

const FILTERS: { id: FilterId; label: string; apiCategory?: string }[] = [
  { id: "all", label: "전체" },
  { id: "food", label: "먹거리", apiCategory: "food" },
  { id: "daily", label: "생활용품", apiCategory: "daily" },
  { id: "beauty", label: "뷰티·패션", apiCategory: "beauty" },
  { id: "school", label: "학용품", apiCategory: "school" },
];

const FILTER_IDS = new Set<FilterId>(FILTERS.map((filter) => filter.id));
const CATEGORY_ALIASES: Record<FilterId, string[]> = {
  all: [],
  food: ["food", "먹거리", "식품"],
  daily: ["daily", "생활용품", "생활"],
  beauty: ["beauty", "뷰티", "뷰티·패션", "패션"],
  school: ["school", "stationery", "학용품", "문구"],
};
const THUMB_BG = [blue50, green50, yellow50, purple50, grey100];

function parseCatParam(value: string | null): FilterId {
  if (value === "stationery") return "school";
  if (value && FILTER_IDS.has(value as FilterId)) return value as FilterId;
  return "all";
}

function getTradeBadge(post: ApiPost) {
  const raw = String(post.groupBuyType ?? post.type ?? "").toLowerCase();
  if (raw === "post_recruit" || raw === "post_purchase" || raw === "post_purchase_recruit") {
    return { label: "나눔구매", color: "#5B67F1", background: "rgba(91, 103, 241, 0.11)" };
  }
  return { label: "함께구매", color: BRAND_PRIMARY, background: "rgba(49, 130, 246, 0.1)" };
}

function extractPosts(data: unknown): ApiPost[] {
  if (Array.isArray(data)) return data as ApiPost[];
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const candidates = [record.posts, record.items, record.data, record.value, record.rows];
  const found = candidates.find(Array.isArray);
  return found ? (found as ApiPost[]) : [];
}

function getFirstImage(post: ApiPost): string {
  const firstImage = post.images?.[0];
  return (
    (typeof firstImage === "string" ? firstImage : undefined) ||
    (typeof firstImage === "object" ? firstImage?.imageUrl || firstImage?.url : undefined) ||
    post.image ||
    ""
  );
}

function formatPrice(value: string | number | undefined): string {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0원";
  return `${Math.floor(numberValue).toLocaleString("ko-KR")}원`;
}

function getProgress(post: ApiPost): number {
  const current = Number(post.currentQuantity ?? 0);
  const max = Number(post.minParticipants ?? 0);
  if (max <= 0) return 0;
  return Math.min(current / max, 1);
}

function isClosed(post: ApiPost): boolean {
  const status = String(post.status ?? "").toLowerCase();
  const current = Number(post.currentQuantity ?? 0);
  const max = Number(post.minParticipants ?? 0);
  const deadlineMs = post.deadline ? new Date(post.deadline).getTime() : NaN;
  return (
    ["closed", "completed", "sold_out", "cancelled", "recruit_full"].includes(status) ||
    (max > 0 && current >= max) ||
    (Number.isFinite(deadlineMs) && deadlineMs < Date.now())
  );
}

function formatDeadline(deadline?: string): string {
  if (!deadline) return "마감일 미정";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "마감일 미정";
  return `마감 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function matchesCategory(post: ApiPost, filter: FilterId): boolean {
  if (filter === "all") return true;
  const rawCategory = String(post.category ?? "").trim().toLowerCase();
  return CATEGORY_ALIASES[filter].some((alias) => rawCategory === alias.toLowerCase());
}

export default function CategoryPage() {
  const nav = useNavigate();
  const location = useLocation();
  const filter = useMemo(() => parseCatParam(new URLSearchParams(location.search).get("cat")), [location.search]);
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const selectedFilter = FILTERS.find((item) => item.id === filter);
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        const res = await getPosts(50, 0, selectedFilter?.apiCategory, userId);
        setPosts(extractPosts(res.data));
      } catch (err) {
        console.error(err);
        setError("공구 목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const setFilterAndUrl = (id: FilterId) => {
    const nextSearch = id === "all" ? "" : `?cat=${encodeURIComponent(id)}`;
    nav({ pathname: ROUTES.CATEGORY, search: nextSearch }, { replace: true });
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (!matchesCategory(post, filter)) return false;
      if (!q) return true;
      return [post.title, post.content, post.pickupLocation, post.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [filter, posts, search]);

  return (
    <div data-page="카테고리" style={{ minHeight: "100dvh", width: "100%", backgroundColor: HOME_CANVAS, overflowX: "hidden" }}>
      <section style={{ padding: `14px ${UI_PAGE_PAD_X}px 0` }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, color: grey900, fontSize: 21, lineHeight: "29px", fontWeight: 900, letterSpacing: 0 }}>
              카테고리
            </h1>
          </div>
        </div>

        <label
          className="flex items-center gap-2"
          style={{
            height: 44,
            marginTop: 12,
            padding: "0 14px",
            borderRadius: 14,
            border: `1px solid rgba(229, 232, 235, 0.92)`,
            backgroundColor: "#fff",
            boxSizing: "border-box",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.035)",
          }}
        >
          <Search size={17} strokeWidth={2} style={{ color: grey500, flexShrink: 0 }} aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="상품명, 장소 검색"
            className="placeholder:text-[#b0b8c1]"
            style={{ flex: 1, minWidth: 0, height: "100%", border: "none", background: "transparent", fontSize: 13.5, fontWeight: 500, color: grey900, outline: "none" }}
          />
        </label>
      </section>

      <div className="no-scrollbar" style={{ display: "flex", gap: 6, padding: `10px ${UI_PAGE_PAD_X}px 12px`, overflowX: "auto", scrollbarWidth: "none" }}>
        {FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterAndUrl(item.id)}
              className={active ? UI_IX_BUTTON : `${UI_IX_BUTTON} ${UI_IX_HOVER_GREY50} bg-white`}
              style={{
                flexShrink: 0,
                height: 30,
                padding: "0 12px",
                borderRadius: UI_R_BADGE,
                border: active ? `1px solid ${blue50}` : `1px solid ${HOME_BORDER}`,
                background: active ? blue50 : "#ffffff",
                color: active ? BRAND_PRIMARY : TEXT_META,
                fontSize: 12,
                fontWeight: active ? 800 : 650,
                lineHeight: "30px",
                cursor: "pointer",
                boxShadow: "none",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <main style={{ padding: `0 ${UI_PAGE_PAD_X}px 96px`, minHeight: 0 }}>
        {loading ? (
          <CardSkeletonGrid />
        ) : error ? (
          <EmptyState icon={<RotateCw size={56} strokeWidth={1.25} />} title={error} description="잠시 후 다시 새로고침해 주세요." />
        ) : visible.length === 0 ? (
          <EmptyState icon={<Search size={56} strokeWidth={1.25} />} title="검색 결과가 없어요" description="다른 검색어나 카테고리로 다시 찾아볼까요?" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {visible.map((post, index) => (
              <CategoryCard
                key={String(post.id)}
                post={post}
                tint={THUMB_BG[index % THUMB_BG.length]}
                index={index}
                onClick={() => nav(ROUTES.GROUP_BUY_DETAIL.replace(":id", String(post.id)))}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CategoryCard({ post, tint, index, onClick }: { post: ApiPost; tint: string; index: number; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);
  const current = Number(post.currentQuantity ?? 0);
  const max = Number(post.minParticipants ?? 0);
  const progress = getProgress(post);
  const closed = isClosed(post);
  const imageUrl = getImageUrl(getFirstImage(post));
  const tradeBadge = getTradeBadge(post);

  return (
    <article
      data-list-item
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]"
      style={{ borderRadius: 16, border: `1px solid rgba(229, 232, 235, 0.92)`, backgroundColor: "#fff", overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.035)", animationDelay: `${Math.min(index, 7) * 90}ms` }}
    >
      <div className="relative" style={{ height: 124, background: `linear-gradient(145deg, ${tint} 0%, ${blue50} 100%)` }}>
        <span style={{ position: "absolute", left: 8, top: 8, height: 19, padding: "0 8px", borderRadius: UI_R_BADGE, backgroundColor: closed ? BADGE_URGENT_BG : BADGE_INFO_BG, color: closed ? BADGE_URGENT_TEXT : BADGE_INFO_TEXT, fontSize: 9.5, fontWeight: UI_BADGE_FW, lineHeight: "19px", zIndex: 2 }}>
          {closed ? "마감" : "모집중"}
        </span>
        <div style={{ position: "absolute", right: 6, top: 6, zIndex: 2 }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
          <FavoriteHeartButton
            postId={post.id}
            initialIsFavorite={Boolean(post.isFavorite)}
            style={{
              width: 25,
              height: 25,
              padding: 4,
              color: grey500,
              background: "rgba(255, 255, 255, 0.92)",
              borderRadius: 999,
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.14)",
              display: "grid",
              placeItems: "center",
            }}
            iconClassName=""
            iconSize={16}
          />
        </div>
        {!imgError && imageUrl && imageUrl !== "/placeholder.png" ? (
          <img data-damara-image src={imageUrl} alt="" onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="flex items-center justify-center" style={{ width: "100%", height: "100%", color: grey400 }} aria-hidden>
            <ImageIcon size={36} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div style={{ padding: "10px 11px 11px", display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 850, color: grey900, lineHeight: "18px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {post.title || "제목 없는 공구"}
        </p>
        <span
          style={{
            width: "fit-content",
            height: 18,
            padding: "0 7px",
            borderRadius: UI_R_BADGE,
            background: tradeBadge.background,
            color: tradeBadge.color,
            fontSize: 9.5,
            fontWeight: UI_BADGE_FW,
            lineHeight: "18px",
          }}
        >
          {tradeBadge.label}
        </span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: BRAND_PRIMARY, lineHeight: "20px", letterSpacing: 0 }}>
          {formatPrice(post.price)}
        </p>
        <p style={{ margin: 0, color: grey500, fontSize: 10.5, lineHeight: "15px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {post.pickupLocation || "수령 장소 미정"} · {formatDeadline(post.deadline)}
        </p>
        <div className="flex items-center" style={{ gap: 4 }}>
          <Users size={12} strokeWidth={2} style={{ color: TEXT_META, flexShrink: 0 }} aria-hidden />
          <span style={{ fontSize: 11, fontWeight: 650, color: TEXT_META, lineHeight: "16px" }}>
            {current}/{max || "-"}명 참여 중
          </span>
        </div>
        <div style={{ height: 4, marginTop: 2, borderRadius: 999, background: grey100, overflow: "hidden" }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 999, background: closed ? grey300 : BRAND_PRIMARY }} />
        </div>
      </div>
    </article>
  );
}

function CardSkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} style={{ height: 224, borderRadius: 16, background: "#fff", border: `1px solid ${HOME_BORDER}`, overflow: "hidden" }}>
          <div data-skeleton style={{ height: 124 }} />
          <div style={{ padding: 11, display: "grid", gap: 8 }}>
            <span data-skeleton style={{ height: 14, borderRadius: 999 }} />
            <span data-skeleton style={{ width: "70%", height: 18, borderRadius: 999 }} />
            <span data-skeleton style={{ width: "86%", height: 12, borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
