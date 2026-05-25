import { useState } from "react";
import { ImageIcon } from "lucide-react";

import { getImageUrl } from "../../../shared/utils/imageUrl";
import FavoriteHeartButton from "./FavoriteHeartButton";
import {
  BADGE_INFO_BG,
  BADGE_INFO_TEXT,
  BADGE_SPECIAL_BG,
  BADGE_SPECIAL_TEXT,
  BADGE_URGENT_BG,
  BADGE_URGENT_TEXT,
  BRAND_PRIMARY,
  blue50,
  green50,
  green600,
  grey100,
  grey400,
  grey500,
  grey800,
  grey900,
  HOME_BORDER,
  orange500,
  yellow50,
} from "../../../shared/constants/homeTheme";
import {
  UI_BADGE_FW,
  UI_R_BADGE,
  UI_IX_HOVER_GREY50,
  UI_IX_ROW,
} from "../../../shared/constants/damaraUISystem";
import type { GroupBuyType } from "../../../types/groupBuy";

export interface GroupBuyCardProps {
  id: number | string;
  image: string;
  title: string;
  price: string;
  currentPeople: number;
  maxPeople: number;
  location: string;
  status: "open" | "closed" | "in_progress" | "completed" | "recruiting";
  onClick?: () => void;
  groupBuyType?: GroupBuyType | string | null;
  deadline?: string | null;
  deadlineLabel?: string | null;
  visualType?: "plus" | "bar" | "default";
  tags?: string[];
  remainingQuantity?: number | null;
  isReceiptVerified?: boolean | null;
  isFavorite?: boolean | null;
}

