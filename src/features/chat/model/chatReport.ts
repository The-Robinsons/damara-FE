import axios from "axios";

export const CHAT_REPORT_CATEGORIES = [
  { value: "COMMERCIAL_SPAM", label: "상업적 광고·스팸" },
  { value: "MANNER", label: "비매너 행동" },
  { value: "ABUSIVE_LANGUAGE", label: "욕설·비방" },
  { value: "SEXUAL_HARASSMENT", label: "성희롱" },
  { value: "TRANSACTION_DISPUTE", label: "거래·환불 분쟁" },
  { value: "FRAUD", label: "사기 의심" },
  { value: "DATING_ATTEMPT", label: "만남·연애 목적 접근" },
  { value: "OTHER", label: "기타" },
] as const;

export type ChatReportCategory = (typeof CHAT_REPORT_CATEGORIES)[number]["value"];

export interface ChatReportTarget {
  userId: string;
  nickname: string;
  avatarUrl?: string | null;
}

export interface ChatReportInput {
  reportedUserId: string;
  category?: ChatReportCategory;
  details?: string;
}

export function buildChatReportInput(
  reportedUserId: string,
  category: ChatReportCategory | null,
  details: string
): ChatReportInput {
  const normalizedDetails = details.trim().slice(0, 1000);
  return {
    reportedUserId,
    ...(category ? { category } : {}),
    ...(normalizedDetails ? { details: normalizedDetails } : {}),
  };
}

export function getChatReportErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "신고 접수에 실패했어요. 다시 시도해 주세요.";
  if (!error.response) return "서버에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.";

  const status = error.response.status;
  if (status === 400) return "신고 대상과 내용을 다시 확인해 주세요. 본인은 신고할 수 없어요.";
  if (status === 401) return "로그인 후 신고할 수 있어요.";
  if (status === 403) return "이 채팅방의 참여자만 신고할 수 있어요.";
  if (status === 404) return "채팅방 또는 신고할 사용자를 찾을 수 없어요.";
  if (status === 429) return "신고 요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  if (status === 502) return "신고 전달에 실패했어요. 잠시 후 다시 시도해 주세요.";
  return "신고 접수에 실패했어요. 다시 시도해 주세요.";
}
