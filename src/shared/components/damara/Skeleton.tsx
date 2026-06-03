import React from "react";

import { grey100, grey50, HOME_BORDER } from "../../constants/homeTheme";
import { UI_R_CARD, UI_R_THUMB } from "../../constants/damaraUISystem";

function Block({ w, h, r = 8 }: { w: string | number; h: number; r?: number }) {
  return (
    <div
      aria-hidden
      data-skeleton
      style={{
        width: w,
        height: h,
        borderRadius: r,
      }}
    />
  );
}

/** 전역 한 번만 주입 */
let styleInjected = false;
function ensureShimmerStyle() {
  if (styleInjected || typeof document === "undefined") return;
  styleInjected = true;
  const s = document.createElement("style");
  s.textContent = `@keyframes damara-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(s);
}

/** 홈·리스트용 가로 카드 스켈레톤 */
export function SkeletonGroupBuyRow() {
  ensureShimmerStyle();
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "18px 20px",
        borderRadius: UI_R_CARD,
        border: `1px solid ${HOME_BORDER}`,
        backgroundColor: "#ffffff",
      }}
    >
      <Block w={72} h={72} r={UI_R_THUMB} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Block w="70%" h={16} r={6} />
        <Block w={40} h={22} r={11} />
        <Block w="100%" h={12} r={4} />
        <Block w="45%" h={14} r={4} />
        <Block w="100%" h={6} r={999} />
        <Block w={96} h={22} r={6} />
      </div>
    </div>
  );
}

export function SkeletonCardGridCell() {
  ensureShimmerStyle();
  return (
    <div style={{ borderRadius: UI_R_CARD, border: `1px solid ${HOME_BORDER}`, overflow: "hidden", backgroundColor: "#fff" }}>
      <Block w="100%" h={140} r={0} />
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <Block w="90%" h={14} r={4} />
        <Block w={72} h={20} r={4} />
        <Block w="60%" h={12} r={4} />
      </div>
    </div>
  );
}

export function SkeletonChatRow() {
  ensureShimmerStyle();
  return (
    <div style={{ display: "flex", gap: 14, padding: "16px 20px", alignItems: "center" }}>
      <Block w={48} h={48} r={14} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <Block w="55%" h={15} r={4} />
        <Block w="85%" h={12} r={4} />
      </div>
    </div>
  );
}

export function SkeletonDetailHero() {
  ensureShimmerStyle();
  return (
    <div style={{ padding: "0 20px 20px" }}>
      <Block w="100%" h={220} r={UI_R_CARD} />
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <Block w="40%" h={24} r={6} />
        <Block w="90%" h={22} r={6} />
        <Block w="70%" h={16} r={4} />
      </div>
    </div>
  );
}
