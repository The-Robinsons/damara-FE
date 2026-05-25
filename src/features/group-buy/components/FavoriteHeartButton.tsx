import React, { useCallback, useEffect, useId, useState } from "react";

import { addFavorite, checkFavorite, removeFavorite } from "../api/groupBuyApi";
import { readFavoriteFlag } from "../utils/favoriteResponse";
import { DANGER } from "../../../shared/constants/homeTheme";
import { STORAGE_KEYS } from "../../../shared/constants/storageKeys";
import { UI_IX_BUTTON, UI_IX_HOVER_GREY50 } from "../../../shared/constants/damaraUISystem";
import { damaraToast, damaraToastMessages } from "../../../shared/lib/damaraToast";

interface FavoriteHeartButtonProps {
  postId: number | string;
  initialIsFavorite?: boolean | null;
  className?: string;
  style?: React.CSSProperties;
  iconClassName?: string;
  iconSize?: number;
}

export default function FavoriteHeartButton({
  postId,
  initialIsFavorite,
  className,
  style,
  iconClassName = "size-4",
  iconSize,
}: FavoriteHeartButtonProps) {
  const textureId = useId().replace(/:/g, "");
  const hasInitialFavorite = typeof initialIsFavorite === "boolean";
  const [isFavorite, setIsFavorite] = useState(Boolean(initialIsFavorite));
  const [loading, setLoading] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.USER_ID) || "" : "";

  useEffect(() => {
    setIsFavorite(Boolean(initialIsFavorite));

    if (hasInitialFavorite) {
      return;
    }

    if (!userId || postId === "" || postId == null) {
      return;
    }

    let cancelled = false;
    checkFavorite(String(postId), userId)
      .then((res) => {
        if (!cancelled) setIsFavorite(readFavoriteFlag(res.data));
      })
      .catch(() => {
        if (!cancelled) setIsFavorite(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId, userId, initialIsFavorite, hasInitialFavorite]);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!userId) {
        damaraToast.error("로그인이 필요해요.");
        return;
      }
      if (loading || postId === "" || postId == null) return;

      const next = !isFavorite;
      setIsFavorite(next);
      setLoading(true);

      try {
        if (next) await addFavorite(String(postId), userId);
        else await removeFavorite(String(postId), userId);

        damaraToast.show(next ? damaraToastMessages.favoriteAdded : damaraToastMessages.favoriteRemoved);
      } catch (err: any) {
        if (next && err?.response?.status === 400) {
          setIsFavorite(true);
          damaraToast.show(damaraToastMessages.favoriteAdded);
          return;
        }
        if (!next && err?.response?.status === 404) {
          setIsFavorite(false);
          damaraToast.show(damaraToastMessages.favoriteRemoved);
          return;
        }

        setIsFavorite(!next);
        damaraToast.error("찜 처리에 실패했어요.");
      } finally {
        setLoading(false);
      }
    },
    [userId, loading, isFavorite, postId]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "관심 해제" : "관심 등록"}
      className={[UI_IX_BUTTON, UI_IX_HOVER_GREY50, className].filter(Boolean).join(" ")}
      style={style}
    >
      <svg
        viewBox="0 0 24 24"
        width={iconSize}
        height={iconSize}
        className={iconClassName}
        fill="none"
        stroke={isFavorite ? DANGER : "currentColor"}
        strokeWidth={isFavorite ? 1.55 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{ display: "block", filter: isFavorite ? "drop-shadow(0 1px 1px rgba(225, 29, 72, 0.24))" : undefined }}
      >
        {isFavorite && (
          <defs>
            <linearGradient id={`${textureId}-heart-fill`} x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff8aa0" />
              <stop offset="0.45" stopColor={DANGER} />
              <stop offset="1" stopColor="#be123c" />
            </linearGradient>
            <pattern id={`${textureId}-heart-texture`} width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M0 3.5 3.5 0" stroke="rgba(255,255,255,0.28)" strokeWidth="0.6" />
              <circle cx="3.1" cy="3.1" r="0.45" fill="rgba(255,255,255,0.32)" />
            </pattern>
          </defs>
        )}
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          fill={isFavorite ? `url(#${textureId}-heart-fill)` : "none"}
        />
        {isFavorite && (
          <path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            fill={`url(#${textureId}-heart-texture)`}
            stroke="none"
            opacity="0.7"
          />
        )}
      </svg>
    </button>
  );
}
