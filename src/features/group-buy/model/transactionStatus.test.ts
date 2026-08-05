import { describe, expect, it } from "vitest";

import {
  PARTICIPANT_NEXT_STATUS,
  POST_NEXT_STATUS,
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
    expect(POST_NEXT_STATUS.closed).toBe("in_progress");
    expect(POST_NEXT_STATUS.in_progress).toBe("completed");
  });

  it("거래 완료 차단 사유를 구체적으로 안내한다", () => {
    expect(getTransactionErrorMessage(apiError("RECEIVED_PARTICIPANT_REQUIRED"))).toContain("한 명 이상");
    expect(getTransactionErrorMessage(apiError("OPEN_EXCEPTION_EXISTS", 409))).toContain("해결되지 않은 거래 예외");
  });
});
