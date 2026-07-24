import type React from "react";

import { blue50, blue600 } from "../../constants/homeTheme";

type InfoBannerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "span";
  tone?: "info" | "danger";
};

export default function InfoBanner({ as: Component = "div", tone = "info", style, children, ...props }: InfoBannerProps) {
  const isDanger = tone === "danger";

  return (
    <Component
      {...props}
      style={{
        borderRadius: 12,
        background: isDanger ? "#ffeeee" : blue50,
        color: isDanger ? "#e42939" : blue600,
        padding: "12px 14px",
        fontSize: 12.5,
        lineHeight: "19px",
        fontWeight: 700,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
