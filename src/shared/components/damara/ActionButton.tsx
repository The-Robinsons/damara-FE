import type React from "react";

import { BRAND_PRIMARY, HOME_BORDER, grey200, grey400, grey900 } from "../../constants/homeTheme";
import { UI_IX_BUTTON, UI_IX_HOVER_GREY50, UI_R_BUTTON, UI_TRANSITION } from "../../constants/damaraUISystem";

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "compact" | "icon";
};

export default function ActionButton({
  variant = "primary",
  size = "default",
  className,
  style,
  disabled,
  children,
  ...props
}: ActionButtonProps) {
  const isPrimary = variant === "primary";
  const isIcon = size === "icon";
  const height = size === "compact" ? 42 : size === "icon" ? 48 : 56;

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={disabled}
      className={[UI_IX_BUTTON, !isPrimary ? UI_IX_HOVER_GREY50 : "", className].filter(Boolean).join(" ")}
      style={{
        minWidth: isIcon ? height : undefined,
        height,
        padding: isIcon ? 0 : size === "compact" ? "0 16px" : "0 20px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        border: variant === "secondary" ? `1px solid ${HOME_BORDER}` : 0,
        borderRadius: isIcon ? 16 : UI_R_BUTTON,
        background: isPrimary ? BRAND_PRIMARY : variant === "secondary" ? "#ffffff" : "transparent",
        color: isPrimary ? "#ffffff" : disabled ? grey400 : grey900,
        boxShadow: isPrimary ? "0 10px 22px rgba(49,130,246,0.22)" : "none",
        fontSize: size === "compact" ? 13 : 16,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.85 : 1,
        transition: UI_TRANSITION,
        ...(disabled && isPrimary ? { background: grey200 } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
