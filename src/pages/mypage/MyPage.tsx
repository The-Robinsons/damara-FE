import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  Bell,
  BookOpenText,
  ChevronRight,
  Heart,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShieldCheck,
  UserMinus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";
import { getUserSummary } from "../../features/user/api/userApi";
import {
  BRAND_PRIMARY_TEXT,
  HOME_BORDER,
  HOME_CANVAS,
  TEXT_BODY,
  TEXT_META,
  TEXT_TITLE,
  blue50,
  grey400,
  grey900,
} from "../../shared/constants/homeTheme";
import { UI_PAGE_PAD_X, UI_TRANSITION } from "../../shared/constants/damaraUISystem";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";

type UserLite = {
  id?: string;
  nickname?: string;
  studentId?: string;
  department?: string;
};

type CountKey = "created" | "joined" | "favorites";

type TrustLite = {
  label?: string;
  trustGrade?: number;
};

type ActionItem = {
  title: string;
  desc: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  route: string;
  danger?: boolean;
  countKey?: CountKey;
};

const cardBase: React.CSSProperties = {
  border: `1px solid ${HOME_BORDER}`,
  borderRadius: 16,
  backgroundColor: "#fff",
  boxShadow: "0 3px 12px rgba(15, 23, 42, 0.04)",
};

