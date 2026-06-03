import FavoriteHeartButton from "../../../features/group-buy/components/FavoriteHeartButton";
import EmptyState from "../../../shared/components/damara/EmptyState";
import { SkeletonGroupBuyRow } from "../../../shared/components/damara/Skeleton";
import { Package } from "lucide-react";
import { BRAND_PRIMARY, TEXT_META, TEXT_TITLE } from "../../../shared/constants/homeTheme";
import { getImageUrl } from "../../../shared/utils/imageUrl";
import type { SortKey } from "./HomeSortTabs";

interface HomePostListProps {
  posts: any[];
  sortBy?: SortKey;
  emptyText?: string;
  loading?: boolean;
  onItemClick: (id: number | string) => void;
}

function getFirstImage(post: any): string {
  const firstImage = post.images?.[0];
  return (
    (typeof firstImage === "string" ? firstImage : undefined) ||
    firstImage?.imageUrl ||
    firstImage?.url ||
    post.image ||
    "/placeholder.png"
  );
}

function getTradeBadge(post: any) {
  const raw = String(post.groupBuyType ?? post.type ?? "").toLowerCase();
  if (raw === "post_recruit" || raw === "post_purchase" || raw === "post_purchase_recruit") {
    return { label: "나눔구매", color: "#5B67F1", background: "rgba(91, 103, 241, 0.11)" };
  }
  return { label: "함께구매", color: BRAND_PRIMARY, background: "rgba(49, 130, 246, 0.1)" };
}

function sortPosts(posts: any[], sortBy?: SortKey): any[] {
  if (!sortBy) return posts;
  const arr = [...posts];
  arr.sort((a, b) => {
    if (sortBy === "deadline") {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    }
    if (sortBy === "popular") {
      return (b.currentQuantity ?? 0) - (a.currentQuantity ?? 0);
    }
    return (b.id ?? 0) - (a.id ?? 0);
  });
  return arr;
}

function getDisplayInfo(post: any) {
  const rawTitle = String(post.title ?? "").trim();
  const productName = String(post.productName ?? "").trim();

  return {
    title: rawTitle || productName || "공동구매 상품",
    meta: `${post.deadlineLabel || "마감 예정"} · ${post.pickupLocation || "명지대 캠퍼스"} 픽업`,
  };
}
export default function HomePostList({
  posts,
  sortBy,
  emptyText,
  loading = false,
  onItemClick,
}: HomePostListProps) {
  const sorted = sortPosts(posts, sortBy);

  if (loading) {
    return (
      <ul className="flex flex-col" style={{ gap: 12, padding: "12px 0 0" }}>
        {[0, 1, 2, 3].map((key) => (
          <li key={key}>
            <SkeletonGroupBuyRow />
          </li>
        ))}
      </ul>
    );
  }

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={<Package size={56} strokeWidth={1.25} />}
        title="공동구매가 없어요"
        description={emptyText || "새로운 공동구매가 올라오면 여기에서 볼 수 있어요."}
      />
    );
  }

  return (
    <ul className="flex flex-col" style={{ gap: 10, padding: "10px 0 0", margin: 0 }}>
      {sorted.map((post, index) => {
        const display = getDisplayInfo(post);
        const currentPeople = Number(post.currentQuantity ?? 0);
        const maxPeople = Number(post.minParticipants ?? 2);
        const progressPercent = maxPeople > 0 ? Math.min(Math.round((currentPeople / maxPeople) * 100), 100) : 0;
        const price = Math.floor(Number(post.price ?? 0)).toLocaleString("ko-KR");
        const image = getImageUrl(getFirstImage(post));
        const tradeBadge = getTradeBadge(post);

        return (
          <li key={post.id} data-list-item style={{ animationDelay: `${Math.min(index, 7) * 90}ms` }}>
            <article
              role="button"
              tabIndex={0}
              onClick={() => onItemClick(post.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onItemClick(post.id);
                }
              }}
              className="flex"
              style={{
                position: "relative",
                minHeight: 128,
                boxSizing: "border-box",
                gap: 11,
                padding: 12,
                borderRadius: 22,
                border: "1px solid #EEF2F6",
                background: "#ffffff",
                boxShadow: "0 6px 20px rgba(15, 23, 42, 0.035)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  borderRadius: 16,
                  background: "#ffffff",
                }}
              >
                {image && image !== "/placeholder.png" ? (
                  <img
                    data-damara-image
                    src={image}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <Package size={30} color={TEXT_META} strokeWidth={1.45} aria-hidden />
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1, paddingRight: 28 }}>
                <h3
                  style={{
                    margin: 0,
                    color: TEXT_TITLE,
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: "20px",
                    letterSpacing: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {display.title}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                  <span
                    style={{
                      height: 19,
                      padding: "0 8px",
                      borderRadius: 999,
                      color: tradeBadge.color,
                      background: tradeBadge.background,
                      fontSize: 10,
                      fontWeight: 850,
                      lineHeight: "19px",
                    }}
                  >
                    {tradeBadge.label}
                  </span>
                </div>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: TEXT_META,
                    fontSize: 11.5,
                    fontWeight: 600,
                    lineHeight: "15px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {display.meta}
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    color: BRAND_PRIMARY,
                    fontSize: 12,
                    fontWeight: 800,
                    lineHeight: "15px",
                  }}
                >
                  {currentPeople}/{maxPeople}명 참여 중
                </p>

                <div className="flex items-center" style={{ gap: 7, marginTop: 4 }}>
                  <div
                    style={{
                      height: 5,
                      flex: 1,
                      overflow: "hidden",
                      borderRadius: 999,
                      background: "#EDF2FA",
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPercent}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: BRAND_PRIMARY,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      minWidth: 38,
                      padding: "2px 7px",
                      borderRadius: 999,
                      color: BRAND_PRIMARY,
                      background: "rgba(49, 130, 246, 0.1)",
                      fontSize: 11,
                      fontWeight: 850,
                      lineHeight: "15px",
                      textAlign: "center",
                    }}
                  >
                    {progressPercent}%
                  </span>
                </div>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: BRAND_PRIMARY,
                    fontSize: 17,
                    fontWeight: 900,
                    lineHeight: "21px",
                    letterSpacing: 0,
                  }}
                >
                  {price}원
                </p>
              </div>

              <FavoriteHeartButton
                postId={post.id}
                initialIsFavorite={Boolean(post.isFavorite)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  width: 26,
                  height: 26,
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "#A0A8B5",
                }}
                iconClassName="size-4"
              />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
