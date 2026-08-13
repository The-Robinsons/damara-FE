import axios from "axios";

import type { ApiParticipantStatus, ApiPostStatus } from "../../../shared/api/swaggerTypes";

export const PARTICIPANT_NEXT_STATUS: Partial<Record<ApiParticipantStatus, ApiParticipantStatus>> = {
  participating: "payment_pending",
  payment_pending: "pickup_ready",
  pickup_ready: "received",
};

export const PARTICIPANT_STATUS_LABELS: Record<ApiParticipantStatus, string> = {
  participating: "참여 중",
  payment_pending: "참여 확정",
  pickup_ready: "입금 확인",
  received: "수령 완료",
  cancelled: "참여 취소",
  no_show: "미수령",
};

export const PARTICIPANT_STATUS_STEPS: Record<ApiParticipantStatus, number> = {
  participating: 1,
  payment_pending: 2,
  pickup_ready: 3,
  received: 4,
  cancelled: 0,
  no_show: 4,
};

export const PARTICIPANT_ACTION_LABELS: Partial<Record<ApiParticipantStatus, string>> = {
  payment_pending: "참여 확정하기",
  pickup_ready: "입금 확인하기",
  received: "수령 완료하기",
};

export const POST_NEXT_STATUS: Partial<Record<ApiPostStatus, ApiPostStatus>> = {
  open: "closed",
  closed: "completed",
};

export const POST_STATUS_META: Record<ApiPostStatus, { label: string; step: number; totalSteps: number }> = {
  open: { label: "모집 중", step: 1, totalSteps: 3 },
  closed: { label: "모집 마감", step: 2, totalSteps: 3 },
  completed: { label: "거래 완료", step: 3, totalSteps: 3 },
  cancelled: { label: "거래 취소", step: 0, totalSteps: 3 },
};

export const POST_ACTION_LABELS: Partial<Record<ApiPostStatus, string>> = {
  closed: "모집 마감하기",
  completed: "거래 완료하기",
};

export function getTransactionErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "거래 상태 변경에 실패했어요.";
  const data = error.response?.data as { error?: string; message?: string } | undefined;
  const code = data?.error || data?.message || "";
  const messages: Record<string, string> = {
    INVALID_STATUS_TRANSITION: "현재 단계에서 바로 변경할 수 없는 상태예요.",
    INVALID_PARTICIPANT_STATUS_TRANSITION: "참여 상태는 한 단계씩만 변경할 수 있어요.",
    RECEIPT_MUST_BE_CONFIRMED_BY_PARTICIPANT: "수령 완료는 참여자 본인이 확인해야 해요.",
    PARTICIPANT_PROGRESS_MUST_BE_UPDATED_BY_AUTHOR: "수령 전 진행 단계는 모집자만 변경할 수 있어요.",
    RECEIVED_PARTICIPANT_REQUIRED: "수령 완료한 참여자가 한 명 이상 있어야 거래를 완료할 수 있어요.",
    OPEN_EXCEPTION_EXISTS: "해결되지 않은 거래 예외가 있어요. 먼저 예외를 처리해 주세요.",
  };
  return messages[code] ?? "거래 상태 변경에 실패했어요. 현재 단계를 다시 확인해 주세요.";
}
