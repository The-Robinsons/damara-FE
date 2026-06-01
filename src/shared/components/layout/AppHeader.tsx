import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Bell, BellRing, ChevronRight, MapPin, MessageCircle, PackageSearch, Search, UsersRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ROUTES } from "../../../app/router/routes";
import damaraMark from "../../../assets/damara-mark.png";
import { searchPostsByProductName } from "../../../features/group-buy/api/groupBuyApi";
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from "../../../features/user/api/notificationApi";
import type { ApiNotification, ApiPost, ApiPostProductSearchResponse } from "../../api/swaggerTypes";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import { BRAND_PRIMARY, grey200, grey400, grey500, grey700, grey900, HOME_CANVAS } from "../../constants/homeTheme";
import { APP_HEADER_HEIGHT_PX } from "./appShellConstants";

type ActivePanel = "search" | "notifications" | null;
type NotificationFilter = "all" | "group-buy" | "chat" | "activity";

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
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>("all");
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => matchesNotificationFilter(notification, notificationFilter)),
    [notificationFilter, notifications]
  );

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
    setNotificationFilter("all");
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

  const readAllNotifications = async () => {
    if (!userId || unreadCount === 0) return;
    try {
      await markAllAsRead(userId);
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast.error("알림 읽음 처리에 실패했어요.");
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

    if (notification.chatRoomId) {
      setActivePanel(null);
      nav(`${ROUTES.CHAT}?roomId=${encodeURIComponent(notification.chatRoomId)}`);
      return;
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
          <button type="button" style={brandMarkStyle} aria-label="홈으로 이동" onClick={() => nav(ROUTES.HOME)}>
            <img src={damaraMark} alt="" aria-hidden style={headerLogoStyle} />
          </button>

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

      {false && activePanel === "notifications" ? (
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
      {activePanel === "notifications" ? (
        <NotificationPanel
          notifications={filteredNotifications}
          unreadCount={unreadCount}
          loading={loadingNotifications}
          filter={notificationFilter}
          onFilterChange={setNotificationFilter}
          onReadAll={() => void readAllNotifications()}
          onClose={() => setActivePanel(null)}
          onOpen={(notification) => void openNotification(notification)}
        />
      ) : null}
    </>
  );
}

function NotificationPanel({
  notifications,
  unreadCount,
  loading,
  filter,
  onFilterChange,
  onReadAll,
  onClose,
  onOpen,
}: {
  notifications: ApiNotification[];
  unreadCount: number;
  loading: boolean;
  filter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  onReadAll: () => void;
  onClose: () => void;
  onOpen: (notification: ApiNotification) => void;
}) {
  return (
    <section role="dialog" aria-modal="true" aria-label="알림" style={notificationPanelStyle}>
      <div style={panelHandleStyle} aria-hidden />
      <header style={notificationHeaderStyle}>
        <div>
          <h2 style={notificationPanelTitleStyle}>알림</h2>
          <p style={notificationSubtitleStyle}>
            읽지 않은 알림 <strong style={{ color: BRAND_PRIMARY }}>{unreadCount}개</strong>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={onReadAll} disabled={unreadCount === 0} style={{ ...readAllButtonStyle, opacity: unreadCount === 0 ? 0.42 : 1 }}>
            모두 읽음
          </button>
          <button type="button" onClick={onClose} aria-label="닫기" style={notificationCloseStyle}>
            <X size={18} strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </header>

      <div style={notificationFilterStyle}>
        {NOTIFICATION_FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button key={item.id} type="button" onClick={() => onFilterChange(item.id)} style={{ ...filterChipStyle, ...(active ? activeFilterChipStyle : {}) }}>
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={notificationListStyle}>
        {loading ? (
          <PanelEmpty icon={<Bell size={24} />} title="알림을 불러오는 중이에요" description="잠시만 기다려 주세요." />
        ) : notifications.length === 0 ? (
          <PanelEmpty icon={<Bell size={24} />} title="알림이 없어요" description="새로운 소식이 생기면 이곳에서 알려드릴게요." />
        ) : (
          notifications.map((notification) => (
            <button key={notification.id} type="button" onClick={() => onOpen(notification)} style={notificationCardStyle}>
              {!notification.isRead ? <span style={unreadDotStyle} aria-hidden /> : null}
              <span style={notificationCardIconStyle}>{getNotificationIcon(notification.type)}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={notificationTitleRowStyle}>
                  <strong style={notificationCardTitleStyle}>{notification.title}</strong>
                  {!notification.isRead ? <span style={newBadgeStyle}>NEW</span> : null}
                </span>
                <span style={notificationCardDescriptionStyle}>{notification.message}</span>
                <span style={notificationTimeStyle}>{formatNotificationTime(notification.createdAt)}</span>
              </span>
              {(notification.postId || notification.chatRoomId || notification.actionUrl) ? <ChevronRight size={17} color="#B0B8C1" strokeWidth={2} aria-hidden /> : null}
            </button>
          ))
        )}
      </div>
    </section>
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

const NOTIFICATION_FILTERS: Array<{ id: NotificationFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "group-buy", label: "공동구매" },
  { id: "chat", label: "채팅" },
  { id: "activity", label: "활동" },
];

function matchesNotificationFilter(notification: ApiNotification, filter: NotificationFilter) {
  if (filter === "all") return true;
  if (filter === "chat") return notification.type === "new_chat_message";
  if (filter === "group-buy") return notification.type === "new_participant";
  return notification.type !== "new_chat_message" && notification.type !== "new_participant";
}

function getNotificationIcon(type: ApiNotification["type"]) {
  if (type === "new_participant") return <UsersRound size={20} strokeWidth={2} aria-hidden />;
  if (type === "new_chat_message") return <MessageCircle size={20} strokeWidth={2} aria-hidden />;
  return <BellRing size={20} strokeWidth={2} aria-hidden />;
}

const headerStyle: React.CSSProperties = { paddingTop: "env(safe-area-inset-top, 0px)", backgroundColor: "rgba(246, 248, 252, 0.86)", borderBottom: "1px solid rgba(229, 232, 239, 0.54)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" };
const brandMarkStyle: React.CSSProperties = { display: "flex", minWidth: 0, alignItems: "center", padding: 0, border: 0, background: "transparent", cursor: "pointer" };
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
const notificationPanelStyle: React.CSSProperties = { position: "fixed", zIndex: 70, top: "calc(68px + env(safe-area-inset-top, 0px))", left: "50%", width: "min(calc(100% - 20px), 410px)", maxHeight: "min(660px, calc(100dvh - 82px))", transform: "translateX(-50%)", overflow: "hidden", border: "1px solid #E5E8EF", borderRadius: 24, background: "#FFFFFF", boxShadow: "0 20px 48px rgba(31, 45, 70, 0.16), 0 3px 10px rgba(31, 45, 70, 0.06)" };
const notificationHeaderStyle: React.CSSProperties = { padding: "13px 17px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };
const notificationPanelTitleStyle: React.CSSProperties = { margin: 0, color: "#191F28", fontSize: 23, lineHeight: "30px", fontWeight: 900, letterSpacing: "-0.035em" };
const notificationSubtitleStyle: React.CSSProperties = { margin: "4px 0 0", color: "#8B95A1", fontSize: 12.5, lineHeight: "18px", fontWeight: 650 };
const readAllButtonStyle: React.CSSProperties = { border: 0, background: "transparent", color: BRAND_PRIMARY, fontSize: 12, lineHeight: "18px", fontWeight: 800, cursor: "pointer" };
const notificationCloseStyle: React.CSSProperties = { width: 34, height: 34, border: 0, borderRadius: 999, display: "grid", placeItems: "center", color: "#4E5968", background: "#F2F4F6", cursor: "pointer" };
const notificationFilterStyle: React.CSSProperties = { display: "flex", gap: 7, padding: "8px 17px 12px", overflowX: "auto", scrollbarWidth: "none" };
const filterChipStyle: React.CSSProperties = { height: 30, padding: "0 12px", flexShrink: 0, border: "1px solid #E5E8EF", borderRadius: 999, color: "#8B95A1", background: "#FFFFFF", fontSize: 11.5, lineHeight: "28px", fontWeight: 700, cursor: "pointer", transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease" };
const activeFilterChipStyle: React.CSSProperties = { borderColor: BRAND_PRIMARY, color: "#FFFFFF", background: BRAND_PRIMARY };
const notificationListStyle: React.CSSProperties = { maxHeight: "min(500px, calc(100dvh - 226px))", padding: "3px 12px 14px", display: "grid", gap: 9, overflowY: "auto", background: "#FFFFFF" };
const notificationCardStyle: React.CSSProperties = { position: "relative", width: "100%", minHeight: 91, padding: "12px 12px 12px 16px", display: "flex", alignItems: "center", gap: 10, border: "1px solid #E5E8EF", borderRadius: 18, color: "#191F28", background: "#FFFFFF", boxShadow: "0 4px 12px rgba(31, 45, 70, 0.045)", textAlign: "left", cursor: "pointer" };
const notificationCardIconStyle: React.CSSProperties = { width: 44, height: 44, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 15, color: BRAND_PRIMARY, background: "#EEF4FF" };
const notificationTitleRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, minWidth: 0 };
const notificationCardTitleStyle: React.CSSProperties = { overflow: "hidden", color: "#191F28", fontSize: 13.5, lineHeight: "19px", fontWeight: 850, textOverflow: "ellipsis", whiteSpace: "nowrap" };
const notificationCardDescriptionStyle: React.CSSProperties = { display: "-webkit-box", overflow: "hidden", marginTop: 3, color: "#4E5968", fontSize: 11.5, lineHeight: "16px", fontWeight: 600, WebkitBoxOrient: "vertical", WebkitLineClamp: 2 };
const unreadDotStyle: React.CSSProperties = { position: "absolute", left: 6, top: "50%", width: 5, height: 5, borderRadius: 999, background: BRAND_PRIMARY, transform: "translateY(-50%)" };
