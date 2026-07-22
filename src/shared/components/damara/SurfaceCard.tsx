import type React from "react";

import { HOME_BORDER } from "../../constants/homeTheme";
import { UI_R_CARD } from "../../constants/damaraUISystem";

type SurfaceCardProps = React.HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section";
  padding?: number | string;
  tone?: "default" | "soft";
};

export default function SurfaceCard({
  as: Component = "section",
  padding = 16,
  tone = "default",
  style,
  children,
  ...props
}: SurfaceCardProps) {
  return (
    <Component
      {...props}
      style={{
        border: `1px solid ${HOME_BORDER}`,
        borderRadius: UI_R_CARD,
        background: tone === "soft" ? "linear-gradient(145deg, #ffffff 0%, #f7fbff 100%)" : "#ffffff",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
        padding,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
