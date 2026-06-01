import { Flame, ImageIcon, MapPin } from "lucide-react";

import FavoriteHeartButton from "../../../features/group-buy/components/FavoriteHeartButton";
import { getImageUrl } from "../../../shared/utils/imageUrl";
import {
  BADGE_INFO_BG,
  BADGE_INFO_TEXT,
  background,
  BRAND_PRIMARY,
  DANGER,
  GHOST_ON_SOLID,
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
  const current = Number(post.currentQuantity ?? 0);
  const max = Number(post.minParticipants ?? 2);
  const progress = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0;
  const location = String(post.pickupLocation ?? "명지대 픽업");
  const deadline = String(post.deadlineLabel ?? `D-${idx + 2}`);

  return {
    title: String(post.title ?? "").trim() || "공동구매 상품",
    meta: `${deadline} · ${location}`,
    progress,
  };
}

export default function HomePopularList({ posts, onItemClick }: HomePopularListProps) {
  if (posts.length === 0) return null;

  const sorted = [...posts]
    .sort((a, b) => (b.currentQuantity ?? 0) - (a.currentQuantity ?? 0))
    .slice(0, 6);

  return (
    <section aria-label="실시간 인기 공동구매" style={{ paddingTop: 12 }}>
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 20px 10px" }}
      >
        <p
          style={{
            margin: 0,
            color: TEXT_TITLE,
            fontSize: 15,
            fontWeight: 850,
            lineHeight: "21px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Flame size={17} strokeWidth={2.2} color={DANGER} fill="rgba(240,68,82,0.12)" aria-hidden />
          실시간 인기
        </p>
        <span style={{ color: TEXT_META, fontSize: 11, fontWeight: 700 }}>
          지금 많이 보는 공구
        </span>
      </div>

      <ul
        className="no-scrollbar flex overflow-x-auto"
        style={{
          gap: 10,
          padding: "0 20px 10px",
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
            <li key={post.id} style={{ width: 272, flex: "0 0 272px" }}>
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
                className="text-left"
                style={{
                  display: "flex",
                  gap: 11,
                  width: "100%",
                  height: 157,
                  padding: 10,
                  overflow: "hidden",
                  borderRadius: 22,
                  background: "linear-gradient(135deg, #ffffff 0%, #ffffff 62%, #f5f9ff 100%)",
                  border: "1px solid #E8EEF7",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.06), 0 2px 5px rgba(15,23,42,0.035)",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: 104,
                    height: 135,
                    flexShrink: 0,
                    overflow: "hidden",
                    borderRadius: 17,
                    background: "#F8FAFC",
                  }}
                >
                  {idx === 0 ? (
                    <span
                      style={{
                        position: "absolute",
                        left: 7,
                        top: 7,
                        height: 20,
                        padding: "0 8px 0 6px",
                        borderRadius: 999,
                        backgroundColor: DANGER,
                        color: background,
                        fontSize: 10,
                        fontWeight: 850,
                        lineHeight: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        zIndex: 2,
                      }}
                    >
                      <Flame size={11} strokeWidth={2} color={background} fill={GHOST_ON_SOLID} aria-hidden />
                      HOT
                    </span>
                  ) : null}
                  {imgUrl && imgUrl !== "/placeholder.png" ? (
                    <img
                      src={imgUrl}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 17 }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <ImageIcon size={30} color="rgba(78,89,104,0.42)" strokeWidth={1.55} aria-hidden />
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1, padding: "1px 0 0" }}>
                  <div className="flex items-center justify-between" style={{ gap: 5 }}>
                    <span
                      style={{
                        height: 18,
                        padding: "0 7px",
                        borderRadius: 999,
                        backgroundColor: BADGE_INFO_BG,
                        color: BADGE_INFO_TEXT,
                        fontSize: 9.5,
                        fontWeight: 850,
                        lineHeight: "18px",
                      }}
                    >
                      모집중
                    </span>
                    <FavoriteHeartButton
                      postId={post.id}
                      initialIsFavorite={Boolean(post.isFavorite)}
                      style={{
                        width: 25,
                        height: 25,
                        flexShrink: 0,
                        padding: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 999,
                        backgroundColor: "#ffffff",
                        color: "#A0A8B5",
                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
                      }}
                      iconClassName="size-3.5"
                    />
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0",
                      minHeight: 34,
                      color: TEXT_TITLE,
                      fontSize: 13.5,
                      fontWeight: 850,
                      lineHeight: "17px",
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
                      margin: "3px 0 0",
                      color: BRAND_PRIMARY,
                      fontSize: 18,
                      fontWeight: 900,
                      lineHeight: "22px",
                    }}
                  >
                    {price}원
                  </p>
                  <p
                    className="flex items-center"
                    style={{ margin: "2px 0 0", gap: 3, color: TEXT_META, fontSize: 10.5, fontWeight: 650, lineHeight: "14px" }}
                  >
                    <MapPin size={11} strokeWidth={2} aria-hidden />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display.meta}</span>
                  </p>
                  <div style={{ marginTop: 7 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                      <span style={{ color: TEXT_META, fontSize: 10, fontWeight: 750 }}>
                        {current}/{max}명 참여
                      </span>
                      <span style={{ color: BRAND_PRIMARY, fontSize: 10, fontWeight: 850 }}>
                        {display.progress}%
                      </span>
                    </div>
                    <div style={{ width: "100%", height: 4, overflow: "hidden", borderRadius: 999, background: "#E8EEF7" }}>
                      <div
                        style={{
                          width: `${display.progress}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${BRAND_PRIMARY}, #70adff)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
