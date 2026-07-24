import { HOME_BORDER } from "../../constants/homeTheme";
import { UI_R_CARD, UI_R_THUMB } from "../../constants/damaraUISystem";

function Block({ w, h, r = 8, delay = 0 }: { w: string | number; h: number; r?: number; delay?: number }) {
  return (
    <div
      aria-hidden
      data-skeleton
      style={{
        width: w,
        height: h,
        borderRadius: r,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

/** 홈·마이 공구 목록의 실제 카드 구조를 따르는 스켈레톤 */
export function SkeletonGroupBuyRow({ index = 0 }: { index?: number }) {
  const delay = index * 90;

  return (
    <article
      aria-busy="true"
      aria-label="공동구매 목록을 불러오는 중"
      style={{
        position: "relative",
        minHeight: 128,
        display: "flex",
        gap: 11,
        padding: 12,
        boxSizing: "border-box",
        borderRadius: 22,
        border: `1px solid ${HOME_BORDER}`,
        backgroundColor: "#ffffff",
        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.035)",
      }}
    >
      <Block w={68} h={68} r={UI_R_THUMB} delay={delay} />
      <div style={{ minWidth: 0, flex: 1, paddingRight: 30, display: "flex", flexDirection: "column" }}>
        <Block w="64%" h={17} r={6} delay={delay + 35} />
        <div style={{ marginTop: 7 }}>
          <Block w={54} h={19} r={999} delay={delay + 70} />
        </div>
        <div style={{ marginTop: 6 }}>
          <Block w="88%" h={12} r={5} delay={delay + 105} />
        </div>
        <div style={{ marginTop: 6 }}>
          <Block w={72} h={12} r={5} delay={delay + 140} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7 }}>
          <Block w="100%" h={5} r={999} delay={delay + 175} />
          <Block w={38} h={18} r={999} delay={delay + 210} />
        </div>
        <div style={{ marginTop: 7 }}>
          <Block w={94} h={20} r={6} delay={delay + 245} />
        </div>
      </div>
      <Block w={24} h={24} r={999} delay={delay + 280} />
    </article>
  );
}

export function SkeletonCardGridCell() {
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
