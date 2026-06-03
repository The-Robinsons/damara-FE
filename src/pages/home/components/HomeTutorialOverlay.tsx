import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { STORAGE_KEYS } from "../../../shared/constants/storageKeys";

type TutorialTarget = "search" | "notification" | "category" | "popular" | "filter" | "create-fab" | "chat-tab";

type TutorialStep = {
  target: TutorialTarget;
  label: string;
  title: string;
  description: string;
  placement: "top" | "bottom";
  highlightPad: number;
  highlightRadius: number;
};

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const STEPS: TutorialStep[] = [
  {
    target: "search",
    label: "검색 기능 안내",
    title: "원하는 공동구매를 빠르게 찾아보세요",
    description: "상품명이나 키워드로 지금 필요한 공구를 바로 검색할 수 있어요.",
    placement: "bottom",
    highlightPad: 7,
    highlightRadius: 999,
  },
  {
    target: "notification",
    label: "알림 확인 안내",
    title: "참여와 채팅 소식을 놓치지 마세요",
    description: "새 참여자, 채팅 메시지, 공지처럼 중요한 소식은 알림에서 바로 확인할 수 있어요.",
    placement: "bottom",
    highlightPad: 7,
    highlightRadius: 999,
  },
  {
    target: "category",
    label: "카테고리 안내",
    title: "카테고리별로 골라보세요",
    description: "먹거리, 생활용품, 학용품 등 원하는 종류의 공구만 모아볼 수 있어요.",
    placement: "bottom",
    highlightPad: 5,
    highlightRadius: 999,
  },
  {
    target: "popular",
    label: "인기 공동구매 안내",
    title: "지금 인기 있는 공구를 확인해보세요",
    description: "많이 보는 공구와 참여가 활발한 상품을 빠르게 둘러볼 수 있어요.",
    placement: "bottom",
    highlightPad: 8,
    highlightRadius: 24,
  },
  {
    target: "filter",
    label: "필터 기능 안내",
    title: "조건에 맞게 정렬해보세요",
    description: "최신순, 마감임박순, 인기순으로 원하는 공구를 더 쉽게 찾을 수 있어요.",
    placement: "top",
    highlightPad: 7,
    highlightRadius: 999,
  },
  {
    target: "create-fab",
    label: "공동구매 등록 안내",
    title: "공동구매를 직접 열어보세요",
    description: "+ 버튼을 눌러 사고 싶은 상품을 올리고 함께 살 사람을 모아보세요.",
    placement: "top",
    highlightPad: 6,
    highlightRadius: 999,
  },
  {
    target: "chat-tab",
    label: "채팅 안내",
    title: "참여한 공구는 채팅에서 이어가요",
    description: "수령 시간, 장소 확인, 거래 조율은 채팅방에서 자연스럽게 진행하면 돼요.",
    placement: "top",
    highlightPad: 8,
    highlightRadius: 999,
  },
];

const APP_MAX_W = 430;
const TOOLTIP_W = 238;
const SCREEN_PAD = 16;

