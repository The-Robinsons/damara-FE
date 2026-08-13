import { beforeEach, describe, expect, it, vi } from "vitest";

import axiosInstance from "../../../shared/api/axiosInstance";
import { submitChatReport } from "./chatApi";

vi.mock("../../../shared/api/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

const postMock = vi.mocked(axiosInstance.post);

describe("chat report API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("신고 대상과 사유를 현재 사용자 헤더와 함께 전송한다", () => {
    const input = { reportedUserId: "reported-user", category: "ABUSIVE_LANGUAGE" as const };

    submitChatReport("room-id", input, "current-user");

    expect(postMock).toHaveBeenCalledWith("/chat/rooms/room-id/reports", input, {
      headers: { "x-user-id": "current-user" },
    });
  });
});
