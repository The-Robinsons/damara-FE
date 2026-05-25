import {
  BRAND_PRIMARY,
  TEXT_META,
} from "../../../shared/constants/homeTheme";
import { UI_IX_BUTTON, UI_IX_HOVER_GREY50, UI_PAGE_PAD_X, UI_R_BADGE } from "../../../shared/constants/damaraUISystem";

import { HOME_CATEGORIES, type HomeCategoryId } from "../constants/homeCategoryChipsData";

interface HomeCategoryChipsProps {
  activeCategory: HomeCategoryId;
  onChange: (id: HomeCategoryId) => void;
}

export default function HomeCategoryChips({
  activeCategory,
  onChange,
}: HomeCategoryChipsProps) {
  return (
    <div style={{ padding: `8px ${UI_PAGE_PAD_X}px 13px` }}>
      <div
        role="tablist"
        aria-label="홈 카테고리 필터"
        className="no-scrollbar flex items-center overflow-x-auto"
        style={{
          gap: 5,
          minHeight: 44,
          padding: 5,
          borderRadius: 999,
          border: "1px solid rgba(229, 232, 239, 0.82)",
          background: "rgba(255, 255, 255, 0.72)",
          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.045), inset 0 1px 0 rgba(255,255,255,0.82)",
          scrollbarWidth: "none",
          WebkitBackdropFilter: "blur(12px)",
          backdropFilter: "blur(12px)",
        }}
      >
        {HOME_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(cat.id)}
              className={isActive ? UI_IX_BUTTON : `${UI_IX_BUTTON} ${UI_IX_HOVER_GREY50}`}
              style={{
                flexShrink: 0,
                height: 34,
                padding: "0 13px",
                borderRadius: UI_R_BADGE,
                border: 0,
                background: isActive ? BRAND_PRIMARY : "transparent",
                color: isActive ? "#ffffff" : TEXT_META,
                fontSize: 13,
                lineHeight: "34px",
                fontWeight: isActive ? 850 : 700,
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 7px 16px rgba(49, 130, 246, 0.24)" : "none",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
