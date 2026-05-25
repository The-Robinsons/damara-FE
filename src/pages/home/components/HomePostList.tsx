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

  if (rawTitle === "ㅇ") {
    return {
      title: "모바일 쿠폰 공동구매",
      meta: "마감 5월 9일 · 명지대 자연캠 픽업",
    };
  }

  if (rawTitle.includes("옥스퍼드")) {
    return {
      title: "옥스퍼드 노트 구매하실분~",
      meta: "마감 5월 10일 · 학생회관 앞 거래",
    };
  }

  if (rawTitle.includes("샴푸")) {
    return {
      title: "샴푸 공동구매",
      meta: "마감 5월 11일 · 명지대 후문 거래",
    };
  }

  if (rawTitle.includes("물티슈")) {
    return {
      title: "물티슈 공동구매",
      meta: "마감 5월 12일 · 명지대 정문 픽업",
    };
  }

  if (rawTitle.includes("대파")) {
    return {
      title: "대파 공동구매",
      meta: "마감 5월 13일 · 명지대 도서관 앞 거래",
    };
  }

  return {
    title: rawTitle || "공동구매 상품",
    meta: `마감 예정 · ${post.pickupLocation || "명지대 캠퍼스"} 픽업`,
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
      {sorted.map((post) => {
        const display = getDisplayInfo(post);
        const currentPeople = Number(post.currentQuantity ?? 0);
        const maxPeople = Number(post.minParticipants ?? 2);
        const progressPercent = maxPeople > 0 ? Math.min(Math.round((currentPeople / maxPeople) * 100), 100) : 0;
        const price = Math.floor(Number(post.price ?? 0)).toLocaleString("ko-KR");
        const image = getImageUrl(getFirstImage(post));

        return (
          <li key={post.id}>
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
                <p
                  style={{
                    margin: "2px 0 0",
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
                  <span style={{ color: TEXT_META, fontSize: 11, fontWeight: 750, lineHeight: "15px" }}>
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
                  <span style={{ color: "#A0A8B5", fontSize: 11, fontWeight: 650, marginLeft: 4 }}>/ 1인</span>
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
