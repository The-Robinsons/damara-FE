import { Home, LayoutGrid, MessageSquareMore, Plus, User, type LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "../../../app/router/routes";
import { background, BRAND_PRIMARY, grey500, HOME_BORDER } from "../../constants/homeTheme";
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

    return (
      <button
        key={to}
        type="button"
        onClick={() => handleTabClick(to)}
        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0 rounded-full py-1 no-underline ${
          isActive ? UI_IX_BUTTON : `${UI_IX_BUTTON} ${UI_IX_HOVER_GREY50}`
        }`}
        style={{
          minHeight: 42,
          color: isActive ? TAB_ACTIVE : TAB_INACTIVE,
          backgroundColor: isActive ? "rgba(49, 130, 246, 0.10)" : "transparent",
        }}
        aria-label={label}
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
          }}
        >
          {label}
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
          border: `1px solid ${HOME_BORDER}`,
          backgroundColor: "rgba(255,255,255,0.88)",
          boxShadow: "0 14px 34px rgba(15, 23, 42, 0.10), 0 2px 8px rgba(15, 23, 42, 0.04)",
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
            width: 50,
            height: 50,
            margin: "-16px 9px 0",
            border: `4px solid ${background}`,
            borderRadius: 9999,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            color: "#ffffff",
            background: `linear-gradient(135deg, ${BRAND_PRIMARY} 0%, #2272eb 100%)`,
            boxShadow: "0 10px 22px rgba(49, 130, 246, 0.24)",
            cursor: "pointer",
          }}
        >
          <Plus size={24} strokeWidth={2.65} aria-hidden />
        </button>

        {RIGHT_TABS.map(renderTab)}
      </nav>
    </div>
  );
}
