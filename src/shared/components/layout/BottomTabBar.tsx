import { useEffect, useRef, useState } from "react";
import { Home, LayoutGrid, MessageSquareMore, Plus, User, type LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "../../../app/router/routes";

interface BottomTabBarProps {
  className?: string;
  onCreateClick?: () => void;
}

type TabDef = {
  to: string;
  label: string;
  Icon: LucideIcon;
};

const ICON_PX = 19;
const TAB_INACTIVE = "#9099A9";
const TAB_ACTIVE = "#4F73F0";

const LEFT_TABS: TabDef[] = [
  { to: ROUTES.HOME, label: "홈", Icon: Home },
  { to: ROUTES.CATEGORY, label: "카테고리", Icon: LayoutGrid },
];

const RIGHT_TABS: TabDef[] = [
  { to: ROUTES.CHAT, label: "채팅", Icon: MessageSquareMore },
  { to: ROUTES.MYPAGE, label: "마이페이지", Icon: User },
];

const ALL_TABS = [...LEFT_TABS, ...RIGHT_TABS];

export default function BottomTabBar({ className, onCreateClick }: BottomTabBarProps) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const createTimerRef = useRef<number | undefined>(undefined);
  const [popping, setPopping] = useState(false);

  useEffect(
    () => () => {
      window.clearTimeout(createTimerRef.current);
    },
    []
  );

  const moveTo = (to: string) => {
    if (pathname !== to) nav(to);
  };

  const handleCreate = () => {
    window.clearTimeout(createTimerRef.current);
    setPopping(false);
    requestAnimationFrame(() => setPopping(true));
    createTimerRef.current = window.setTimeout(() => onCreateClick?.(), 145);
  };

  const renderTab = ({ Icon, to, label }: TabDef) => {
    const isActive = pathname === to;
    const tutorialTarget =
      to === ROUTES.CATEGORY
        ? "category-tab"
        : to === ROUTES.CHAT
          ? "chat-tab"
          : to === ROUTES.MYPAGE
            ? "mypage-tab"
            : undefined;

    return (
      <button
        key={to}
        type="button"
        data-tutorial-target={tutorialTarget}
        onClick={() => moveTo(to)}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={`damara-nav-tab relative z-[2] flex min-w-0 flex-1 flex-col items-center justify-center rounded-full ${isActive ? "damara-nav-active-jelly" : ""}`}
        style={{
          minHeight: 48,
          margin: "0 1px",
          zIndex: 2,
          border: 0,
          color: isActive ? TAB_ACTIVE : TAB_INACTIVE,
          background: isActive
            ? "linear-gradient(180deg, rgba(232,240,255,0.92) 0%, rgba(211,226,255,0.88) 100%)"
            : "transparent",
          boxShadow: isActive
            ? "inset 0 1px 1px rgba(255,255,255,0.94), 0 4px 10px rgba(91,124,250,0.13), 0 0 10px 1px rgba(114,153,255,0.12)"
            : "none",
          cursor: "pointer",
          transition: "color 220ms ease, transform 180ms ease, background 260ms ease, box-shadow 260ms ease",
        }}
      >
        <Icon
          size={ICON_PX}
          strokeWidth={isActive ? 2.45 : 2.05}
          color="currentColor"
          style={{ transition: "color 220ms ease, stroke-width 220ms ease, transform 220ms ease", transform: isActive ? "translateY(-1px)" : "translateY(0)" }}
          aria-hidden
        />
        <span
          style={{
            marginTop: 4,
            color: "currentColor",
            fontSize: 10,
            fontWeight: isActive ? 780 : 620,
            lineHeight: "11px",
            letterSpacing: "-0.02em",
            transition: "color 220ms ease, font-weight 220ms ease",
          }}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className={`pointer-events-auto fixed bottom-0 left-0 right-0 z-[100] mx-auto max-w-[430px] ${className ?? ""}`} style={footerWrapStyle}>
      <style>{`
        @keyframes damara-fab-pop {
          0% { transform: scale(1); }
          34% { transform: scale(0.94); }
          72% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes damara-fab-ripple {
          0% { opacity: 0.44; transform: translate(-50%, -50%) scale(0.58); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.92); }
        }
        @keyframes damara-tab-jelly {
          0% { transform: scaleX(0.9) scaleY(0.94); filter: saturate(0.94); }
          42% { transform: scaleX(1.07) scaleY(0.96); filter: saturate(1.08); }
          72% { transform: scaleX(0.985) scaleY(1.025); }
          100% { transform: scaleX(1) scaleY(1); filter: saturate(1); }
        }
        .damara-nav-active-jelly {
          animation: damara-tab-jelly 320ms cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: center;
        }
        @media (hover: hover) and (pointer: fine) {
          .damara-nav-tab:hover {
            color: #5A7DF6 !important;
            background: rgba(229, 238, 255, 0.72) !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.86), 0 0 10px rgba(114, 153, 255, 0.1) !important;
            filter: saturate(1.025);
          }
          .damara-nav-fab:hover {
            filter: brightness(1.035) saturate(1.04);
            box-shadow: inset 0 3px 4px rgba(255,255,255,0.58), inset 0 -6px 10px rgba(37,73,188,0.25), 0 7px 16px rgba(76,111,238,0.25), 0 3px 7px rgba(76,111,238,0.18) !important;
          }
          .damara-nav-fab:hover .damara-nav-fab-gloss {
            opacity: 0.82;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .damara-nav-tab,
          .damara-nav-active-jelly,
          .damara-nav-fab,
          .damara-nav-fab-gloss,
          .damara-nav-ripple {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <nav aria-label="하단 메뉴" className="relative flex w-full items-center justify-between" style={navStyle}>
        {LEFT_TABS.map(renderTab)}

        <button type="button" data-tutorial-target="create-fab" aria-label="공구 등록" onClick={handleCreate} className="damara-nav-fab relative z-[3]" style={{ ...fabStyle, animation: popping ? "damara-fab-pop 270ms cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined }}>
          {popping ? <span aria-hidden className="damara-nav-ripple" style={rippleStyle} /> : null}
          <span aria-hidden className="damara-nav-fab-gloss" style={fabGlossStyle} />
          <Plus size={25} strokeWidth={3} strokeLinecap="round" color="#FFFFFF" style={{ position: "relative", zIndex: 2, filter: "drop-shadow(0 1px 1px rgba(45, 77, 175, 0.2))" }} />
        </button>

        {RIGHT_TABS.map(renderTab)}
      </nav>
    </div>
  );
}

const footerWrapStyle: React.CSSProperties = {
  padding: "8px 15px max(10px, env(safe-area-inset-bottom, 0px))",
  background: "linear-gradient(180deg, rgba(247,248,251,0) 0%, rgba(247,248,251,0.62) 52%, rgba(247,248,251,0.94) 100%)",
  backdropFilter: "blur(16px) saturate(138%)",
  WebkitBackdropFilter: "blur(16px) saturate(138%)",
};

const navStyle: React.CSSProperties = {
  minHeight: 61,
  padding: "6px 7px",
  borderRadius: 999,
  border: "1px solid rgba(226,232,242,0.92)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,249,253,0.94) 100%)",
  boxShadow: "0 10px 24px rgba(82,101,132,0.075), 0 2px 7px rgba(82,101,132,0.045), inset 0 1px 0 rgba(255,255,255,0.96)",
  backdropFilter: "blur(18px) saturate(142%)",
  WebkitBackdropFilter: "blur(18px) saturate(142%)",
};

const fabStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 3,
  width: 56,
  height: 56,
  margin: "-16px 10px 0",
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  overflow: "visible",
  border: "1px solid rgba(255,255,255,0.68)",
  borderRadius: 999,
  color: "#FFFFFF",
  background: "linear-gradient(180deg, #8CAEFF 0%, #5F82FA 48%, #3F68ED 100%)",
  boxShadow: "inset 0 3px 4px rgba(255,255,255,0.54), inset 0 -6px 10px rgba(37,73,188,0.27), 0 7px 16px rgba(76,111,238,0.22), 0 3px 7px rgba(76,111,238,0.16)",
  cursor: "pointer",
  transition: "filter 180ms ease, box-shadow 180ms ease",
};

const fabGlossStyle: React.CSSProperties = {
  position: "absolute",
  top: 8,
  left: "50%",
  width: 18,
  height: 7,
  transform: "translateX(-50%)",
  borderRadius: 999,
  background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.02) 100%)",
  filter: "blur(0.4px)",
  transition: "opacity 180ms ease",
};

const rippleStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: 56,
  height: 56,
  borderRadius: 999,
  background: "radial-gradient(circle, rgba(127,163,255,0.5) 0%, rgba(127,163,255,0) 72%)",
  animation: "damara-fab-ripple 480ms ease-out",
};
