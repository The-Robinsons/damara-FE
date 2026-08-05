import { ChevronRight, ClipboardCheck } from "lucide-react";

import InfoBanner from "../../../shared/components/damara/InfoBanner";
import SurfaceCard from "../../../shared/components/damara/SurfaceCard";
import { blue50, blue600, grey200, grey500, grey900 } from "../../../shared/constants/homeTheme";
import { usePendingReviews } from "../hooks/useReviews";
import { getReviewErrorMessage, getReviewRoleLabel } from "../model/reviewPresentation";

export default function PendingReviewList({ userId, onOpenPost }: { userId: string; onOpenPost: (postId: string) => void }) {
  const query = usePendingReviews(userId);

  if (query.isLoading) return <div data-skeleton style={{ height: 78, borderRadius: 8 }} />;
  if (query.isError) return <InfoBanner tone="danger">{getReviewErrorMessage(query.error)}</InfoBanner>;
  if (!query.data?.reviews.length) {
    return (
      <SurfaceCard padding={14} style={{ color: grey500, fontSize: 12.5, lineHeight: "19px" }}>
        지금 작성할 거래 평가가 없어요.
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard as="div" padding={0}>
      {query.data.reviews.map((review, index) => (
        <button
          key={`${review.postId}-${review.reviewee.id}`}
          type="button"
          onClick={() => onOpenPost(review.postId)}
          style={{ width: "100%", minHeight: 66, padding: "11px 13px", border: 0, borderBottom: index < query.data.reviews.length - 1 ? `1px solid ${grey200}` : 0, background: "transparent", display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer" }}
        >
          <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8, display: "grid", placeItems: "center", background: blue50, color: blue600 }}>
            <ClipboardCheck size={17} aria-hidden />
          </span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: grey900, fontSize: 13 }}>{review.postTitle}</strong>
            <span style={{ display: "block", marginTop: 3, color: grey500, fontSize: 11.5 }}>{review.reviewee.nickname} · {getReviewRoleLabel(review.revieweeRole)} 평가</span>
          </span>
          <ChevronRight size={16} color={grey500} aria-hidden />
        </button>
      ))}
    </SurfaceCard>
  );
}
