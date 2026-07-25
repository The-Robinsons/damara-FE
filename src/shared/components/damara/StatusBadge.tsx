import type React from "react";

import {
  BADGE_INFO_BG,
  BADGE_INFO_TEXT,
  BADGE_SUCCESS_BG,
  BADGE_SUCCESS_TEXT,
  BADGE_URGENT_BG,
  BADGE_URGENT_TEXT,
  grey100,
  grey600,
} from "../../constants/homeTheme";
import { UI_R_BADGE } from "../../constants/damaraUISystem";

type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "info" | "success" | "warning" | "neutral";
  size?: "sm" | "md";
  icon?: React.ReactNode;
};

const toneStyles = {
  info: { background: BADGE_INFO_BG, color: BADGE_INFO_TEXT },
  success: { background: BADGE_SUCCESS_BG, color: BADGE_SUCCESS_TEXT },
  warning: { background: BADGE_URGENT_BG, color: BADGE_URGENT_TEXT },
  neutral: { background: grey100, color: grey600 },
};

export default function StatusBadge({ tone = "info", size = "md", icon, style, children, ...props }: StatusBadgeProps) {
  const compact = size === "sm";
  const colors = toneStyles[tone];

  return (
    <span
      {...props}
      style={{
        minHeight: compact ? 18 : 20,
        padding: compact ? "0 7px" : "0 8px",
        display: "inline-flex",
        alignItems: "center",
        gap: icon ? 3 : 0,
        borderRadius: UI_R_BADGE,
        background: colors.background,
        color: colors.color,
        fontSize: compact ? 9.5 : 10,
        fontWeight: 850,
        lineHeight: `${compact ? 18 : 20}px`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
