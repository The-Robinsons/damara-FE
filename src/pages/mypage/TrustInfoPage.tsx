import { useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle, MessageSquare } from "lucide-react";

import { getUserTrustSummary } from "../../features/user/api/userApi";
import type { ApiTrustSummaryResponse } from "../../shared/api/swaggerTypes";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { blue500, grey500, grey900 } from "../../shared/constants/homeTheme";
import { AccountServiceShell, bodyText, serviceCard, softInfoBox } from "./AccountServiceShell";

const DEFAULT_TRUST: ApiTrustSummaryResponse = {
  trustScore: 0,
  trustGrade: 0,
  gradeLabel: "신뢰 정보 없음",
  rankPercent: 0,
  completedTradeCount: 0,
  responseRate: 0,
  avgResponseMinutes: 0,
  cancelCount: 0,
  noShowCount: 0,
  badges: [],
};

export default function TrustInfoPage() {
  const [trust, setTrust] = useState(DEFAULT_TRUST);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      setError("로그인이 필요해요.");
      setLoading(false);
      return;
    }

    getUserTrustSummary(userId)
      .then(({ data }) => setTrust(data))
      .catch(() => setError("신뢰 정보를 불러오지 못했어요."))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "거래 완료", value: `${trust.completedTradeCount}건`, Icon: CheckCircle },
    { label: "응답률", value: `${trust.responseRate}%`, Icon: MessageSquare },
    { label: "노쇼", value: `${trust.noShowCount}건`, Icon: BadgeCheck },
    { label: "취소", value: `${trust.cancelCount}건`, Icon: AlertTriangle },
  ];

  return (
    <AccountServiceShell title="신뢰 정보" subtitle="거래 이력으로 계산한 현재 신뢰도를 확인해요.">
      {error ? <div style={softInfoBox}>{error}</div> : null}

      <section style={{ ...serviceCard, padding: 18 }}>
        <p style={{ margin: 0, color: grey500, fontSize: 12, fontWeight: 700 }}>현재 신뢰학점</p>
        <strong style={{ display: "block", marginTop: 6, color: grey900, fontSize: 34, lineHeight: "40px" }}>
          {loading ? "-" : trust.trustGrade.toFixed(1)}
          <span style={{ color: grey500, fontSize: 15 }}> / 4.5</span>
        </strong>
        <p style={{ ...bodyText, marginTop: 4 }}>{trust.gradeLabel}</p>
        <p style={{ ...bodyText, marginTop: 8, color: blue500 }}>
          {trust.rankPercent > 0 ? `상위 ${trust.rankPercent}% · 평균 응답 ${trust.avgResponseMinutes}분` : "거래 이력을 쌓아 보세요."}
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        {stats.map(({ label, value, Icon }) => (
          <div key={label} style={{ ...serviceCard, padding: 14 }}>
            <Icon size={18} color={blue500} />
            <span style={{ display: "block", marginTop: 9, color: grey500, fontSize: 11 }}>{label}</span>
            <strong style={{ display: "block", marginTop: 3, color: grey900, fontSize: 17 }}>{loading ? "-" : value}</strong>
          </div>
        ))}
      </section>

      {trust.badges.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
          {trust.badges.map((badge) => (
            <span key={badge} style={{ ...softInfoBox, padding: "6px 9px" }}>{badge}</span>
          ))}
        </div>
      ) : null}
    </AccountServiceShell>
  );
}
