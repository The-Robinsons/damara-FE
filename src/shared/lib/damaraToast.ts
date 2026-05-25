import { toast as sonnerToast } from "sonner";

const DEFAULT_DURATION = 2400;

export const damaraToastMessages = {
  favoriteAdded: "관심목록에 담았어요",
  favoriteRemoved: "관심목록에서 제거했어요",
  participateDone: "공동구매에 참여했어요",
  participateCanceled: "참여를 취소했어요",
  validationMissing: "입력하지 않은 정보가 있어요",
  recruitClosed: "이미 모집이 완료된 공구예요",
  chatRoomEntered: "채팅방으로 들어왔어요",
} as const;

export type DamaraToastMessage = (typeof damaraToastMessages)[keyof typeof damaraToastMessages];

function push(message: string, type: "default" | "error" = "default") {
  if (type === "error") {
    return sonnerToast.error(message, { duration: DEFAULT_DURATION });
  }
  return sonnerToast.message(message, { duration: DEFAULT_DURATION });
}

export const damaraToast = {
  show: (message: string) => push(message, "default"),
  error: (message: string) => push(message, "error"),
  messages: damaraToastMessages,
};
