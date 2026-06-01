import { useEffect, useRef, useState } from "react";
import type React from "react";
import { Bell, BellRing, ChevronRight, MapPin, PackageSearch, Search, UsersRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ROUTES } from "../../../app/router/routes";
import damaraMark from "../../../assets/damara-mark.png";
import { searchPostsByProductName } from "../../../features/group-buy/api/groupBuyApi";
import { getNotifications, getUnreadCount, markAsRead } from "../../../features/user/api/notificationApi";
import type { ApiNotification, ApiPost, ApiPostProductSearchResponse } from "../../api/swaggerTypes";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import { BRAND_PRIMARY, grey200, grey400, grey500, grey700, grey900, HOME_CANVAS } from "../../constants/homeTheme";
import { APP_HEADER_HEIGHT_PX } from "./appShellConstants";

type ActivePanel = "search" | "notifications" | null;

export default function AppHeader() {
  const nav = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ApiPost[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  useEffect(() => {
    if (!userId) return;
    getUnreadCount(userId)
      .then(({ data }) => setUnreadCount(Number(data?.unreadCount) || 0))
      .catch(() => setUnreadCount(0));
  }, [userId]);

  useEffect(() => {
    if (activePanel === "search") searchInputRef.current?.focus();
  }, [activePanel]);

  useEffect(() => {
    const productName = query.trim();
    if (activePanel !== "search" || !productName) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setSearching(true);
      searchPostsByProductName(productName, 10, userId)
        .then(({ data }: { data: ApiPostProductSearchResponse }) => setSearchResults(Array.isArray(data?.items) ? data.items : []))
        .catch(() => {
          setSearchResults([]);
          toast.error("검색 결과를 불러오지 못했어요.");
        })
        .finally(() => setSearching(false));
    }, 240);

    return () => window.clearTimeout(timer);
  }, [activePanel, query, userId]);

  const openNotifications = async () => {
    setActivePanel("notifications");
    if (!userId) {
      setNotifications([]);
      return;
    }

    setLoadingNotifications(true);
    try {
      const { data } = await getNotifications(userId);
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      setUnreadCount(Number(data?.unreadCount) || 0);
    } catch {
      toast.error("알림을 불러오지 못했어요.");
    } finally {
      setLoadingNotifications(false);
    }
  };

  const moveToPost = (postId?: string | null) => {
    if (!postId) return;
    setActivePanel(null);
    nav(ROUTES.GROUP_BUY_DETAIL.replace(":id", postId));
  };

  const openNotification = async (notification: ApiNotification) => {
    if (userId && !notification.isRead) {
      try {
        await markAsRead(notification.id, userId);
        setNotifications((items) => items.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)));
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        toast.error("알림 읽음 처리에 실패했어요.");
      }
    }

    if (notification.postId) {
      moveToPost(notification.postId);
      return;
    }
    if (notification.actionUrl?.startsWith("/")) {
      setActivePanel(null);
      nav(notification.actionUrl);
    }
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 mx-auto max-w-[430px]" style={headerStyle}>
        <div className="flex items-center justify-between" style={{ height: APP_HEADER_HEIGHT_PX, paddingLeft: 22, paddingRight: 22 }}>
          <div style={brandMarkStyle} aria-label="다마라">
            <img src={damaraMark} alt="" aria-hidden style={headerLogoStyle} />
          </div>

          <div className="flex shrink-0 items-center" style={{ gap: 7 }}>
            <HeaderIcon label="검색" onClick={() => setActivePanel("search")}><Search size={20} strokeWidth={2.05} /></HeaderIcon>
            <HeaderIcon label="알림" onClick={() => void openNotifications()} showDot={unreadCount > 0}><Bell size={20} strokeWidth={2.05} /></HeaderIcon>
          </div>
        </div>
      </header>

      {activePanel ? <div style={backdropStyle} onClick={() => setActivePanel(null)} /> : null}
      {activePanel === "search" ? (
        <HeaderPanel title="공구 검색" subtitle="필요한 상품을 빠르게 찾아보세요" onClose={() => setActivePanel(null)}>
          <div style={searchBoxStyle}>
            <Search size={17} color={grey500} aria-hidden />
            <input ref={searchInputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="찾고 싶은 상품명을 입력해 주세요" aria-label="상품명 검색" style={searchInputStyle} />
            {query ? <button type="button" aria-label="검색어 지우기" onClick={() => setQuery("")} style={plainIconStyle}><X size={16} /></button> : null}
          </div>
          <div style={panelBodyStyle}>
            {!query.trim() ? <PanelEmpty icon={<PackageSearch size={25} />} title="어떤 상품을 찾고 있나요?" description="상품명을 입력하면 비슷한 공동구매를 찾아드려요." /> : searching ? <PanelEmpty icon={<Search size={24} />} title="검색 중이에요" description="잠시만 기다려 주세요." /> : searchResults.length === 0 ? <PanelEmpty icon={<PackageSearch size={25} />} title="검색 결과가 없어요" description="다른 상품명으로 다시 검색해 보세요." /> : searchResults.map((post) => (
              <button key={post.id} type="button" onClick={() => moveToPost(post.id)} style={resultRowStyle}>
                <span style={thumbnailStyle}>
                  {post.thumbnailUrl ? <img src={post.thumbnailUrl} alt="" style={thumbnailImageStyle} /> : <PackageSearch size={19} color={BRAND_PRIMARY} aria-hidden />}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong style={rowTitleStyle}>{post.productName || post.title}</strong>
                  <span style={rowDescriptionStyle}>{post.title}</span>
                  {post.pickupLocation ? <span style={rowMetaStyle}><MapPin size={11} aria-hidden />{post.pickupLocation}</span> : null}
                </span>
                <ChevronRight size={17} color={grey400} aria-hidden />
              </button>
            ))}
          </div>
        </HeaderPanel>
      ) : null}

      {activePanel === "notifications" ? (
        <HeaderPanel title="알림" subtitle={unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "새로운 소식을 확인해 보세요"} onClose={() => setActivePanel(null)}>
          <div style={panelBodyStyle}>
            {loadingNotifications ? <PanelEmpty icon={<Bell size={24} />} title="알림을 불러오는 중이에요" description="잠시만 기다려 주세요." /> : notifications.length === 0 ? <PanelEmpty icon={<Bell size={24} />} title="새로운 알림이 없어요" description="공구 소식이 생기면 이곳에서 알려드릴게요." /> : notifications.map((notification) => (
              <button key={notification.id} type="button" onClick={() => void openNotification(notification)} style={{ ...resultRowStyle, background: notification.isRead ? "transparent" : "rgba(49, 130, 246, 0.055)" }}>
                <span style={{ ...notificationIconStyle, background: notification.isRead ? "#F2F5F9" : "rgba(49, 130, 246, 0.12)", color: notification.isRead ? grey500 : BRAND_PRIMARY }}>
                  {notification.type === "new_participant" ? <UsersRound size={18} aria-hidden /> : <BellRing size={18} aria-hidden />}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <strong style={rowTitleStyle}>{notification.title}</strong>
                    {!notification.isRead ? <span style={newBadgeStyle}>NEW</span> : null}
                  </span>
                  <span style={rowDescriptionStyle}>{notification.message}</span>
                  <span style={notificationTimeStyle}>{formatNotificationTime(notification.createdAt)}</span>
                </span>
                {(notification.postId || notification.actionUrl) ? <ChevronRight size={17} color={grey400} aria-hidden /> : null}
              </button>
            ))}
          </div>
        </HeaderPanel>
      ) : null}
    </>
  );
}