const THUMB_BG = [grey100, green50, yellow50, grey100];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDeadlineLine(location: string, deadline: string | null): string {
  if (!deadline) return location;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return location;
  return `${location} · 마감: ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

function hoursUntil(deadline: string): number {
  return (new Date(deadline).getTime() - Date.now()) / 36e5;
}

function hashIdToIndex(id: number | string): number {
  const raw = String(id);
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) return Math.abs(numeric);
  return raw.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export default function GroupBuyCard({
  id,
  image,
  title,
  price,
  currentPeople,
  maxPeople,
  onClick,
  groupBuyType,
  location,
  deadline,
  deadlineLabel,
  visualType = "default",
  tags,
  isFavorite,
}: GroupBuyCardProps) {
  const progressRatio = maxPeople > 0 ? Math.min(currentPeople / maxPeople, 1) : 0;
  const progressPercent = progressRatio * 100;
  const [imgError, setImgError] = useState(false);

  const deadlineSoon = !!deadline && hoursUntil(deadline) > 0 && hoursUntil(deadline) < 72;
  const almostFull = progressRatio >= 0.75;
  const urgentBar = deadlineSoon || almostFull;
  const processedImageUrl = getImageUrl(image);
  const thumbTint =
    visualType === "plus"
      ? green50
      : visualType === "bar"
        ? yellow50
        : THUMB_BG[hashIdToIndex(id) % THUMB_BG.length];

  const typeLabel = groupBuyType === "PRE_RECRUIT" ? "함께구매" : groupBuyType === "POST_PURCHASE" ? "나눔구매" : null;
  const displayTags = (tags ?? [
    ...(deadlineSoon && !almostFull ? ["마감임박"] : []),
    ...(typeLabel ? [typeLabel] : []),
  ]).filter((tag) => tag !== "인기");

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      className={onClick ? `flex bg-white ${UI_IX_ROW} ${UI_IX_HOVER_GREY50}` : "flex bg-white"}
      style={{
        position: "relative",
        gap: 12,
        padding: "12px 13px",
        borderRadius: 22,
        border: `1px solid ${HOME_BORDER}`,
        cursor: onClick ? "pointer" : "default",
        background: "linear-gradient(135deg, #ffffff 0%, #ffffff 56%, #f8fbff 100%)",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.07), 0 2px 6px rgba(15, 23, 42, 0.035)",
      }}
    >
      <div
        className="relative"
        style={{
          width: 72,
          height: 72,
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: 18,
          background: `linear-gradient(145deg, #ffffff 0%, ${thumbTint} 48%, ${blue50} 100%)`,
          boxShadow: "inset 0 0 0 1px rgba(49, 130, 246, 0.07)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 7,
            top: 7,
            height: 19,
            padding: "0 7px",
            borderRadius: UI_R_BADGE,
            backgroundColor: deadlineSoon && currentPeople < maxPeople ? BADGE_URGENT_BG : BADGE_INFO_BG,
            color: deadlineSoon && currentPeople < maxPeople ? BADGE_URGENT_TEXT : BADGE_INFO_TEXT,
            fontSize: 9.5,
            fontWeight: 800,
            lineHeight: "19px",
            zIndex: 1,
            boxShadow: "0 2px 7px rgba(15, 23, 42, 0.05)",
          }}
        >
          {deadlineSoon && currentPeople < maxPeople ? "마감임박" : "모집중"}
        </span>
        {imgError || !processedImageUrl || processedImageUrl === "/placeholder.png" ? (
          <div className="flex items-center justify-center" style={{ width: "100%", height: "100%" }} aria-hidden>
            {visualType === "plus" ? (
              <span style={{ color: green600, fontSize: 28, fontWeight: 500, lineHeight: 1 }}>+</span>
            ) : visualType === "bar" ? (
              <span
                style={{
                  display: "block",
                  width: 34,
                  height: 22,
                  borderRadius: 4,
                  backgroundColor: grey800,
                  transform: "rotate(-10deg)",
                }}
              />
            ) : (
              <ImageIcon size={24} color={grey500} strokeWidth={1.55} />
            )}
          </div>
        ) : (
          <img
            src={processedImageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="flex items-start justify-between" style={{ gap: 7 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                margin: 0,
                color: grey900,
                fontSize: 14.5,
                fontWeight: 850,
                lineHeight: "19px",
                letterSpacing: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </h3>
            <div className="flex flex-wrap" style={{ gap: 4, marginTop: 5 }}>
              {displayTags.map((tag) => {
                const isUrgent = tag === "마감임박";
                const isShareBuy = tag === "나눔구매";
                return (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: 18,
                      padding: "0 7px",
                      borderRadius: UI_R_BADGE,
                      backgroundColor: isUrgent
                          ? BADGE_URGENT_BG
                          : isShareBuy
                            ? BADGE_SPECIAL_BG
                            : BADGE_INFO_BG,
                      color: isUrgent
                          ? BADGE_URGENT_TEXT
                          : isShareBuy
                            ? BADGE_SPECIAL_TEXT
                            : BADGE_INFO_TEXT,
                      fontSize: 9.5,
                      fontWeight: UI_BADGE_FW,
                      lineHeight: "18px",
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
          <FavoriteHeartButton
            postId={id}
            initialIsFavorite={Boolean(isFavorite)}
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              padding: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 999,
              backgroundColor: "#ffffff",
              color: grey400,
              marginTop: -2,
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
            }}
            iconClassName="size-4"
          />
        </div>

        <p
          style={{
            margin: "5px 0 0",
            color: grey500,
            fontSize: 11.5,
            fontWeight: 650,
            lineHeight: "15px",
            letterSpacing: 0,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {deadlineLabel ? `${location} · 마감: ${deadlineLabel}` : formatDeadlineLine(location, deadline ?? null)}
        </p>
        <p style={{ margin: "3px 0 0", color: BRAND_PRIMARY, fontSize: 12.5, fontWeight: 850, lineHeight: "16px" }}>
          {currentPeople}/{maxPeople}명 참여 중
        </p>

        <div
          style={{
            width: "100%",
            height: 5,
            marginTop: 5,
            overflow: "hidden",
            borderRadius: 999,
            backgroundColor: "#edf2fa",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              borderRadius: 999,
              background: urgentBar ? `linear-gradient(90deg, ${orange500}, #ffb86b)` : `linear-gradient(90deg, ${BRAND_PRIMARY}, #70adff)`,
            }}
          />
        </div>

        <p style={{ margin: "6px 0 0", color: BRAND_PRIMARY, fontSize: 18, fontWeight: 900, lineHeight: "22px", letterSpacing: 0 }}>
          {price}
          <span style={{ color: grey400, fontSize: 11, fontWeight: 650, lineHeight: "15px", marginLeft: 4 }}>/ 1인</span>
        </p>
      </div>
    </article>
  );
}
