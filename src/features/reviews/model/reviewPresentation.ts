import axios from "axios";

import type { ReviewRating, ReviewRole, ReviewStatus } from "./reviewTypes";

const TAG_LABELS: Record<string, string> = {
  ACCURATE_DESCRIPTION: "설명이 정확해요",
  CLEAR_SETTLEMENT: "정산이 명확해요",
  GOOD_PROGRESS_UPDATES: "진행 상황을 잘 알려줘요",
  FAST_RESPONSE: "응답이 빨라요",
  CLEAR_PICKUP_GUIDE: "수령 안내가 명확해요",
  ON_TIME: "시간 약속을 잘 지켜요",
  WELL_PREPARED: "준비가 꼼꼼해요",
  KIND_COMMUNICATION: "소통이 친절해요",
  INACCURATE_DESCRIPTION: "설명과 달랐어요",
  UNCLEAR_SETTLEMENT: "정산이 불명확해요",
  MISSING_PROGRESS_UPDATES: "진행 안내가 부족해요",
  SLOW_RESPONSE: "응답이 늦어요",
  FREQUENT_SCHEDULE_CHANGES: "일정 변경이 잦아요",
  LATE_FOR_PICKUP: "수령 약속에 늦었어요",
  POOR_PREPARATION: "준비가 미흡해요",
  UNFRIENDLY_COMMUNICATION: "소통이 불편했어요",
  PAYMENT_ON_TIME: "입금이 정확해요",
  EARLY_CHANGE_NOTICE: "변경 사항을 미리 알려줘요",
  SMOOTH_TRANSACTION: "거래가 원활했어요",
  LATE_PAYMENT: "입금이 늦었어요",
  SAME_DAY_CANCELLATION: "당일 취소했어요",
};

export const RATING_OPTIONS: Array<{ value: ReviewRating; label: string }> = [
  { value: "positive", label: "좋았어요" },
  { value: "neutral", label: "보통이에요" },
  { value: "negative", label: "아쉬웠어요" },
];

export function getReviewTagLabel(tag: string) {
  return TAG_LABELS[tag] ?? tag.toLowerCase().replaceAll("_", " ");
}

export function getReviewRoleLabel(role: ReviewRole) {
  return role === "organizer" ? "모집자" : "참여자";
}

export function getReviewStatusLabel(status: ReviewStatus) {
  const labels: Record<ReviewStatus, string> = {
    not_submitted: "평가 작성",
    pending: "제출 완료",
    published: "평가 공개 완료",
    expired: "평가 기간 종료",
    hidden: "평가 비공개",
    disputed: "평가 확인 중",
    invalidated: "평가 무효",
  };
  return labels[status];
}

export function getReviewErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "평가 처리에 실패했어요. 다시 시도해 주세요.";
  if (!error.response) return "서버에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.";
  const data = error.response.data as { error?: string; message?: string } | undefined;
  const code = data?.error || data?.message || "";
  const messages: Record<string, string> = {
    REVIEW_NOT_AVAILABLE: "거래가 완료된 뒤 평가할 수 있어요.",
    REVIEW_NOT_ELIGIBLE: "이 거래의 평가 대상이 아니에요.",
    REVIEW_ALREADY_SUBMITTED: "이미 제출한 평가예요.",
    REVIEW_NOT_FOUND: "평가 정보를 찾을 수 없어요.",
    POST_NOT_FOUND: "게시글을 찾을 수 없어요.",
    VALIDATION_ERROR: "평가 항목을 다시 확인해 주세요.",
  };
  if (messages[code]) return messages[code];
  if (error.response.status === 403) return "평가 권한이 없어요.";
  if (error.response.status === 404) return "평가 정보를 찾을 수 없어요.";
  if (error.response.status === 409) return "평가 상태가 변경됐어요. 새로고침 후 확인해 주세요.";
  return "평가 처리에 실패했어요. 다시 시도해 주세요.";
}
