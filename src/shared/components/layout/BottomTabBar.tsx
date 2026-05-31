import { Home, LayoutGrid, MessageSquareMore, Plus, User, type LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "../../../app/router/routes";
import { BRAND_PRIMARY, grey500 } from "../../constants/homeTheme";
import { UI_IX_BUTTON, UI_IX_HOVER_GREY50 } from "../../constants/damaraUISystem";

interface BottomTabBarProps {
  className?: string;
  onCreateClick?: () => void;
}

const ICON_PX = 17;
const TAB_ACTIVE = BRAND_PRIMARY;
const TAB_INACTIVE = grey500;

type TabDef = {
  to: string;
  label: string;
  Icon: LucideIcon;
};

const LEFT_TABS: TabDef[] = [
  { to: ROUTES.HOME, label: "홈", Icon: Home },
  { to: ROUTES.CATEGORY, label: "카테고리", Icon: LayoutGrid },
];

const RIGHT_TABS: TabDef[] = [
  { to: ROUTES.CHAT, label: "채팅", Icon: MessageSquareMore },
  { to: ROUTES.MYPAGE, label: "마이페이지", Icon: User },
];

export default function BottomTabBar({ className, onCreateClick }: BottomTabBarProps) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const handleTabClick = (to: string) => {
    if (pathname === to) return;
    nav(to);
    window.setTimeout(() => {
      if (window.location.pathname !== to) {
        window.location.assign(to);
      }
    }, 0);
  };

  const renderTab = ({ Icon, to, label }: TabDef) => {
    const isActive = pathname === to;
    const isEdgeTab = to === ROUTES.HOME || to === ROUTES.MYPAGE;

    return (
      <button
        key={to}
        type="button"
        onClick={() => handleTabClick(to)}
        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0 rounded-full no-underline ${
          isActive ? UI_IX_BUTTON : `${UI_IX_BUTTON} ${UI_IX_HOVER_GREY50}`
        }`}
        style={{
          minHeight: 42,
          margin: "0 1px",
          color: isActive ? TAB_ACTIVE : TAB_INACTIVE,
          backgroundColor: "transparent",
        }}
        aria-label={label}
      >
        <span
          className="flex flex-col items-center justify-center rounded-full"
          style={{
            width: isEdgeTab ? 66 : 68,
            minHeight: 38,
            backgroundColor: isActive ? "rgba(234, 242, 255, 0.86)" : "rgba(255, 255, 255, 0.26)",
            backdropFilter: "blur(10px) saturate(145%)",
            WebkitBackdropFilter: "blur(10px) saturate(145%)",
            boxShadow: isActive
              ? "inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -2px 6px rgba(49,130,246,0.08), 0 5px 14px rgba(49,130,246,0.08)"
              : "inset 0 1px 1px rgba(255,255,255,0.58)",
          }}
        >
          <span className="flex shrink-0 items-center justify-center" style={{ width: ICON_PX, height: ICON_PX }}>
            <Icon
              size={ICON_PX}
              strokeWidth={isActive ? 2.35 : 2}
              fill="none"
              color={isActive ? TAB_ACTIVE : TAB_INACTIVE}
              aria-hidden
            />
          </span>
          <span
            className="max-w-full truncate px-0.5 text-center font-medium leading-none"
            style={{
              fontSize: 9.5,
              marginTop: 3,
              letterSpacing: 0,
              fontWeight: isActive ? 750 : 650,
              color: isActive ? TAB_ACTIVE : TAB_INACTIVE,
            }}
          >
            {label}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div
      className={`pointer-events-auto fixed bottom-0 left-0 right-0 z-[100] mx-auto max-w-[430px] ${className ?? ""}`}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: "max(10px, env(safe-area-inset-bottom, 0px))",
        background:
          "linear-gradient(180deg, rgba(246,248,252,0) 0%, rgba(246,248,252,0.84) 45%, rgba(246,248,252,0.96) 100%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <nav
        className="pointer-events-auto flex w-full items-center justify-between rounded-full px-1.5 py-1.5"
        style={{
          minHeight: 56,
          borderRadius: 9999,
          border: "1px solid rgba(255, 255, 255, 0.72)",
          backgroundColor: "rgba(255, 255, 255, 0.56)",
          boxShadow:
            "0 10px 26px rgba(15, 23, 42, 0.06), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(229,232,239,0.42)",
          WebkitBackdropFilter: "blur(16px) saturate(150%)",
          backdropFilter: "blur(16px) saturate(150%)",
        }}
        aria-label="하단 메뉴"
      >
        {LEFT_TABS.map(renderTab)}

        <button
          type="button"
          aria-label="공구 등록"
          onClick={onCreateClick}
          className={UI_IX_BUTTON}
          style={{
            width: 44,
            height: 44,
            margin: "-9px 10px 0",
            border: 0,
            borderRadius: 9999,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            color: "#ffffff",
            background: "rgba(87, 148, 244, 0.84)",
            backdropFilter: "blur(10px) saturate(145%)",
            WebkitBackdropFilter: "blur(10px) saturate(145%)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.34), inset 0 -3px 7px rgba(18,87,190,0.16), 0 0 16px rgba(49,130,246,0.24), 0 7px 16px rgba(49,130,246,0.22)",
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9999,
              display: "grid",
              placeItems: "center",
              background: "transparent",
              boxShadow: "none",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Plus size={20} strokeWidth={2.75} aria-hidden />
          </span>
        </button>

        {RIGHT_TABS.map(renderTab)}
      </nav>
    </div>
  );
}
