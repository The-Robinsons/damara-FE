import React from "react";

import { BRAND_PRIMARY, grey500, grey900, HOME_BORDER } from "../../constants/homeTheme";
import {
  UI_BUTTON_H,
  UI_PAGE_PAD_X,
  UI_R_BUTTON,
  UI_T_BODY,
  UI_T_SECTION,
} from "../../constants/damaraUISystem";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: `44px ${UI_PAGE_PAD_X}px 54px`,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 112,
          height: 112,
          display: "grid",
          placeItems: "center",
        }}
        aria-hidden={!icon}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 50% 38%, rgba(49,130,246,0.16) 0%, rgba(49,130,246,0.08) 38%, rgba(49,130,246,0) 72%)",
            filter: "blur(4px)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: 76,
            height: 76,
            display: "grid",
            placeItems: "center",
            borderRadius: 24,
            color: BRAND_PRIMARY,
            background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(239,245,255,0.96) 100%)",
            border: `1px solid ${HOME_BORDER}`,
            boxShadow:
              "0 14px 32px rgba(49,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.92)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 18,
              right: 18,
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.72)",
              filter: "blur(1px)",
            }}
          />
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>{icon}</div>
        </div>
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: UI_T_SECTION.size,
          fontWeight: UI_T_SECTION.weight,
          lineHeight: `${UI_T_SECTION.line}px`,
          color: grey900,
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: 0,
          maxWidth: 280,
          fontSize: UI_T_BODY.size,
          fontWeight: UI_T_BODY.weight,
          lineHeight: `${UI_T_BODY.line}px`,
          color: grey500,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: 10,
            height: UI_BUTTON_H,
            minWidth: 200,
            padding: "0 24px",
            borderRadius: UI_R_BUTTON,
            border: "1px solid rgba(255,255,255,0.72)",
            background: "linear-gradient(180deg, #4B95FF 0%, #3182F6 100%)",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 760,
            letterSpacing: "-0.02em",
            boxShadow: "0 10px 22px rgba(49,130,246,0.22), inset 0 1px 0 rgba(255,255,255,0.28)",
            cursor: "pointer",
            transition: "transform 160ms ease, filter 160ms ease, box-shadow 160ms ease",
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
