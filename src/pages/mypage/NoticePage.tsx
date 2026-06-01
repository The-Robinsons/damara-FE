import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Megaphone, Pin, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { getNotice, getNotices } from "../../features/user/api/serviceApi";
import type { ApiNotice } from "../../shared/api/swaggerTypes";
import {
  BRAND_PRIMARY,
  HOME_CANVAS,
  background,
  blue50,
  blue500,
  grey200,
  grey400,
  grey500,
  grey700,
  grey900,
} from "../../shared/constants/homeTheme";
import { AccountServiceShell } from "./AccountServiceShell";

const NOTICE_TYPE_LABELS: Record<string, string> = {
  service: "서비스 안내",
  event: "이벤트",
  maintenance: "점검 안내",
  policy: "운영 정책",
};

export default function NoticePage() {
  const [notices, setNotices] = useState<ApiNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<ApiNotice | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    getNotices()
      .then(({ data }) => setNotices(Array.isArray(data?.notices) ? data.notices : []))
      .catch(() => toast.error("공지사항을 불러오지 못했어요."))
      .finally(() => setLoading(false));
  }, []);

  const openNotice = async (notice: ApiNotice) => {
    setSelectedNotice(notice);
    setLoadingDetail(true);
    try {
      const { data } = await getNotice(notice.id);
      setSelectedNotice(data?.notice ?? data);
    } catch {
      toast.error("공지 상세 내용을 불러오지 못했어요.");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <AccountServiceShell title="공지사항" subtitle="DAMARA의 새로운 소식과 이용 안내를 확인해 보세요.">
      <section style={introCardStyle}>
        <span style={introIconStyle}>
          <Megaphone size={18} strokeWidth={2.1} aria-hidden />
        </span>
        <div>
          <strong style={introTitleStyle}>알아두면 좋은 소식</strong>
          <p style={introDescriptionStyle}>중요한 서비스 변경과 안전한 거래 안내를 모아두었어요.</p>
        </div>
      </section>

      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>최근 소식</h2>
        {!loading ? <span style={countBadgeStyle}>{notices.length}개</span> : null}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {loading ? (
          <NoticePlaceholder />
        ) : notices.length === 0 ? (
          <div style={emptyStyle}>
            <Bell size={22} color={grey400} aria-hidden />
            <p style={{ margin: "8px 0 0" }}>등록된 공지사항이 없어요.</p>
          </div>
        ) : (
          notices.map((notice) => <NoticeCard key={notice.id} notice={notice} onClick={() => void openNotice(notice)} />)
        )}
      </div>

      <div style={footnoteStyle}>
        <Bell size={14} aria-hidden />
        <p style={{ margin: 0 }}>서버에 등록된 최신 공지를 표시하고 있어요.</p>
      </div>

      {selectedNotice
        ? createPortal(
            <NoticeDetail notice={selectedNotice} loading={loadingDetail} onClose={() => setSelectedNotice(null)} />,
            document.body
          )
        : null}
    </AccountServiceShell>
  );
}

function NoticeCard({ notice, onClick }: { notice: ApiNotice; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} data-card-interactive aria-label={`${notice.title} 상세 보기`} style={noticeCardStyle}>
      <div style={noticeTopRowStyle}>
        <NoticeBadge notice={notice} />
        <span style={dateStyle}>{formatNoticeDate(notice.createdAt)}</span>
      </div>
      <strong style={noticeTitleStyle}>{notice.title}</strong>
      <p style={noticeSummaryStyle}>{notice.summary || notice.content}</p>
      <span style={moreStyle}>
        자세히 보기
        <ChevronRight size={14} strokeWidth={2.2} aria-hidden />
      </span>
    </button>
  );
}

function NoticeBadge({ notice }: { notice: ApiNotice }) {
  return (
    <span style={noticeBadgeStyle}>
      {notice.isPinned ? <Pin size={10} strokeWidth={2.4} aria-hidden /> : null}
      {notice.category || NOTICE_TYPE_LABELS[notice.type] || notice.type}
    </span>
  );
}

function NoticeDetail({ notice, loading, onClose }: { notice: ApiNotice; loading: boolean; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div style={detailBackdropStyle} role="dialog" aria-modal="true" aria-label={`${notice.title} 공지 상세`}>
      <div style={detailPanelStyle}>
        <header style={detailHeaderStyle}>
          <button type="button" onClick={onClose} aria-label="공지 목록으로 돌아가기" style={headerIconButtonStyle}>
            <ChevronLeft size={23} strokeWidth={2.2} aria-hidden />
          </button>
          <strong style={detailHeaderTitleStyle}>공지 상세</strong>
          <button type="button" onClick={onClose} aria-label="닫기" style={headerIconButtonStyle}>
            <X size={19} strokeWidth={2.2} aria-hidden />
          </button>
        </header>

        <main style={detailBodyStyle}>
          <span style={detailBadgeStyle}>
            <ShieldCheck size={14} strokeWidth={2.1} aria-hidden />
            {notice.category || NOTICE_TYPE_LABELS[notice.type] || notice.type}
          </span>
          <h1 style={detailTitleStyle}>{notice.title}</h1>
          <div style={detailDateStyle}>
            <CalendarDays size={14} strokeWidth={2} aria-hidden />
            {formatNoticeDate(notice.createdAt, true)}
          </div>
          <div style={detailDividerStyle} />
          {loading ? (
            <p style={detailContentStyle}>공지 내용을 불러오는 중이에요.</p>
          ) : (
            <p style={detailContentStyle}>{notice.content}</p>
          )}
        </main>
      </div>
    </div>
  );
}

