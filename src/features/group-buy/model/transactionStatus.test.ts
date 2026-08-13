import { describe, expect, it } from "vitest";

import {
  PARTICIPANT_NEXT_STATUS,
  PARTICIPANT_STATUS_LABELS,
  PARTICIPANT_STATUS_STEPS,
  POST_NEXT_STATUS,
  POST_STATUS_META,
  getTransactionErrorMessage,
} from "./transactionStatus";

function apiError(error: string, status = 400) {
  return { isAxiosError: true, response: { status, data: { error } } };
}

describe("transaction status", () => {
  it("참여자와 게시글 상태를 한 단계씩만 전진시킨다", () => {
    expect(PARTICIPANT_NEXT_STATUS.participating).toBe("payment_pending");
    expect(PARTICIPANT_NEXT_STATUS.payment_pending).toBe("pickup_ready");
    expect(PARTICIPANT_NEXT_STATUS.pickup_ready).toBe("received");
    expect(PARTICIPANT_NEXT_STATUS.received).toBeUndefined();
    expect(POST_NEXT_STATUS.open).toBe("closed");
    expect(POST_NEXT_STATUS.closed).toBe("completed");
    expect(POST_NEXT_STATUS.completed).toBeUndefined();
  });

  it("축소된 게시글 단계와 명확한 참여자 단계를 표시한다", () => {
    expect(POST_STATUS_META.closed).toEqual({ label: "모집 마감", step: 2, totalSteps: 3 });
    expect(PARTICIPANT_STATUS_LABELS.payment_pending).toBe("참여 확정");
    expect(PARTICIPANT_STATUS_LABELS.pickup_ready).toBe("입금 확인");
    expect(PARTICIPANT_STATUS_STEPS.received).toBe(4);
  });

  it("거래 완료 차단 사유를 구체적으로 안내한다", () => {
    expect(getTransactionErrorMessage(apiError("RECEIVED_PARTICIPANT_REQUIRED"))).toContain("한 명 이상");
    expect(getTransactionErrorMessage(apiError("OPEN_EXCEPTION_EXISTS", 409))).toContain("해결되지 않은 거래 예외");
  });
});
