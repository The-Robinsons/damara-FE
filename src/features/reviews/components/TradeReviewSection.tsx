import { useState } from "react";
import { CheckCircle2, Clock3, GraduationCap, LockKeyhole, PencilLine } from "lucide-react";
import { toast } from "sonner";

import ActionButton from "../../../shared/components/damara/ActionButton";
import InfoBanner from "../../../shared/components/damara/InfoBanner";
import SectionHeader from "../../../shared/components/damara/SectionHeader";
import SurfaceCard from "../../../shared/components/damara/SurfaceCard";
import { blue50, blue600, green600, grey200, grey500, grey700, grey900 } from "../../../shared/constants/homeTheme";
import { useReviewEligibility } from "../hooks/useReviews";
import { getReviewErrorMessage, getReviewRoleLabel, getReviewStatusLabel } from "../model/reviewPresentation";
import type { ReviewTarget } from "../model/reviewTypes";
import ReviewEditorSheet from "./ReviewEditorSheet";

interface TradeReviewSectionProps {
  postId: string;
  userId: string;
  enabled: boolean;
}

export default function TradeReviewSection({ postId, userId, enabled }: TradeReviewSectionProps) {
  const query = useReviewEligibility(postId, userId, enabled);
  const [selectedTarget, setSelectedTarget] = useState<ReviewTarget | null>(null);

  if (!enabled) return null;

  return (
    <SurfaceCard padding={15}>
      <SectionHeader title="거래 평가" action={<GraduationCap size={18} color={blue600} strokeWidth={2.1} />} />
      {query.isLoading ? (
        <div data-skeleton style={{ height: 72, marginTop: 10, borderRadius: 8 }} />
      ) : query.isError ? (
        <InfoBanner tone="danger" style={{ marginTop: 10 }}>{getReviewErrorMessage(query.error)}</InfoBanner>
      ) : query.data?.targets.length ? (
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {query.data.targets.map((target) => (
            <ReviewTargetRow key={target.reviewee.id} target={target} onEdit={() => setSelectedTarget(target)} />
          ))}
        </div>
      ) : (
        <p style={{ margin: "10px 0 0", color: grey500, fontSize: 12.5, lineHeight: "19px" }}>
          현재 평가할 수 있는 거래 상대가 없어요.
        </p>
      )}

      <ReviewEditorSheet
        open={Boolean(selectedTarget)}
        postId={postId}
        userId={userId}
        target={selectedTarget}
        onClose={() => setSelectedTarget(null)}
        onCompleted={() => toast.success(selectedTarget?.status === "pending" ? "평가를 수정했어요." : "평가를 제출했어요.")}
      />
    </SurfaceCard>
  );
}

function ReviewTargetRow({ target, onEdit }: { target: ReviewTarget; onEdit: () => void }) {
  const canCreate = target.status === "not_submitted";
  const canEdit = target.status === "pending" && Boolean(target.reviewId);
  const Icon = canCreate ? PencilLine : target.status === "pending" ? Clock3 : target.status === "published" ? CheckCircle2 : LockKeyhole;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 64, padding: "10px 11px", borderRadius: 8, border: `1px solid ${grey200}`, background: "#fff" }}>
      <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8, display: "grid", placeItems: "center", color: target.status === "published" ? green600 : blue600, background: blue50 }}>
        <Icon size={17} aria-hidden />
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <strong style={{ display: "block", color: grey900, fontSize: 13 }}>{target.reviewee.nickname}</strong>
        <span style={{ display: "block", marginTop: 3, color: grey500, fontSize: 11.5 }}>
          {getReviewRoleLabel(target.revieweeRole)} · {getReviewStatusLabel(target.status)}
        </span>
      </span>
      {canCreate || canEdit ? (
        <ActionButton size="compact" variant={canCreate ? "primary" : "secondary"} onClick={onEdit} style={{ height: 36, padding: "0 12px" }}>
          {canCreate ? "작성" : "수정"}
        </ActionButton>
      ) : (
        <span style={{ color: grey700, fontSize: 11, fontWeight: 800 }}>{target.status === "published" ? "공개됨" : "종료"}</span>
      )}
    </div>
  );
}
