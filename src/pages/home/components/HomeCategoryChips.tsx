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
          gap: 6,
          minHeight: 46,
          padding: 6,
          borderRadius: 999,
          border: "1px solid rgba(255, 255, 255, 0.72)",
          background: "rgba(255, 255, 255, 0.56)",
          boxShadow:
            "0 10px 26px rgba(15, 23, 42, 0.045), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(229,232,239,0.42)",
          scrollbarWidth: "none",
          WebkitBackdropFilter: "blur(16px) saturate(150%)",
          backdropFilter: "blur(16px) saturate(150%)",
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
                height: 32,
                padding: "0 14px",
                borderRadius: UI_R_BADGE,
                border: 0,
                background: isActive ? "rgba(49, 130, 246, 0.92)" : "rgba(255, 255, 255, 0.26)",
                color: isActive ? "#ffffff" : TEXT_META,
                fontSize: 12.5,
                lineHeight: "32px",
                fontWeight: isActive ? 850 : 700,
                whiteSpace: "nowrap",
                backdropFilter: "blur(10px) saturate(145%)",
                WebkitBackdropFilter: "blur(10px) saturate(145%)",
                boxShadow: isActive
                  ? "inset 0 1px 1px rgba(255,255,255,0.34), inset 0 -3px 7px rgba(18,87,190,0.16), 0 0 14px rgba(49,130,246,0.18), 0 6px 14px rgba(49,130,246,0.18)"
                  : "inset 0 1px 1px rgba(255,255,255,0.58)",
                cursor: "pointer",
                transition: "background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
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
