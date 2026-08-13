import React, { useEffect, useId } from "react";
import { X } from "lucide-react";

import { BRAND_PRIMARY, grey700, grey900, HOME_BORDER, OVERLAY_DIM } from "../../constants/homeTheme";
import {
  UI_BUTTON_H,
  UI_R_BUTTON,
  UI_R_SHEET_TOP,
  UI_SHADOW_SHEET,
} from "../../constants/damaraUISystem";

/** 시트 타이포: 제목 20px / 700 / #191f28(grey900), 본문 15px / #4e5968(grey700) */
const TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  lineHeight: "28px",
  color: grey900,
  letterSpacing: "-0.03em",
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 15,
  fontWeight: 400,
  lineHeight: "23px",
  color: grey700,
  whiteSpace: "pre-line",
};

interface ConfirmBottomSheetProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmDanger?: boolean;
  confirmDisabled?: boolean;
  loading?: boolean;
  /** 제목·설명 아래, 버튼 위 */
  children?: React.ReactNode;
  /** 취소: 텍스트 버튼 또는 테두리형 보조 버튼 */
  cancelVariant?: "text" | "secondary";
  /** 우측 상단 닫기(X) — 참여 확인 등 */
  showCloseButton?: boolean;
  /** 긴 본문·children 스크롤 */
  scrollable?: boolean;
}

export default function ConfirmBottomSheet({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "닫기",
  onConfirm,
  onClose,
  confirmDanger,
  confirmDisabled,
  loading,
  children,
  cancelVariant = "text",
  showCloseButton,
  scrollable,
}: ConfirmBottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const dialogStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: UI_R_SHEET_TOP,
    borderTopRightRadius: UI_R_SHEET_TOP,
    padding: 20,
    paddingBottom: "max(20px, env(safe-area-inset-bottom, 0px))",
    boxShadow: UI_SHADOW_SHEET,
    ...(scrollable || children
      ? { maxHeight: "88vh", overflowY: "auto" as const }
      : {}),
  };

  const primaryBg = confirmDanger ? "#f04452" : BRAND_PRIMARY;

  const cancelButtonStyle: React.CSSProperties =
    cancelVariant === "secondary"
      ? {
          width: "100%",
          height: UI_BUTTON_H,
          borderRadius: UI_R_BUTTON,
          border: `1px solid ${HOME_BORDER}`,
          backgroundColor: "#ffffff",
          color: grey900,
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
        }
      : {
          width: "100%",
          minHeight: 48,
          padding: "12px 8px",
          border: "none",
          background: "none",
          color: grey700,
          fontSize: 15,
          fontWeight: 500,
          cursor: "pointer",
        };

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 220,
        backgroundColor: OVERLAY_DIM,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={dialogStyle}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {showCloseButton ? (
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <h2 id={titleId} style={{ ...TITLE_STYLE, flex: 1, minWidth: 0 }}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: 12,
                border: `1px solid ${HOME_BORDER}`,
                background: "#fff",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                color: grey900,
              }}
            >
              <X size={20} strokeWidth={2} aria-hidden />
            </button>
          </div>
        ) : (
          <h2 id={titleId} style={TITLE_STYLE}>{title}</h2>
        )}

        {description ? <p style={DESCRIPTION_STYLE}>{description}</p> : null}

        {children ? <div style={{ marginTop: description ? 16 : 14 }}>{children}</div> : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
          <button
            type="button"
            disabled={loading || confirmDisabled}
            onClick={onConfirm}
            style={{
              width: "100%",
              height: UI_BUTTON_H,
              borderRadius: UI_R_BUTTON,
              border: "none",
              backgroundColor: primaryBg,
              color: "#ffffff",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "wait" : confirmDisabled ? "not-allowed" : "pointer",
              opacity: loading || confirmDisabled ? 0.55 : 1,
            }}
          >
            {confirmLabel}
          </button>
          <button type="button" onClick={onClose} style={cancelButtonStyle}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
