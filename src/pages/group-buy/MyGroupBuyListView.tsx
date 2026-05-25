import type React from "react";
import { ArrowLeft, ChevronRight, Heart, Package, Plus, Search, Users, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";
import GroupBuyCard from "../../features/group-buy/components/GroupBuyCard";
import { mapApiPostToGroupBuyCard } from "../../features/group-buy/utils/postToCardProps";
import {
  BRAND_PRIMARY,
  BRAND_PRIMARY_TEXT,
  HOME_BORDER,
  HOME_CANVAS,
  TEXT_BODY,
  TEXT_META,
  TEXT_TITLE,
  blue50,
  grey100,
  grey400,
  grey500,
  grey900,
} from "../../shared/constants/homeTheme";
import { UI_PAGE_PAD_X, UI_TRANSITION } from "../../shared/constants/damaraUISystem";
import { SkeletonGroupBuyRow } from "../../shared/components/damara/Skeleton";

type Accent = "blue";

type MyGroupBuyListViewProps = {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroDescription: string;
  Icon: LucideIcon;
  accent?: Accent;
  posts: any[];
  loading: boolean;
  error: string | null;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel: string;
  emptyActionRoute: string;
};

const accentMap: Record<Accent, { bg: string; fg: string; soft: string }> = {
  blue: { bg: BRAND_PRIMARY, fg: BRAND_PRIMARY_TEXT, soft: blue50 },
};

export default function MyGroupBuyListView({
  title,
  subtitle,
  heroTitle,
  heroDescription,
  Icon,
  accent = "blue",
  posts,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionRoute,
}: MyGroupBuyListViewProps) {
  const nav = useNavigate();
  const tone = accentMap[accent];
  const openCount = posts.filter((post) => isOpenPost(post?.status)).length;
  const doneCount = posts.filter((post) => isDonePost(post?.status)).length;
  const activeKey = title.includes("참여") ? "joined" : title.includes("관심") ? "favorite" : "created";

  return (
    <div data-page={title} style={{ minHeight: "100dvh", backgroundColor: HOME_CANVAS }}>
      <header style={headerStyle}>
        <button type="button" aria-label="뒤로가기" onClick={() => nav(ROUTES.MYPAGE)} style={iconButtonStyle}>
          <ArrowLeft size={20} strokeWidth={2.3} aria-hidden />
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={titleStyle}>{title}</h1>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>
        <button type="button" aria-label="검색" onClick={() => nav(ROUTES.HOME)} style={iconButtonStyle}>
          <Search size={19} strokeWidth={2.15} aria-hidden />
        </button>
      </header>

      <main style={{ padding: `14px ${UI_PAGE_PAD_X}px 100px`, display: "flex", flexDirection: "column", gap: 14 }}>
        <section style={{ ...heroStyle, borderColor: `${tone.fg}24`, background: `linear-gradient(145deg, #ffffff 0%, ${tone.soft} 100%)` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ ...heroIconStyle, color: tone.fg, backgroundColor: tone.soft }}>
              <Icon size={21} strokeWidth={2.2} aria-hidden />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={heroEyebrowStyle}>{heroTitle}</p>
              <p style={heroDescStyle}>{heroDescription}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <strong style={{ ...heroCountStyle, color: tone.fg }}>{posts.length}</strong>
              <span style={heroCountLabelStyle}>개</span>
            </div>
          </div>

          <div style={metricGridStyle}>
            <Metric label="전체" value={posts.length} tone={tone} active />
            <Metric label="진행중" value={openCount} tone={tone} />
            <Metric label="완료" value={doneCount} tone={tone} />
          </div>
        </section>

        <nav aria-label="마이 공구 메뉴" style={pageSwitchStyle}>
          {[
            { key: "created", label: "등록한 공구", route: ROUTES.MY_CREATED, Icon: Package },
            { key: "joined", label: "참여한 공구", route: ROUTES.MY_JOINED, Icon: Users },
            { key: "favorite", label: "관심목록", route: ROUTES.FAVORITES, Icon: Heart },
          ].map((item) => {
            const active = item.key === activeKey;
            const SwitchIcon = item.Icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => nav(item.route)}
                style={{
                  ...pageSwitchButtonStyle,
                  color: active ? tone.fg : grey500,
                  backgroundColor: active ? "#fff" : "transparent",
                  boxShadow: active ? "0 3px 10px rgba(15, 23, 42, 0.06)" : "none",
                }}
              >
                <SwitchIcon size={14} strokeWidth={2.15} aria-hidden />
                {item.label}
              </button>
            );
          })}
        </nav>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonGroupBuyRow />
            <SkeletonGroupBuyRow />
            <SkeletonGroupBuyRow />
          </div>
        ) : error ? (
          <ListEmpty
            Icon={Icon}
            title="불러오지 못했어요"
            description={error}
            actionLabel="홈으로 가기"
            onAction={() => nav(ROUTES.HOME)}
            tone={tone}
          />
        ) : posts.length === 0 ? (
          <ListEmpty
            Icon={Icon}
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={() => nav(emptyActionRoute)}
            tone={tone}
          />
        ) : (
          <section style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={listHeaderStyle}>
              <span>{title}</span>
              <span>{posts.length}개</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {posts.map((post) => (
                <li key={String(post.id)}>
                  <GroupBuyCard
                    {...mapApiPostToGroupBuyCard(post, () => nav(ROUTES.GROUP_BUY_DETAIL.replace(":id", String(post.id))))}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  active,
}: {
  label: string;
  value: number;
  tone: { bg: string; fg: string; soft: string };
  active?: boolean;
}) {
  return (
    <div style={{ ...metricCardStyle, backgroundColor: active ? "#fff" : "rgba(255,255,255,0.58)" }}>
      <span style={metricLabelStyle}>{label}</span>
      <strong style={{ ...metricValueStyle, color: active ? tone.fg : TEXT_TITLE }}>{value}</strong>
    </div>
  );
}

function isOpenPost(status: unknown): boolean {
  return ["open", "recruiting", "in_progress", "RECRUITING", "AVAILABLE", undefined, null].includes(status as any);
}

function isDonePost(status: unknown): boolean {
  return ["closed", "completed", "cancelled", "RECRUIT_FULL", "SOLD_OUT", "COMPLETED"].includes(status as string);
}

function ListEmpty({
  Icon,
  title,
  description,
  actionLabel,
  onAction,
  tone,
}: {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  tone: { bg: string; fg: string; soft: string };
}) {
  return (
    <section style={emptyCardStyle}>
      <span style={{ ...emptyIconStyle, color: tone.fg, backgroundColor: tone.soft }}>
        <Icon size={28} strokeWidth={1.9} aria-hidden />
      </span>
      <h2 style={emptyTitleStyle}>{title}</h2>
      <p style={emptyDescStyle}>{description}</p>
      <button type="button" onClick={onAction} style={{ ...emptyButtonStyle, backgroundColor: tone.bg }}>
        {actionLabel}
        <ChevronRight size={15} strokeWidth={2.2} aria-hidden />
      </button>
    </section>
  );
}

export function normalizeFavoritePosts(data: any): any[] {
  const raw = Array.isArray(data)
    ? data
    : Array.isArray(data?.posts)
      ? data.posts
      : Array.isArray(data?.favorites)
        ? data.favorites
        : Array.isArray(data?.data)
          ? data.data
          : [];

  return raw.map((item: any) => item.post ?? item).filter(Boolean);
}

export function normalizeJoinedPosts(data: any): any[] {
  const raw = Array.isArray(data) ? data : Array.isArray(data?.posts) ? data.posts : Array.isArray(data?.data) ? data.data : [];
  return raw.map((item: any) => item.post ?? item).filter(Boolean);
}

export function CreatePostShortcut() {
  const nav = useNavigate();
  return (
    <button type="button" onClick={() => nav(ROUTES.GROUP_BUY_CREATE)} style={createShortcutStyle}>
      <Plus size={18} strokeWidth={2.4} aria-hidden />
    </button>
  );
}

const headerStyle: React.CSSProperties = {
  minHeight: 64,
  padding: `10px ${UI_PAGE_PAD_X}px`,
  borderBottom: `1px solid rgba(229, 232, 235, 0.72)`,
  backgroundColor: "rgba(249, 250, 251, 0.94)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  position: "sticky",
  top: 0,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const iconButtonStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  border: 0,
  borderRadius: 13,
  display: "grid",
  placeItems: "center",
  color: grey900,
  backgroundColor: grey100,
  cursor: "pointer",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: TEXT_TITLE,
  fontSize: 18,
  fontWeight: 900,
  lineHeight: "24px",
  letterSpacing: 0,
};

const subtitleStyle: React.CSSProperties = {
  margin: "1px 0 0",
  color: TEXT_META,
  fontSize: 11,
  fontWeight: 650,
  lineHeight: "16px",
};

const heroStyle: React.CSSProperties = {
  border: `1px solid ${HOME_BORDER}`,
  borderRadius: 18,
  background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
  padding: 15,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.045)",
};

const heroIconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
};

const heroEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: TEXT_TITLE,
  fontSize: 14,
  fontWeight: 900,
  lineHeight: "20px",
};

const heroDescStyle: React.CSSProperties = {
  margin: "3px 0 0",
  color: TEXT_BODY,
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "16px",
};

const heroCountStyle: React.CSSProperties = {
  display: "block",
  fontSize: 28,
  fontWeight: 900,
  lineHeight: "30px",
};

const heroCountLabelStyle: React.CSSProperties = {
  display: "block",
  marginTop: 1,
  color: TEXT_META,
  fontSize: 10,
  fontWeight: 800,
  lineHeight: "14px",
};

const metricGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 8,
  marginTop: 14,
};

const metricCardStyle: React.CSSProperties = {
  minHeight: 56,
  borderRadius: 15,
  border: "1px solid rgba(255,255,255,0.76)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 3,
};

const metricLabelStyle: React.CSSProperties = {
  color: TEXT_META,
  fontSize: 10,
  fontWeight: 800,
  lineHeight: "14px",
};

const metricValueStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 950,
  lineHeight: "22px",
};

const pageSwitchStyle: React.CSSProperties = {
  height: 42,
  padding: 4,
  borderRadius: 16,
  backgroundColor: grey100,
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 4,
};

const pageSwitchButtonStyle: React.CSSProperties = {
  minWidth: 0,
  border: 0,
  borderRadius: 12,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 850,
  lineHeight: "16px",
  letterSpacing: 0,
  transition: UI_TRANSITION,
};

const listHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 2px",
  color: grey500,
  fontSize: 11,
  fontWeight: 800,
  lineHeight: "16px",
};

const emptyCardStyle: React.CSSProperties = {
  minHeight: 260,
  padding: "34px 22px",
  borderRadius: 20,
  border: `1px solid ${HOME_BORDER}`,
  backgroundColor: "#fff",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const emptyIconStyle: React.CSSProperties = {
  width: 66,
  height: 66,
  borderRadius: 22,
  display: "grid",
  placeItems: "center",
};

const emptyTitleStyle: React.CSSProperties = {
  margin: "16px 0 0",
  color: TEXT_TITLE,
  fontSize: 17,
  fontWeight: 900,
  lineHeight: "24px",
};

const emptyDescStyle: React.CSSProperties = {
  margin: "6px 0 0",
  maxWidth: 270,
  color: TEXT_META,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: "18px",
};

const emptyButtonStyle: React.CSSProperties = {
  marginTop: 18,
  height: 42,
  padding: "0 16px",
  border: 0,
  borderRadius: 14,
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 13,
  fontWeight: 850,
  cursor: "pointer",
  transition: UI_TRANSITION,
};

const createShortcutStyle: React.CSSProperties = {
  position: "fixed",
  right: 20,
  bottom: 26,
  width: 48,
  height: 48,
  border: 0,
  borderRadius: 17,
  color: "#fff",
  backgroundColor: BRAND_PRIMARY,
  boxShadow: "0 12px 28px rgba(49, 130, 246, 0.28)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  zIndex: 20,
};
