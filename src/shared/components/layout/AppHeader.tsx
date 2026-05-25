import type React from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";

import { BRAND_PRIMARY, grey400, grey500, grey900, HOME_CANVAS } from "../../constants/homeTheme";
import { APP_HEADER_HEIGHT_PX } from "./appShellConstants";

export default function AppHeader() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 mx-auto max-w-[430px]"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        backgroundColor: "rgba(246, 248, 252, 0.86)",
        borderBottom: "1px solid rgba(229, 232, 239, 0.54)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div className="flex items-center justify-between" style={{ height: APP_HEADER_HEIGHT_PX, paddingLeft: 22, paddingRight: 22 }}>
        <button
          type="button"
          className="flex min-w-0 items-center gap-1.5 rounded-xl py-1 pr-1"
          style={{ margin: 0, border: "none", background: "transparent", cursor: "pointer", color: grey900 }}
          onClick={() => toast.message("캠퍼스 선택은 곧 연결할게요.")}
          aria-label="캠퍼스 선택, 명지대"
        >
          <span className="truncate text-[20px] leading-none" style={{ fontWeight: 850, letterSpacing: 0, color: grey900 }}>
            명지대
          </span>
          <ChevronDown className="size-[17px] shrink-0" color={grey400} strokeWidth={2.35} aria-hidden />
        </button>

        <div className="flex shrink-0 items-center" style={{ gap: 7 }}>
          <HeaderIcon label="검색" onClick={() => toast.message("검색은 곧 연결할게요.")}>
            <Search size={20} strokeWidth={2.05} />
          </HeaderIcon>
          <HeaderIcon label="알림" onClick={() => toast.message("알림은 곧 연결할게요.")} showDot>
            <Bell size={20} strokeWidth={2.05} />
          </HeaderIcon>
        </div>
      </div>
    </header>
  );
}

function HeaderIcon({
  label,
  onClick,
  children,
  showDot,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  showDot?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex items-center justify-center transition active:scale-[0.98]"
      style={{
        position: "relative",
        width: 34,
        height: 34,
        borderRadius: 999,
        border: 0,
        color: grey500,
        backgroundColor: "transparent",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {children}
      {showDot ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: 7,
            top: 7,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: BRAND_PRIMARY,
            boxShadow: `0 0 0 2px ${HOME_CANVAS}`,
          }}
        />
      ) : null}
    </button>
  );
}
