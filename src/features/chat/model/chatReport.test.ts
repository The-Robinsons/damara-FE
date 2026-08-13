import { describe, expect, it } from "vitest";

import { buildChatReportInput, getChatReportErrorMessage } from "./chatReport";

function apiError(status: number) {
  return { isAxiosError: true, response: { status, data: {} } };
}

describe("chat report", () => {
  it("선택하지 않은 필드는 생략하고 상세 내용의 공백을 정리한다", () => {
    expect(buildChatReportInput("reported-user", "ABUSIVE_LANGUAGE", "   ")).toEqual({
      reportedUserId: "reported-user",
      category: "ABUSIVE_LANGUAGE",
    });
    expect(buildChatReportInput("reported-user", null, "  반복적인 욕설  ")).toEqual({
      reportedUserId: "reported-user",
      details: "반복적인 욕설",
    });
  });

  it("상세 내용은 API 최대 길이인 1000자로 제한한다", () => {
    expect(buildChatReportInput("reported-user", null, "가".repeat(1001)).details).toHaveLength(1000);
  });

  it("신고 횟수 제한과 이메일 전송 실패를 구분한다", () => {
    expect(getChatReportErrorMessage(apiError(429))).toContain("잠시 후");
    expect(getChatReportErrorMessage(apiError(502))).toContain("신고 전달에 실패");
  });
});
