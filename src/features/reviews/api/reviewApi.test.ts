import { beforeEach, describe, expect, it, vi } from "vitest";

import axiosInstance from "../../../shared/api/axiosInstance";
import {
  createReview,
  getPendingReviews,
  getReviewEligibility,
  updateReview,
} from "./reviewApi";

vi.mock("../../../shared/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const getMock = vi.mocked(axiosInstance.get);
const postMock = vi.mocked(axiosInstance.post);
const putMock = vi.mocked(axiosInstance.put);
const headers = { headers: { "X-User-Id": "user-id" } };

describe("authenticated review API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("평가 가능 여부 조회에 사용자 식별 헤더를 포함한다", () => {
    getReviewEligibility("post-id", "user-id");
    expect(getMock).toHaveBeenCalledWith("/posts/post-id/reviews/eligibility", headers);
  });

  it("평가 작성 요청에 사용자 식별 헤더를 포함한다", () => {
    const input = { revieweeId: "reviewee-id", rating: "neutral" as const, tags: [] };
    createReview("post-id", input, "user-id");
    expect(postMock).toHaveBeenCalledWith("/posts/post-id/reviews", input, headers);
  });

  it("평가 수정 요청에 사용자 식별 헤더를 포함한다", () => {
    const input = { rating: "neutral" as const, tags: [] };
    updateReview("review-id", input, "user-id");
    expect(putMock).toHaveBeenCalledWith("/reviews/review-id", input, headers);
  });

  it("평가 대기 목록 조회에 사용자 식별 헤더를 포함한다", () => {
    getPendingReviews("user-id");
    expect(getMock).toHaveBeenCalledWith("/users/me/pending-reviews", headers);
  });
});
