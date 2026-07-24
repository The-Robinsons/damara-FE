import FilterChip from "../../../shared/components/damara/FilterChip";
import { UI_PAGE_PAD_X } from "../../../shared/constants/damaraUISystem";

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
        data-tutorial-target="category"
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
            <FilterChip
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              active={isActive}
              onClick={() => onChange(cat.id)}
              style={{
                backdropFilter: "blur(10px) saturate(145%)",
                WebkitBackdropFilter: "blur(10px) saturate(145%)",
              }}
            >
              {cat.label}
            </FilterChip>
          );
        })}
      </div>
    </div>
  );
}