function StatSkeleton() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 30,
        height: 19,
        borderRadius: 8,
        background: "linear-gradient(90deg, #f2f4f6 0%, #ffffff 50%, #f2f4f6 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export default function MyPage() {
  const nav = useNavigate();
  const [user, setUser] = useState<UserLite | null>(null);
  const [counts, setCounts] = useState<Record<CountKey, number>>({ created: 0, joined: 0, favorites: 0 });
  const [trust, setTrust] = useState<TrustLite>({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!storedUser) return;
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      setCountsLoading(true);
      try {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!userId) return;
        const { data } = await getUserSummary(userId);
        setUser(data.user);
        setCounts({
          created: data.counts.createdPostCount,
          joined: data.counts.participatedPostCount,
          favorites: data.counts.favoriteCount,
        });
        setTrust({ label: data.trust.label, trustGrade: data.user.trustGrade });
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const nickname = user?.nickname || "사용자";
  const studentId = user?.studentId || "학번 정보 없음";
  const initial = nickname.slice(0, 1).toUpperCase();
  const trustGrade = Number(trust.trustGrade ?? 0).toFixed(1);

  const tradeItems: ActionItem[] = useMemo(
    () => [
      {
        title: "등록한 공구",
        desc: "내가 만든 모집글",
        Icon: Package,
        iconBg: blue50,
        iconColor: BRAND_PRIMARY_TEXT,
        route: ROUTES.MY_CREATED,
        countKey: "created",
      },
      {
        title: "참여한 공구",
        desc: "거래 진행 현황",
        Icon: Users,
        iconBg: blue50,
        iconColor: BRAND_PRIMARY_TEXT,
        route: ROUTES.MY_JOINED,
        countKey: "joined",
      },
      {
        title: "관심목록",
        desc: "찜한 공구 모아보기",
        Icon: Heart,
        iconBg: blue50,
        iconColor: BRAND_PRIMARY_TEXT,
        route: ROUTES.FAVORITES,
        countKey: "favorites",
      },
      {
        title: "채팅",
        desc: "거래 대화 이어가기",
        Icon: MessageCircle,
        iconBg: blue50,
        iconColor: BRAND_PRIMARY_TEXT,
        route: ROUTES.CHAT,
      },
    ],
    []
  );

  const serviceItems: ActionItem[] = [
    { title: "공지사항", desc: "서비스 소식", Icon: Bell, iconBg: blue50, iconColor: BRAND_PRIMARY_TEXT, route: ROUTES.NOTICE },
    { title: "FAQ", desc: "자주 묻는 질문", Icon: BookOpenText, iconBg: blue50, iconColor: BRAND_PRIMARY_TEXT, route: ROUTES.FAQ },
    { title: "설정", desc: "알림과 앱 환경", Icon: Settings, iconBg: blue50, iconColor: BRAND_PRIMARY_TEXT, route: ROUTES.SETTINGS },
  ];

  const accountItems: ActionItem[] = [
    { title: "로그아웃", desc: "이 기기에서 계정 연결 해제", Icon: LogOut, iconBg: blue50, iconColor: BRAND_PRIMARY_TEXT, route: ROUTES.LOGOUT },
    { title: "회원 탈퇴", desc: "계정과 연결 기록 삭제", Icon: UserMinus, iconBg: blue50, iconColor: BRAND_PRIMARY_TEXT, route: ROUTES.WITHDRAW },
  ];

  return (
    <div data-page="마이페이지" style={{ minHeight: "100dvh", backgroundColor: HOME_CANVAS }}>
      <main style={{ padding: `14px ${UI_PAGE_PAD_X}px 96px`, display: "flex", flexDirection: "column", gap: 14 }}>
        <section style={profileCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={avatarStyle}>
              <span style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{initial}</span>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={verifiedBadgeStyle}>
                <ShieldCheck size={13} strokeWidth={2.25} aria-hidden />
                명지인 인증 완료
              </span>
              <h1 style={profileNameStyle}>{nickname}</h1>
              <p style={profileMetaStyle}>
                {studentId}
                {user?.department ? ` · ${user.department}` : ""}
              </p>
            </div>
          </div>

          <button type="button" data-card-interactive onClick={() => nav(ROUTES.TRUST_INFO)} style={mannerBoxStyle}>
            <span style={{ minWidth: 0 }}>
              <span style={mannerTitleStyle}>
                매너 점수 {trustGrade} <span style={{ color: grey400, fontWeight: 800 }}>/ 4.5</span>
              </span>
              <span style={mannerDescStyle}>{trust.label || "거래 이력을 확인해 보세요"}</span>
              <span style={scoreTrackStyle} aria-hidden>
                <span style={scoreFillStyle} />
              </span>
            </span>
            <span style={trustMiniPillStyle}>보기</span>
          </button>
        </section>

        <Section title="나의 공구">
          <div style={activityPanelStyle}>
            {tradeItems.map((item, index) => (
              <ActivityCard
                key={item.title}
                item={item}
                count={item.countKey ? counts[item.countKey] : undefined}
                loading={item.countKey ? countsLoading : false}
                showDivider={index !== tradeItems.length - 1}
                onClick={() => nav(item.route)}
              />
            ))}
          </div>
        </Section>

        <Section title="편의 기능">
          <div style={utilityGridStyle}>
            {serviceItems.map((item) => (
              <UtilityCard key={item.title} item={item} onClick={() => nav(item.route)} />
            ))}
          </div>
        </Section>

        <Section title="계정 관리">
          <div style={accountGridStyle}>
            {accountItems.map((item) => (
              <AccountCard key={item.title} item={item} onClick={() => nav(item.route)} />
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function ActivityCard({
  item,
  count,
  loading,
  showDivider,
  onClick,
}: {
  item: ActionItem;
  count?: number;
  loading: boolean;
  showDivider: boolean;
  onClick: () => void;
}) {
  const { Icon } = item;

  return (
    <button type="button" data-card-interactive="row" onClick={onClick} style={{ ...activityCardStyle, borderBottom: showDivider ? "1px solid rgba(49, 130, 246, 0.08)" : 0 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ ...activityIconStyle, backgroundColor: item.iconBg, color: item.iconColor }}>
          <Icon size={18} strokeWidth={2.2} aria-hidden />
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={activityTitleStyle}>{item.title}</span>
          <span style={activityDescStyle}>{item.desc}</span>
        </span>
      </span>
      <span style={activityRightStyle}>
        {count !== undefined && <span style={activityCountPillStyle}>{loading ? <StatSkeleton /> : `${count}개`}</span>}
        <ChevronRight size={16} color={grey400} strokeWidth={2.1} aria-hidden />
      </span>
    </button>
  );
}

function UtilityCard({ item, onClick }: { item: ActionItem; onClick: () => void }) {
  const { Icon } = item;

  return (
    <button type="button" data-card-interactive onClick={onClick} style={utilityCardStyle}>
      <span style={{ ...utilityIconStyle, backgroundColor: item.iconBg, color: item.iconColor }}>
        <Icon size={17} strokeWidth={2.15} aria-hidden />
      </span>
      <span style={utilityTitleStyle}>{item.title}</span>
    </button>
  );
}

function AccountCard({ item, onClick }: { item: ActionItem; onClick: () => void }) {
  const { Icon } = item;

  return (
    <button type="button" data-card-interactive onClick={onClick} style={accountActionStyle}>
      <span style={accountActionIconStyle}>
        <Icon size={18} strokeWidth={2.1} aria-hidden />
      </span>
      <span>{item.title}</span>
    </button>
  );
}

const profileCardStyle: React.CSSProperties = {
  ...cardBase,
  position: "relative",
  padding: 18,
  overflow: "hidden",
  borderRadius: 24,
  border: "1px solid rgba(49, 130, 246, 0.16)",
  background: "linear-gradient(145deg, #ffffff 0%, #f4f8ff 48%, #edf8f6 100%)",
  boxShadow: "0 16px 34px rgba(49, 130, 246, 0.14), 0 2px 8px rgba(15, 23, 42, 0.04)",
};

const avatarStyle: React.CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: 18,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  color: BRAND_PRIMARY_TEXT,
  background: "linear-gradient(145deg, #dbeafe 0%, #ffffff 100%)",
  border: "1px solid rgba(49, 130, 246, 0.18)",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
};

const verifiedBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  minHeight: 23,
  padding: "0 9px",
  borderRadius: 999,
  color: BRAND_PRIMARY_TEXT,
  backgroundColor: "rgba(49, 130, 246, 0.1)",
  fontSize: 11,
  fontWeight: 850,
};

const profileNameStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: TEXT_TITLE,
  fontSize: 21,
  fontWeight: 900,
  lineHeight: "28px",
  letterSpacing: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const profileMetaStyle: React.CSSProperties = {
  margin: "2px 0 0",
  color: TEXT_META,
  fontSize: 12,
  fontWeight: 650,
  lineHeight: "18px",
};

const mannerBoxStyle: React.CSSProperties = {
  marginTop: 14,
  width: "100%",
  border: "1px solid rgba(49, 130, 246, 0.18)",
  borderRadius: 18,
  backgroundColor: "rgba(255, 255, 255, 0.78)",
  padding: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  cursor: "pointer",
  textAlign: "left",
};

const mannerTitleStyle: React.CSSProperties = {
  display: "block",
  color: TEXT_TITLE,
  fontSize: 13,
  fontWeight: 850,
  lineHeight: "18px",
};

const mannerDescStyle: React.CSSProperties = {
  display: "block",
  marginTop: 3,
  color: TEXT_BODY,
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "16px",
};

const scoreTrackStyle: React.CSSProperties = {
  display: "block",
  width: 148,
  maxWidth: "100%",
  height: 5,
  marginTop: 8,
  borderRadius: 999,
  background: "rgba(49, 130, 246, 0.12)",
  overflow: "hidden",
};

const scoreFillStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #3182f6 0%, #20c997 100%)",
};

const trustMiniPillStyle: React.CSSProperties = {
  height: 29,
  minWidth: 48,
  padding: "0 12px",
  borderRadius: 999,
  backgroundColor: blue50,
  color: BRAND_PRIMARY_TEXT,
  fontSize: 12,
  fontWeight: 850,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "4px 2px 0",
  color: TEXT_TITLE,
  fontSize: 13,
  fontWeight: 900,
  lineHeight: "19px",
  letterSpacing: 0,
};

const activityPanelStyle: React.CSSProperties = {
  ...cardBase,
  overflow: "hidden",
  borderRadius: 22,
  border: "1px solid rgba(49, 130, 246, 0.12)",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  boxShadow: "0 10px 26px rgba(49, 130, 246, 0.08)",
};

const activityCardStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 76,
  padding: "13px 14px",
  border: 0,
  borderRadius: 0,
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  textAlign: "left",
  cursor: "pointer",
  transition: UI_TRANSITION,
};

const activityIconStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
};

const activityCountPillStyle: React.CSSProperties = {
  minWidth: 38,
  height: 25,
  padding: "0 10px",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: BRAND_PRIMARY_TEXT,
  backgroundColor: "rgba(49, 130, 246, 0.1)",
  border: "1px solid rgba(49, 130, 246, 0.08)",
  fontSize: 11,
  fontWeight: 850,
  lineHeight: "16px",
};

const activityTitleStyle: React.CSSProperties = {
  display: "block",
  color: TEXT_TITLE,
  fontSize: 14.5,
  fontWeight: 900,
  lineHeight: "21px",
};

const activityDescStyle: React.CSSProperties = {
  display: "block",
  marginTop: 3,
  color: TEXT_META,
  fontSize: 11,
  fontWeight: 650,
  lineHeight: "16px",
};

const activityRightStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  flexShrink: 0,
};

const utilityGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
};

const utilityCardStyle: React.CSSProperties = {
  ...cardBase,
  minHeight: 86,
  padding: "13px 8px",
  borderRadius: 20,
  border: "1px solid rgba(49, 130, 246, 0.12)",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  boxShadow: "0 8px 20px rgba(49, 130, 246, 0.065)",
  display: "grid",
  placeItems: "center",
  alignContent: "center",
  gap: 8,
  textAlign: "center",
  cursor: "pointer",
  transition: UI_TRANSITION,
};

const utilityIconStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 13,
  display: "grid",
  placeItems: "center",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
};

const utilityTitleStyle: React.CSSProperties = {
  display: "block",
  color: TEXT_TITLE,
  fontSize: 12,
  fontWeight: 850,
  lineHeight: "17px",
};

const accountGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const accountActionStyle: React.CSSProperties = {
  minHeight: 72,
  padding: "0 16px",
  borderRadius: 18,
  border: "1px solid rgba(49, 130, 246, 0.14)",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  color: BRAND_PRIMARY_TEXT,
  fontSize: 13,
  fontWeight: 900,
  textAlign: "center",
  cursor: "pointer",
  transition: UI_TRANSITION,
  boxShadow: "0 6px 18px rgba(49, 130, 246, 0.055)",
};

const accountActionIconStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  color: BRAND_PRIMARY_TEXT,
  backgroundColor: blue50,
};
