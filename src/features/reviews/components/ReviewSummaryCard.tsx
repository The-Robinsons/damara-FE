import { GraduationCap } from "lucide-react";

import InfoBanner from "../../../shared/components/damara/InfoBanner";
import SurfaceCard from "../../../shared/components/damara/SurfaceCard";
import { blue50, blue600, grey200, grey500, grey900 } from "../../../shared/constants/homeTheme";
import { useReviewSummary } from "../hooks/useReviews";
import { getReviewErrorMessage, getReviewRoleLabel, getReviewTagLabel } from "../model/reviewPresentation";
import type { ReviewRole } from "../model/reviewTypes";

export default function ReviewSummaryCard({ userId }: { userId: string }) {
  const query = useReviewSummary(userId);
  if (query.isLoading) return <div data-skeleton style={{ height: 180, borderRadius: 8 }} />;
  if (query.isError) return <InfoBanner tone="danger">{getReviewErrorMessage(query.error)}</InfoBanner>;
  if (!query.data) return null;

  const summary = query.data;
  return (
    <SurfaceCard padding={17}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span>
          <span style={{ display: "block", color: grey500, fontSize: 12, fontWeight: 700 }}>평가 기반 신뢰학점</span>
          <strong style={{ display: "block", marginTop: 4, color: grey900, fontSize: 32 }}>{summary.trustGrade}</strong>
        </span>
        <span style={{ width: 42, height: 42, borderRadius: 8, display: "grid", placeItems: "center", color: blue600, background: blue50 }}>
          <GraduationCap size={22} aria-hidden />
        </span>
      </div>
      <p style={{ margin: "8px 0 0", color: grey500, fontSize: 12 }}>공개 평가 {summary.reviewCount}개 · 신뢰도 {getConfidenceLabel(summary.confidence)}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
        {(["organizer", "participant"] as ReviewRole[]).map((role) => {
          const roleSummary = summary.roles[role];
          return (
            <div key={role} style={{ minWidth: 0, padding: 11, border: `1px solid ${grey200}`, borderRadius: 8 }}>
              <strong style={{ color: grey900, fontSize: 12 }}>{getReviewRoleLabel(role)}로 받은 평가</strong>
              <span style={{ display: "block", marginTop: 5, color: blue600, fontSize: 13, fontWeight: 800 }}>{roleSummary.reviewCount}개</span>
              <span style={{ display: "block", marginTop: 3, color: grey500, fontSize: 10.5 }}>좋음 {roleSummary.ratings.positive} · 보통 {roleSummary.ratings.neutral} · 아쉬움 {roleSummary.ratings.negative}</span>
            </div>
          );
        })}
      </div>
      {summary.tags.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {summary.tags.slice(0, 5).map(({ tag, count }) => (
            <span key={tag} style={{ padding: "5px 8px", borderRadius: 8, background: blue50, color: blue600, fontSize: 10.5, fontWeight: 700 }}>
              {getReviewTagLabel(tag)} {count}
            </span>
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  );
}

function getConfidenceLabel(confidence: "low" | "medium" | "high") {
  return { low: "낮음", medium: "보통", high: "높음" }[confidence];
}