function HeaderPanel({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <section role="dialog" aria-modal="true" aria-label={title} style={panelStyle}>
      <div style={panelHandleStyle} aria-hidden />
      <div style={panelHeaderStyle}>
        <span>
          <h2 style={panelTitleStyle}>{title}</h2>
          <span style={panelSubtitleStyle}>{subtitle}</span>
        </span>
        <button type="button" onClick={onClose} aria-label="닫기" style={closeButtonStyle}><X size={18} /></button>
      </div>
      {children}
    </section>
  );
}

function PanelEmpty({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div style={emptyStateStyle}>
      <span style={emptyIconStyle}>{icon}</span>
      <strong style={emptyTitleStyle}>{title}</strong>
      <p style={emptyDescriptionStyle}>{description}</p>
    </div>
  );
}

function HeaderIcon({ label, onClick, children, showDot }: { label: string; onClick: () => void; children: React.ReactNode; showDot?: boolean }) {
  return <button type="button" aria-label={label} style={headerIconStyle} onClick={onClick}>{children}{showDot ? <span aria-hidden style={dotStyle} /> : null}</button>;
}

function formatNotificationTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

const headerStyle: React.CSSProperties = { paddingTop: "env(safe-area-inset-top, 0px)", backgroundColor: "rgba(246, 248, 252, 0.86)", borderBottom: "1px solid rgba(229, 232, 239, 0.54)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" };
const brandMarkStyle: React.CSSProperties = { display: "flex", minWidth: 0, alignItems: "center" };
const headerLogoStyle: React.CSSProperties = { width: 34, height: 34, objectFit: "contain", display: "block" };
const headerIconStyle: React.CSSProperties = { position: "relative", width: 34, height: 34, borderRadius: 999, border: 0, color: grey500, background: "transparent", display: "grid", placeItems: "center", cursor: "pointer" };
const dotStyle: React.CSSProperties = { position: "absolute", right: 7, top: 7, width: 6, height: 6, borderRadius: 999, background: BRAND_PRIMARY, boxShadow: `0 0 0 2px ${HOME_CANVAS}` };
const backdropStyle: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 60, background: "rgba(20, 38, 68, 0.22)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" };
const panelStyle: React.CSSProperties = { position: "fixed", zIndex: 70, top: "calc(68px + env(safe-area-inset-top, 0px))", left: "50%", width: "min(calc(100% - 20px), 410px)", maxHeight: "min(590px, calc(100dvh - 88px))", transform: "translateX(-50%)", overflow: "hidden", border: "1px solid rgba(205, 218, 239, 0.92)", borderRadius: 22, background: "rgba(255,255,255,0.985)", boxShadow: "0 24px 54px rgba(20, 50, 92, 0.2), 0 3px 10px rgba(24, 59, 105, 0.08)" };
const panelHandleStyle: React.CSSProperties = { width: 34, height: 4, margin: "8px auto 0", borderRadius: 999, background: "#DDE6F2" };
const panelHeaderStyle: React.CSSProperties = { minHeight: 61, padding: "7px 13px 9px 17px", display: "flex", alignItems: "center", justifyContent: "space-between" };
const panelTitleStyle: React.CSSProperties = { margin: 0, color: grey900, fontSize: 16, fontWeight: 850 };
const panelSubtitleStyle: React.CSSProperties = { display: "block", marginTop: 3, color: grey500, fontSize: 11.5, fontWeight: 620 };
const plainIconStyle: React.CSSProperties = { width: 30, height: 30, border: 0, borderRadius: 10, background: "transparent", color: grey500, display: "grid", placeItems: "center", cursor: "pointer" };
const closeButtonStyle: React.CSSProperties = { ...plainIconStyle, background: "#F3F6FA", borderRadius: 999 };
const searchBoxStyle: React.CSSProperties = { height: 48, margin: "0 13px 13px", padding: "0 13px", display: "flex", alignItems: "center", gap: 9, border: "1px solid rgba(196, 211, 235, 0.82)", borderRadius: 15, background: "#F7FAFE", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" };
const searchInputStyle: React.CSSProperties = { minWidth: 0, flex: 1, border: 0, outline: 0, background: "transparent", color: grey900, fontSize: 14, fontWeight: 600 };
const panelBodyStyle: React.CSSProperties = { maxHeight: "min(448px, calc(100dvh - 172px))", overflowY: "auto", borderTop: `1px solid ${grey200}` };
const resultRowStyle: React.CSSProperties = { width: "100%", minHeight: 76, padding: "11px 14px", display: "flex", alignItems: "center", gap: 11, border: 0, borderBottom: `1px solid ${grey200}`, background: "transparent", textAlign: "left", cursor: "pointer" };
const thumbnailStyle: React.CSSProperties = { width: 50, height: 50, flexShrink: 0, overflow: "hidden", borderRadius: 14, background: "#EDF4FF", display: "grid", placeItems: "center" };
const thumbnailImageStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const notificationIconStyle: React.CSSProperties = { width: 42, height: 42, flexShrink: 0, borderRadius: 14, display: "grid", placeItems: "center" };
const rowTitleStyle: React.CSSProperties = { display: "block", overflow: "hidden", color: grey900, fontSize: 14, fontWeight: 780, lineHeight: "20px", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const rowDescriptionStyle: React.CSSProperties = { display: "block", overflow: "hidden", marginTop: 2, color: grey700, fontSize: 12, fontWeight: 560, lineHeight: "17px", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const rowMetaStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 3, marginTop: 3, color: grey500, fontSize: 11, fontWeight: 620, lineHeight: "15px" };
const notificationTimeStyle: React.CSSProperties = { display: "block", marginTop: 4, color: grey500, fontSize: 10.5, fontWeight: 620, lineHeight: "14px" };
const newBadgeStyle: React.CSSProperties = { padding: "1px 5px", borderRadius: 999, background: "rgba(49,130,246,0.12)", color: BRAND_PRIMARY, fontSize: 9, fontWeight: 850 };
const emptyStateStyle: React.CSSProperties = { padding: "34px 18px 38px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" };
const emptyIconStyle: React.CSSProperties = { width: 54, height: 54, borderRadius: 18, background: "#EDF4FF", color: BRAND_PRIMARY, display: "grid", placeItems: "center" };
const emptyTitleStyle: React.CSSProperties = { marginTop: 13, color: grey900, fontSize: 14, fontWeight: 820, lineHeight: "20px" };
const emptyDescriptionStyle: React.CSSProperties = { margin: "5px 0 0", color: grey500, fontSize: 12, fontWeight: 590, lineHeight: "18px" };