function NoticePlaceholder() {
  return (
    <div style={placeholderStyle}>
      <div style={{ width: 68, height: 20, borderRadius: 999, background: grey200 }} />
      <div style={{ width: "78%", height: 18, marginTop: 16, borderRadius: 6, background: grey200 }} />
      <div style={{ width: "100%", height: 14, marginTop: 10, borderRadius: 6, background: "rgba(229,232,235,0.72)" }} />
    </div>
  );
}

function formatNoticeDate(value: string, includeYear = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return includeYear
    ? `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    : `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

const introCardStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "15px 14px",
  borderRadius: 17,
  border: "1px solid rgba(191, 211, 248, 0.62)",
  background: "linear-gradient(135deg, rgba(235,243,255,0.96) 0%, rgba(248,251,255,0.98) 100%)",
};

const introIconStyle: React.CSSProperties = { width: 38, height: 38, borderRadius: 13, background: "rgba(49,130,246,0.12)", color: BRAND_PRIMARY, display: "grid", placeItems: "center", flexShrink: 0 };
const introTitleStyle: React.CSSProperties = { display: "block", color: grey900, fontSize: 13.5, lineHeight: "19px", fontWeight: 850 };
const introDescriptionStyle: React.CSSProperties = { margin: "4px 0 0", color: grey500, fontSize: 11.5, lineHeight: "17px", fontWeight: 600 };
const sectionHeaderStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "21px 2px 10px" };
const sectionTitleStyle: React.CSSProperties = { margin: 0, color: grey900, fontSize: 14.5, lineHeight: "20px", fontWeight: 850 };
const countBadgeStyle: React.CSSProperties = { padding: "3px 8px", borderRadius: 999, color: blue500, background: blue50, fontSize: 10.5, fontWeight: 800 };

const noticeCardStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: 16,
  border: `1px solid ${grey200}`,
  background,
  boxShadow: "0 5px 16px rgba(78,104,148,0.055)",
  textAlign: "left",
  cursor: "pointer",
};

const noticeTopRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 };
const noticeBadgeStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 3, minHeight: 20, padding: "0 7px", borderRadius: 999, background: "rgba(49,130,246,0.1)", color: blue500, fontSize: 10, fontWeight: 850 };
const dateStyle: React.CSSProperties = { color: grey400, fontSize: 10.5, fontWeight: 700 };
const noticeTitleStyle: React.CSSProperties = { display: "block", marginTop: 10, color: grey900, fontSize: 14, lineHeight: "20px", fontWeight: 850, letterSpacing: "-0.02em" };
const noticeSummaryStyle: React.CSSProperties = { margin: "5px 0 0", color: grey500, fontSize: 11.5, lineHeight: "17px", fontWeight: 600, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" };
const moreStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 2, width: "fit-content", marginTop: 10, color: blue500, fontSize: 11, lineHeight: "15px", fontWeight: 800 };
const emptyStyle: React.CSSProperties = { padding: "28px 16px", borderRadius: 16, border: `1px solid ${grey200}`, background, color: grey500, textAlign: "center", fontSize: 12, fontWeight: 650 };
const placeholderStyle: React.CSSProperties = { padding: 14, minHeight: 106, borderRadius: 16, border: `1px solid ${grey200}`, background };
const footnoteStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, margin: "15px 3px 0", color: grey500, fontSize: 11.5, lineHeight: "17px", fontWeight: 600 };

const detailBackdropStyle: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 150, display: "flex", justifyContent: "center", background: "rgba(26, 40, 67, 0.22)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" };
const detailPanelStyle: React.CSSProperties = { width: "100%", maxWidth: 430, minHeight: "100dvh", background: HOME_CANVAS };
const detailHeaderStyle: React.CSSProperties = { height: 56, display: "grid", gridTemplateColumns: "40px 1fr 40px", alignItems: "center", padding: "0 14px", borderBottom: `1px solid ${grey200}`, background: "rgba(255,255,255,0.94)" };
const headerIconButtonStyle: React.CSSProperties = { width: 36, height: 36, border: 0, borderRadius: 999, background: "transparent", color: grey900, display: "grid", placeItems: "center", cursor: "pointer" };
const detailHeaderTitleStyle: React.CSSProperties = { textAlign: "center", color: grey900, fontSize: 16.5, fontWeight: 850 };
const detailBodyStyle: React.CSSProperties = { padding: "27px 22px" };
const detailBadgeStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 999, color: blue500, background: blue50, fontSize: 11, fontWeight: 850 };
const detailTitleStyle: React.CSSProperties = { margin: "14px 0 0", color: grey900, fontSize: 22, lineHeight: "31px", fontWeight: 900, letterSpacing: "-0.035em" };
const detailDateStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, marginTop: 11, color: grey500, fontSize: 11.5, fontWeight: 650 };
const detailDividerStyle: React.CSSProperties = { height: 1, margin: "23px 0 19px", background: grey200 };
const detailContentStyle: React.CSSProperties = { margin: 0, color: grey700, fontSize: 14, lineHeight: "25px", fontWeight: 550, whiteSpace: "pre-line" };
