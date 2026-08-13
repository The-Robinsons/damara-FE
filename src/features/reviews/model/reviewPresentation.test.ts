import { describe, expect, it } from "vitest";

import {
  getReviewErrorMessage,
  getReviewRoleLabel,
  getReviewStatusLabel,
  getReviewTagLabel,
} from "./reviewPresentation";

function apiError(error: string, status = 400) {
  return { isAxiosError: true, response: { status, data: { error } } };
}

describe("review presentation", () => {
  it("평가 태그와 역할을 한글로 표시한다", () => {
    expect(getReviewTagLabel("ON_TIME")).toBe("시간 약속을 잘 지켜요");
    expect(getReviewRoleLabel("organizer")).toBe("모집자");
    expect(getReviewRoleLabel("participant")).toBe("참여자");
  });

  it("평가 상태별 문구를 구분한다", () => {
    expect(getReviewStatusLabel("not_submitted")).toBe("평가 작성");
    expect(getReviewStatusLabel("pending")).toBe("제출 완료");
    expect(getReviewStatusLabel("published")).toBe("평가 공개 완료");
    expect(getReviewStatusLabel("expired")).toBe("평가 기간 종료");
  });

  it("평가 API 오류를 사용자 문구로 변환한다", () => {
    expect(getReviewErrorMessage(apiError("REVIEW_NOT_ELIGIBLE", 403))).toBe("이 거래의 평가 대상이 아니에요.");
  });
});
