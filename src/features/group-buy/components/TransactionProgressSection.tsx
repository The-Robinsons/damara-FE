import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import ActionButton from "../../../shared/components/damara/ActionButton";
import InfoBanner from "../../../shared/components/damara/InfoBanner";
import SectionHeader from "../../../shared/components/damara/SectionHeader";
import SurfaceCard from "../../../shared/components/damara/SurfaceCard";
import type { ApiParticipantStatus, ApiPostStatus } from "../../../shared/api/swaggerTypes";
import { blue50, blue600, grey200, grey500, grey900 } from "../../../shared/constants/homeTheme";
import { updateParticipantStatus, updatePostStatus } from "../api/groupBuyApi";
import {
  PARTICIPANT_NEXT_STATUS,
  PARTICIPANT_STATUS_LABELS,
  POST_NEXT_STATUS,
  getTransactionErrorMessage,
} from "../model/transactionStatus";

interface TransactionParticipant {
  userId?: string;
  nickname?: string;
  participantStatus?: ApiParticipantStatus;
  user?: { nickname?: string };
}

interface TransactionProgressSectionProps {
  postId: string;
  postStatus: ApiPostStatus;
  currentUserId: string;
  isOwner: boolean;
  participants: TransactionParticipant[];
  onPostStatusChanged: (status: ApiPostStatus) => void;
  onParticipantStatusChanged: (userId: string, status: ApiParticipantStatus) => void;
}

const POST_STATUS_LABELS: Record<ApiPostStatus, string> = {
  open: "모집 중",
  closed: "모집 마감",
  in_progress: "거래 진행",
  completed: "거래 완료",
  cancelled: "거래 취소",
};

export default function TransactionProgressSection({
  postId,
  postStatus,
  currentUserId,
  isOwner,
  participants,
  onPostStatusChanged,
  onParticipantStatusChanged,
}: TransactionProgressSectionProps) {
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const nextPostStatus = POST_NEXT_STATUS[postStatus];
  const currentParticipant = participants.find((person) => person.userId === currentUserId);
  const shouldShow = isOwner || Boolean(currentParticipant);

  if (!shouldShow || postStatus === "cancelled") return null;

  const changePostStatus = async () => {
    if (!nextPostStatus || busyKey) return;
    try {
      setBusyKey("post");
      setError("");
      await updatePostStatus(postId, nextPostStatus, currentUserId);
      onPostStatusChanged(nextPostStatus);
      toast.success(`${POST_STATUS_LABELS[nextPostStatus]} 단계로 변경했어요.`);
    } catch (requestError) {
      setError(getTransactionErrorMessage(requestError));
    } finally {
      setBusyKey("");
    }
  };

  const changeParticipantStatus = async (participant: TransactionParticipant, nextStatus: ApiParticipantStatus) => {
    if (!participant.userId || busyKey) return;
    const key = `participant-${participant.userId}`;
    try {
      setBusyKey(key);
      setError("");
      await updateParticipantStatus(postId, participant.userId, nextStatus, currentUserId);
      onParticipantStatusChanged(participant.userId, nextStatus);
      toast.success(`${PARTICIPANT_STATUS_LABELS[nextStatus]} 상태로 변경했어요.`);
    } catch (requestError) {
      setError(getTransactionErrorMessage(requestError));
    } finally {
      setBusyKey("");
    }
  };

  return (
    <SurfaceCard padding={15}>
      <SectionHeader title="거래 진행" action={<CheckCircle2 size={18} color={blue600} aria-hidden />} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10, padding: "10px 11px", borderRadius: 8, background: blue50 }}>
        <span>
          <span style={{ display: "block", color: grey500, fontSize: 11 }}>게시글 상태</span>
          <strong style={{ display: "block", marginTop: 2, color: grey900, fontSize: 13 }}>{POST_STATUS_LABELS[postStatus]}</strong>
        </span>
        {isOwner && nextPostStatus ? (
          <ActionButton size="compact" disabled={Boolean(busyKey)} onClick={() => void changePostStatus()} style={{ height: 36 }}>
            {POST_STATUS_LABELS[nextPostStatus]}
            <ArrowRight size={14} aria-hidden />
          </ActionButton>
        ) : null}
      </div>

      {participants.length ? (
        <div style={{ display: "grid", gap: 7, marginTop: 9 }}>
          {participants.map((participant, index) => {
            const status = participant.participantStatus ?? "participating";
            const nextStatus = PARTICIPANT_NEXT_STATUS[status];
            const isSelf = participant.userId === currentUserId;
            const canAdvance = Boolean(nextStatus && ((isOwner && nextStatus !== "received") || (isSelf && nextStatus === "received")));
            const key = `participant-${participant.userId}`;
            return (
              <div key={participant.userId || index} style={{ minHeight: 52, padding: "8px 10px", border: `1px solid ${grey200}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong style={{ display: "block", color: grey900, fontSize: 12.5 }}>{participant.nickname || participant.user?.nickname || `참여자 ${index + 1}`}{isSelf ? " (나)" : ""}</strong>
                  <span style={{ display: "block", marginTop: 2, color: grey500, fontSize: 11 }}>{PARTICIPANT_STATUS_LABELS[status]}</span>
                </span>
                {canAdvance && nextStatus ? (
                  <ActionButton variant="secondary" size="compact" disabled={Boolean(busyKey)} onClick={() => void changeParticipantStatus(participant, nextStatus)} style={{ height: 34, padding: "0 10px", fontSize: 11.5 }}>
                    {busyKey === key ? "처리 중" : PARTICIPANT_STATUS_LABELS[nextStatus]}
                  </ActionButton>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
      {error ? <InfoBanner tone="danger" style={{ marginTop: 10 }}>{error}</InfoBanner> : null}
    </SurfaceCard>
  );
}
