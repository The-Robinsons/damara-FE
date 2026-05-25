import { SlidersHorizontal } from "lucide-react";

import { BRAND_PRIMARY, TEXT_META } from "../../../shared/constants/homeTheme";

export type SortKey = "latest" | "deadline" | "popular";

interface HomeSortTabsProps {
  sortBy: SortKey;
  totalCount: number;
  appliedFilterCount?: number;
  onChange: (key: SortKey) => void;
  onFilterClick?: () => void;
}

const TABS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "deadline", label: "마감임박순" },
  { key: "popular", label: "인기순" },
];

export default function HomeSortTabs({
  sortBy,
  totalCount: _totalCount,
  appliedFilterCount: _appliedFilterCount = 0,
  onChange,
  onFilterClick,
}: HomeSortTabsProps) {
  return (
    <div
      style={{
        padding: "0 2px",
        backgroundColor: "transparent",
      }}
    >
      <div
        role="tablist"
        aria-label="정렬"
        className="flex items-center"
        style={{
          minWidth: 0,
          height: 34,
          gap: 17,
          width: "100%",
        }}
      >
        {TABS.map((tab) => {
          const active = sortBy === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.key)}
              className="relative flex items-center justify-center"
              style={{
                flexShrink: 0,
                height: "100%",
                padding: 0,
                color: active ? BRAND_PRIMARY : TEXT_META,
                fontWeight: active ? 850 : 700,
                fontSize: 12,
                letterSpacing: 0,
              }}
            >
              {tab.label}
              {active ? (
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 2,
                    width: "100%",
                    height: 2,
                    transform: "translateX(-50%)",
                    borderRadius: 999,
                    background: BRAND_PRIMARY,
                  }}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onFilterClick}
          aria-label="필터"
          className="relative flex items-center justify-center"
          style={{
            marginLeft: "auto",
            flexShrink: 0,
            gap: 4,
            height: 30,
            padding: "0 10px",
            borderRadius: 999,
            border: "1px solid #EAF2FF",
            backgroundColor: "#EEF4FF",
            color: BRAND_PRIMARY,
            fontSize: 11.5,
            fontWeight: 800,
            lineHeight: 1,
            boxShadow: "0 3px 10px rgba(49,130,246,0.07)",
          }}
        >
          <SlidersHorizontal size={12} strokeWidth={1.9} color={BRAND_PRIMARY} className="shrink-0" aria-hidden />
          필터
        </button>
      </div>
    </div>
  );
}
