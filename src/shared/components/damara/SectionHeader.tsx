import type React from "react";

import { TEXT_META, TEXT_TITLE } from "../../constants/homeTheme";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
};

export default function SectionHeader({ title, description, action, style }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, color: TEXT_TITLE, fontSize: 15, fontWeight: 850, lineHeight: "21px" }}>{title}</h2>
        {description ? <p style={{ margin: "2px 0 0", color: TEXT_META, fontSize: 12, fontWeight: 600, lineHeight: "18px" }}>{description}</p> : null}
      </div>
      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
    </div>
  );
}
