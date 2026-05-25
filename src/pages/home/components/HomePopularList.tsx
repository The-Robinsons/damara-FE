import { Flame, ImageIcon } from "lucide-react";

import FavoriteHeartButton from "../../../features/group-buy/components/FavoriteHeartButton";
import { getImageUrl } from "../../../shared/utils/imageUrl";
import {
  BADGE_INFO_BG,
  BADGE_INFO_TEXT,
  background,
  BRAND_PRIMARY,
  DANGER,
  GHOST_ON_SOLID,
  HOME_BORDER,
  TEXT_META,
  TEXT_TITLE,
} from "../../../shared/constants/homeTheme";

interface HomePopularListProps {
  posts: any[];
  onItemClick: (id: number | string) => void;
}

function getFirstImageUrl(post: any): string | null {
  const firstImage = post.images?.[0];
  const img =
    (typeof firstImage === "string" ? firstImage : undefined) ||
    firstImage?.imageUrl ||
    firstImage?.url ||
    post.image ||
    null;
  if (!img) return null;
  return getImageUrl(img);
}

function getPopularDisplay(post: any, idx: number) {
  const rawTitle = String(post.title ?? "").trim();
  const current = Number(post.currentQuantity ?? 0);
  const max = Number(post.minParticipants ?? 2);
  const progress = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0;

  if (rawTitle.includes("물티슈")) {
    return { title: "물티슈 공동구매", meta: "D-2 · 자연캠 픽업", progress };
  }
  if (rawTitle.includes("옥스퍼드")) {
    return { title: "옥스퍼드 노트 공동구매", meta: "D-3 · 학생회관 앞 거래", progress };
  }
  if (rawTitle.includes("샴푸")) {
    return { title: "샴푸 공동구매", meta: "D-1 · 자연캠 픽업", progress };
  }

  const fallbackMeta = ["D-4 · 명지대 픽업", "D-5 · 자연캠 픽업", "D-6 · 학생회관 앞 거래"][idx % 3];
  return { title: rawTitle || "공동구매 상품", meta: fallbackMeta, progress };
}

export default function HomePopularList({ posts, onItemClick }: HomePopularListProps) {
  if (posts.length === 0) return null;

  const sorted = [...posts]
    .sort((a, b) => (b.currentQuantity ?? 0) - (a.currentQuantity ?? 0))
    .slice(0, 6);

  return (
    <section aria-label="인기 공동구매" style={{ paddingTop: 8 }}>
      <div style={{ padding: "0 20px 8px" }}>
        <p
          style={{
            margin: 0,
            color: TEXT_META,
            fontSize: 12,
            fontWeight: 750,
            lineHeight: "17px",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Flame size={14} strokeWidth={2} color={DANGER} fill="rgba(240,68,82,0.12)" aria-hidden />
          실시간 인기
        </p>
      </div>

      <ul
        className="no-scrollbar flex overflow-x-auto"
        style={{
          gap: 12,
          padding: "0 20px 8px",
          margin: 0,
          scrollbarWidth: "none",
        }}
      >
        {sorted.map((post, idx) => {
          const imgUrl = getFirstImageUrl(post);
          const price = Math.floor(Number(post.price ?? 0)).toLocaleString("ko-KR");
          const current = Number(post.currentQuantity ?? 0);
          const max = Number(post.minParticipants ?? 2);
          const display = getPopularDisplay(post, idx);

          return (
            <li key={post.id} style={{ width: 140, flex: "0 0 140px" }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onItemClick(post.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onItemClick(post.id);
                  }
                }}
                className="text-left"
                style={{
                  width: "100%",
                  height: 204,
                  overflow: "hidden",
                  borderRadius: 22,
                  background: "#ffffff",
                  border: "1px solid #EEF2F6",
                  boxShadow: "0 10px 26px rgba(15,23,42,0.055), 0 1px 3px rgba(15,23,42,0.035)",
                  cursor: "pointer",
                }}
              >
                <div className="relative" style={{ height: 82, width: "100%", padding: 8, background: "#ffffff", boxSizing: "border-box" }}>
                  {idx === 0 ? (
                    <span
                      style={{
                        position: "absolute",
                        left: 8,
                        top: 8,
                        height: 19,
                        padding: "0 7px 0 6px",
                        borderRadius: 999,
                        backgroundColor: DANGER,
                        color: background,
                        fontSize: 9.5,
                        fontWeight: 800,
                        lineHeight: "18px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        zIndex: 2,
                      }}
                    >
                      <Flame size={10} strokeWidth={1.9} color={background} fill={GHOST_ON_SOLID} aria-hidden />
                      HOT
                    </span>
                  ) : null}
                  <FavoriteHeartButton
                    postId={post.id}
                    initialIsFavorite={Boolean(post.isFavorite)}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      width: 24,
                      height: 24,
                      padding: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 999,
                      backgroundColor: "rgba(255,255,255,0.88)",
                      color: "#A0A8B5",
                      zIndex: 2,
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
                    }}
                    iconClassName="size-3.5"
                  />
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                      borderRadius: 16,
                      background: "#F7F9FC",
                    }}
                  >
                    {imgUrl && imgUrl !== "/placeholder.png" ? (
                      <img
                        src={imgUrl}
                        alt=""
                        style={{ width: "84%", height: "84%", objectFit: "contain" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <ImageIcon size={30} color="rgba(78,89,104,0.42)" strokeWidth={1.55} aria-hidden />
                    )}
                  </div>
                </div>
                <div style={{ padding: "7px 9px 9px" }}>
                  <div className="flex items-center" style={{ gap: 4, height: 17 }}>
                    <span
                      style={{
                        height: 17,
                        padding: "0 6px",
                        borderRadius: 999,
                        backgroundColor: BADGE_INFO_BG,
                        color: BADGE_INFO_TEXT,
                        fontSize: 9,
                        fontWeight: 800,
                        lineHeight: "17px",
                      }}
                    >
                      모집중
                    </span>
                    <span style={{ color: TEXT_META, fontSize: 9.5, fontWeight: 750, lineHeight: "13px" }}>
                      · {current}/{max}명
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "5px 0 0",
                      minHeight: 32,
                      color: TEXT_TITLE,
                      fontSize: 12.5,
                      fontWeight: 850,
                      lineHeight: "16px",
                      letterSpacing: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {display.title}
                  </p>
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
                  <p
                    style={{
                      margin: "3px 0 0",
                      color: TEXT_META,
                      fontSize: 10.5,
                      fontWeight: 650,
                      lineHeight: "14px",
                    }}
                  >
                    {display.meta}
                  </p>
                  <div style={{ marginTop: 6 }}>
                    <div
                      style={{
                        width: "100%",
                        height: 4,
                        overflow: "hidden",
                        borderRadius: 999,
                        background: "#EDF2FA",
                      }}
                    >
                      <div
                        style={{
                          width: `${display.progress}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: BRAND_PRIMARY,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
