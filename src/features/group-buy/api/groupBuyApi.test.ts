import { beforeEach, describe, expect, it, vi } from "vitest";

import axiosInstance from "../../../shared/api/axiosInstance";
import {
  cancelParticipation,
  deletePost,
  participatePost,
  updateParticipantStatus,
  updatePostStatus,
} from "./groupBuyApi";

vi.mock("../../../shared/api/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const postMock = vi.mocked(axiosInstance.post);
const deleteMock = vi.mocked(axiosInstance.delete);
const patchMock = vi.mocked(axiosInstance.patch);

describe("authenticated group buy API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("참여 요청에 사용자 식별 헤더를 포함한다", () => {
    participatePost("post-id", "user-id");

    expect(postMock).toHaveBeenCalledWith(
      "/posts/post-id/participate",
      { userId: "user-id" },
      { headers: { "x-user-id": "user-id" } }
    );
  });

  it("참여 취소 요청에 사용자 식별 헤더를 포함한다", () => {
    cancelParticipation("post-id", "user-id");

    expect(deleteMock).toHaveBeenCalledWith(
      "/posts/post-id/participate/user-id",
      { headers: { "x-user-id": "user-id" } }
    );
  });

  it("게시글 삭제 요청에 작성자 식별 헤더를 포함한다", () => {
    deletePost("post-id", "author-id");

    expect(deleteMock).toHaveBeenCalledWith("/posts/post-id", {
      params: { userId: "author-id" },
      headers: { "x-user-id": "author-id" },
    });
  });

  it("게시글 상태 변경 요청에 작성자 식별 헤더를 포함한다", () => {
    updatePostStatus("post-id", "closed", "author-id");

    expect(patchMock).toHaveBeenCalledWith(
      "/posts/post-id/status",
      { status: "closed" },
      { headers: { "x-user-id": "author-id" } }
    );
  });

  it("참여자 상태 변경 요청에 행위자 식별 헤더를 포함한다", () => {
    updateParticipantStatus("post-id", "participant-id", "payment_pending", "author-id");

    expect(patchMock).toHaveBeenCalledWith(
      "/posts/post-id/participants/participant-id/status",
      { participantStatus: "payment_pending" },
      { headers: { "x-user-id": "author-id" } }
    );
  });
});