export default function HomeTutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEYS.HOME_TUTORIAL_SEEN);
    const shouldShowOnce = sessionStorage.getItem(STORAGE_KEYS.SHOW_HOME_TUTORIAL_ONCE) === "true";
    if (seen !== "never" && shouldShowOnce) {
      sessionStorage.removeItem(STORAGE_KEYS.SHOW_HOME_TUTORIAL_ONCE);
      const id = window.setTimeout(() => setVisible(true), 650);
      return () => window.clearTimeout(id);
    }
  }, []);

  const measureTarget = useCallback(() => {
    if (!visible) return;
    const target = document.querySelector<HTMLElement>(`[data-tutorial-target="${step.target}"]`);
    if (!target) {
      setTargetRect(null);
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: step.target === "create-fab" ? "nearest" : "center" });
    window.setTimeout(() => {
      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }, 180);
  }, [step.target, visible]);

  useEffect(() => {
    measureTarget();
    const onUpdate = () => measureTarget();
    window.addEventListener("resize", onUpdate);
    window.addEventListener("scroll", onUpdate, { passive: true });
    return () => {
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("scroll", onUpdate);
    };
  }, [measureTarget]);

  const close = useCallback(() => {
    if (doNotShowAgain) {
      localStorage.setItem(STORAGE_KEYS.HOME_TUTORIAL_SEEN, "never");
    }
    setVisible(false);
  }, [doNotShowAgain]);

  const next = () => {
    if (isLast) {
      close();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const highlightStyle = useMemo(() => {
    if (!targetRect) return null;
    const pad = step.highlightPad;
    return {
      top: Math.max(0, targetRect.top - pad),
      left: Math.max(0, targetRect.left - pad),
      width: targetRect.width + pad * 2,
      height: targetRect.height + pad * 2,
      borderRadius: step.highlightRadius,
    };
  }, [step.highlightPad, step.highlightRadius, targetRect]);

  const tooltipStyle = useMemo(() => {
    if (!highlightStyle) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      } as React.CSSProperties;
    }

    const centerX = highlightStyle.left + highlightStyle.width / 2;
    const appWidth = Math.min(window.innerWidth, APP_MAX_W);
    const appLeft = Math.max(0, (window.innerWidth - appWidth) / 2);
    const appRight = appLeft + appWidth;
    const left = Math.min(
      Math.max(appLeft + SCREEN_PAD, centerX - TOOLTIP_W / 2),
      appRight - TOOLTIP_W - SCREEN_PAD
    );
    const top =
      step.placement === "bottom"
        ? Math.min(highlightStyle.top + highlightStyle.height + 16, window.innerHeight - 190)
        : Math.max(88, highlightStyle.top - 146);

    return { left, top } as React.CSSProperties;
  }, [highlightStyle, step.placement]);

  const arrowStyle = useMemo(() => {
    if (!highlightStyle) return { display: "none" } as React.CSSProperties;
    const centerX = highlightStyle.left + highlightStyle.width / 2;
    const tooltipLeft = typeof tooltipStyle.left === "number" ? tooltipStyle.left : window.innerWidth / 2 - TOOLTIP_W / 2;
    const arrowLeft = Math.min(Math.max(22, centerX - tooltipLeft - 8), TOOLTIP_W - 30);
    return {
      left: arrowLeft,
      top: step.placement === "bottom" ? -8 : undefined,
      bottom: step.placement === "top" ? -8 : undefined,
      transform: step.placement === "bottom" ? "rotate(45deg)" : "rotate(45deg)",
    } as React.CSSProperties;
  }, [highlightStyle, step.placement, tooltipStyle.left]);

  if (!visible) return null;

  return createPortal(
    <div aria-live="polite" style={overlayStyle}>
      <div style={topGuideStyle}>
        <span style={progressPillStyle}>
          {stepIndex + 1}/{STEPS.length}
        </span>
        <strong style={topTitleStyle}>{step.label}</strong>
      </div>

      {highlightStyle ? (
        <div
          aria-hidden
          style={{
            ...highlightBaseStyle,
            ...highlightStyle,
          }}
        />
      ) : null}

      <section style={{ ...tooltipBaseStyle, ...tooltipStyle }}>
        <span aria-hidden style={{ ...tooltipArrowStyle, ...arrowStyle }} />
        <strong style={tooltipTitleStyle}>{step.title}</strong>
        <p style={tooltipDescriptionStyle}>{step.description}</p>
        <label style={doNotShowRowStyle}>
          <input
            type="checkbox"
            checked={doNotShowAgain}
            onChange={(event) => setDoNotShowAgain(event.target.checked)}
            style={checkboxStyle}
          />
          <span>다시는 보지 않기</span>
        </label>
        <div style={buttonRowStyle}>
          <button type="button" onClick={close} style={skipButtonStyle}>
            건너뛰기
          </button>
          <button type="button" onClick={next} style={nextButtonStyle}>
            {isLast ? "완료" : "다음"}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 150,
  background: "transparent",
};

