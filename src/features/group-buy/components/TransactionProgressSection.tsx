import { ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import ActionButton from "../../../shared/components/damara/ActionButton";
import InfoBanner from "../../../shared/components/damara/InfoBanner";
import SectionHeader from "../../../shared/components/damara/SectionHeader";
import SurfaceCard from "../../../shared/components/damara/SurfaceCard";
import type { ApiParticipantNextActor, ApiParticipantStatus, ApiPostStatus } from "../../../shared/api/swaggerTypes";
import { blue50, blue600, green600, grey100, grey200, grey400, grey500, grey700, grey900 } from "../../../shared/constants/homeTheme";
import { updateParticipantStatus, updatePostStatus } from "../api/groupBuyApi";
import {
  PARTICIPANT_ACTION_LABELS,
  PARTICIPANT_NEXT_STATUS,
  PARTICIPANT_STATUS_LABELS,
  PARTICIPANT_STATUS_STEPS,
  POST_ACTION_LABELS,
  POST_NEXT_STATUS,
  POST_STATUS_META,
  getTransactionErrorMessage,
} from "../model/transactionStatus";

interface TransactionParticipant {
  userId?: string;
  nickname?: string;
  participantStatus?: ApiParticipantStatus;
  participantStatusLabel?: string;
  participantStatusStep?: number;
  participantStatusTotalSteps?: number;
  nextStatus?: ApiParticipantStatus | null;
  nextActionLabel?: string | null;
  nextActionActor?: ApiParticipantNextActor | null;
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

const POST_STATUS_SEQUENCE: ApiPostStatus[] = ["open", "closed", "completed"];

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
  const postMeta = POST_STATUS_META[postStatus] ?? POST_STATUS_META.closed;
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
      toast.success(`${POST_STATUS_META[nextPostStatus].label} 단계로 변경했어요.`);
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
      <SectionHeader title="거래 단계" action={<CheckCircle2 size={18} color={blue600} aria-hidden />} />

      <InfoBanner style={{ marginTop: 10, display: "flex", alignItems: "flex-start", gap: 9 }}>
        <Lightbulb size={17} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
        <span>
          <strong style={{ display: "block", color: grey900 }}>게시글과 참여자 단계는 따로 움직여요.</strong>
          <span style={{ display: "block", marginTop: 3, color: grey700, fontWeight: 600 }}>
            {isOwner
              ? "게시글은 전체 모집 상태를, 참여자 단계는 각 사람의 입금과 수령 상태를 나타내요. 참여 확정과 입금 확인은 모집자가 처리해 주세요."
              : "모집자가 참여 확정과 입금 확인을 처리해요. 물건을 받은 뒤 수령 완료는 본인이 직접 확인해 주세요."}
          </span>
        </span>
      </InfoBanner>

      <div style={{ marginTop: 12, padding: "12px", borderRadius: 8, border: `1px solid ${grey200}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span>
            <span style={{ display: "block", color: grey500, fontSize: 11 }}>게시글 전체 단계 · {postMeta.step || "-"}/{postMeta.totalSteps}</span>
            <strong style={{ display: "block", marginTop: 3, color: grey900, fontSize: 14 }}>{postMeta.label}</strong>
          </span>
          {isOwner && nextPostStatus ? (
            <ActionButton size="compact" disabled={Boolean(busyKey)} onClick={() => void changePostStatus()} style={{ height: 36 }}>
              {POST_ACTION_LABELS[nextPostStatus] ?? POST_STATUS_META[nextPostStatus].label}
              <ArrowRight size={14} aria-hidden />
            </ActionButton>
          ) : null}
        </div>

        <div aria-label="게시글 진행 단계" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginTop: 12 }}>
          {POST_STATUS_SEQUENCE.map((status) => {
            const meta = POST_STATUS_META[status];
            const reached = postMeta.step >= meta.step;
            const current = postStatus === status;
            return (
              <span key={status} style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 5, color: current ? blue600 : reached ? green600 : grey400, fontSize: 10.5, fontWeight: current ? 850 : 700 }}>
                <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: current ? blue600 : reached ? "#e8f8ef" : grey100, color: current ? "#fff" : "inherit", fontSize: 10, fontWeight: 900 }}>{meta.step}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      {participants.length ? (
        <div style={{ display: "grid", gap: 7, marginTop: 14 }}>
          <div>
            <strong style={{ display: "block", color: grey900, fontSize: 13 }}>참여자별 단계</strong>
            <span style={{ display: "block", marginTop: 3, color: grey500, fontSize: 11 }}>각 참여자의 단계는 서로 독립적으로 변경돼요.</span>
          </div>
          {participants.map((participant, index) => {
            const status = participant.participantStatus ?? "participating";
            const nextStatus = participant.nextStatus ?? PARTICIPANT_NEXT_STATUS[status];
            const nextActor = participant.nextActionActor ?? (nextStatus === "received" ? "participant" : "organizer");
            const isSelf = participant.userId === currentUserId;
            const canAdvance = Boolean(nextStatus && ((isOwner && nextActor === "organizer") || (isSelf && nextActor === "participant")));
            const key = `participant-${participant.userId}`;
            const step = participant.participantStatusStep ?? PARTICIPANT_STATUS_STEPS[status];
            const totalSteps = participant.participantStatusTotalSteps ?? 4;
            const statusLabel = participant.participantStatusLabel ?? PARTICIPANT_STATUS_LABELS[status];
            const nextActionLabel = nextStatus ? participant.nextActionLabel ?? PARTICIPANT_ACTION_LABELS[nextStatus] ?? PARTICIPANT_STATUS_LABELS[nextStatus] : null;
            return (
              <div key={participant.userId || index} style={{ minHeight: 52, padding: "8px 10px", border: `1px solid ${grey200}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 9 }}>
                <span aria-label={`${step}단계`} style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, display: "grid", placeItems: "center", background: blue50, color: blue600, fontSize: 12, fontWeight: 900 }}>{step}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong style={{ display: "block", color: grey900, fontSize: 12.5 }}>{participant.nickname || participant.user?.nickname || `참여자 ${index + 1}`}{isSelf ? " (나)" : ""}</strong>
                  <span style={{ display: "block", marginTop: 2, color: grey500, fontSize: 11 }}>{statusLabel} · {step}/{totalSteps}</span>
                </span>
                {canAdvance && nextStatus && nextActionLabel ? (
                  <ActionButton variant="secondary" size="compact" disabled={Boolean(busyKey)} onClick={() => void changeParticipantStatus(participant, nextStatus)} style={{ height: 34, padding: "0 10px", fontSize: 11.5 }}>
                    {busyKey === key ? "처리 중" : nextActionLabel}
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
