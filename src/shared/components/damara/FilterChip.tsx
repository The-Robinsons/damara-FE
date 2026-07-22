import type React from "react";

import { TEXT_META } from "../../constants/homeTheme";
import { UI_IX_BUTTON, UI_IX_HOVER_GREY50, UI_R_BADGE } from "../../constants/damaraUISystem";

type FilterChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  size?: "default" | "compact";
};

export default function FilterChip({
  active = false,
  size = "default",
  className,
  style,
  children,
  ...props
}: FilterChipProps) {
  const height = size === "compact" ? 34 : 40;

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={[UI_IX_BUTTON, !active ? UI_IX_HOVER_GREY50 : "", className].filter(Boolean).join(" ")}
      style={{
        flexShrink: 0,
        minWidth: 0,
        height,
        padding: size === "compact" ? "0 12px" : "0 14px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        border: active ? "1px solid rgba(49, 130, 246, 0.18)" : "1px solid transparent",
        borderRadius: UI_R_BADGE,
        background: active ? "rgba(49, 130, 246, 0.92)" : "rgba(255, 255, 255, 0.26)",
        color: active ? "#ffffff" : TEXT_META,
        fontSize: size === "compact" ? 11 : 12.5,
        fontWeight: active ? 850 : 700,
        lineHeight: `${height}px`,
        whiteSpace: "nowrap",
        boxShadow: active
          ? "inset 0 1px 1px rgba(255,255,255,0.34), inset 0 -3px 7px rgba(18,87,190,0.16), 0 6px 14px rgba(49,130,246,0.18)"
          : "inset 0 1px 1px rgba(255,255,255,0.58)",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