const topGuideStyle: React.CSSProperties = {
  position: "fixed",
  top: "calc(18px + env(safe-area-inset-top, 0px))",
  left: "50%",
  zIndex: 153,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 5,
  transform: "translateX(-50%)",
  pointerEvents: "none",
};

const progressPillStyle: React.CSSProperties = {
  height: 21,
  padding: "0 9px",
  borderRadius: 999,
  background: "linear-gradient(180deg, #6F89FF 0%, #5876F4 100%)",
  color: "#FFFFFF",
  fontSize: 11,
  fontWeight: 850,
  lineHeight: "21px",
  boxShadow: "0 7px 16px rgba(49, 87, 216, 0.26)",
};

const topTitleStyle: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: 850,
  lineHeight: "21px",
  letterSpacing: "-0.02em",
  textShadow: "0 2px 8px rgba(0,0,0,0.28)",
};

const highlightBaseStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 151,
  borderRadius: 22,
  pointerEvents: "none",
  background: "rgba(255, 255, 255, 0.12)",
  boxShadow:
    "0 0 0 9999px rgba(14, 20, 32, 0.62), 0 0 0 2px rgba(255,255,255,0.96), 0 0 0 7px rgba(49,130,246,0.18), 0 18px 40px rgba(49,130,246,0.28)",
  transition: "top 280ms cubic-bezier(0.22, 1, 0.36, 1), left 280ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1), height 280ms cubic-bezier(0.22, 1, 0.36, 1)",
};

const tooltipBaseStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 152,
  width: TOOLTIP_W,
  maxWidth: "calc(100vw - 32px)",
  boxSizing: "border-box",
  padding: "15px 15px 13px",
  borderRadius: 18,
  border: "1px solid rgba(226, 232, 242, 0.92)",
  background: "rgba(255, 255, 255, 0.98)",
  boxShadow: "0 18px 44px rgba(0, 15, 38, 0.22), inset 0 1px 0 rgba(255,255,255,0.96)",
  transition: "top 280ms cubic-bezier(0.22, 1, 0.36, 1), left 280ms cubic-bezier(0.22, 1, 0.36, 1)",
};

const tooltipArrowStyle: React.CSSProperties = {
  position: "absolute",
  width: 16,
  height: 16,
  borderRadius: 3,
  background: "rgba(255, 255, 255, 0.98)",
  borderLeft: "1px solid rgba(226, 232, 242, 0.92)",
  borderTop: "1px solid rgba(226, 232, 242, 0.92)",
};

const tooltipTitleStyle: React.CSSProperties = {
  display: "block",
  color: "#4F73F0",
  fontSize: 13,
  fontWeight: 900,
  lineHeight: "19px",
  letterSpacing: "-0.02em",
};

const tooltipDescriptionStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#4E5968",
  fontSize: 12,
  fontWeight: 650,
  lineHeight: "18px",
  letterSpacing: "-0.015em",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
};

const doNotShowRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  marginTop: 12,
  color: "#6B7684",
  fontSize: 11.5,
  fontWeight: 700,
  lineHeight: "16px",
  cursor: "pointer",
};

const checkboxStyle: React.CSSProperties = {
  width: 15,
  height: 15,
  accentColor: "#3182F6",
  cursor: "pointer",
};

const skipButtonStyle: React.CSSProperties = {
  height: 30,
  padding: "0 10px",
  border: 0,
  borderRadius: 999,
  background: "transparent",
  color: "#8B95A1",
  fontSize: 12,
  fontWeight: 750,
  cursor: "pointer",
};

const nextButtonStyle: React.CSSProperties = {
  height: 31,
  padding: "0 14px",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: 999,
  background: "linear-gradient(180deg, #4B95FF 0%, #3182F6 100%)",
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: 850,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(49,130,246,0.22)",
};
