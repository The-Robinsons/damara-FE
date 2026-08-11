import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearFavoriteStatesForTest,
  getFavoriteState,
  setFavoriteState,
  subscribeFavoriteChanges,
  subscribeFavoriteState,
} from "./favoriteState";

afterEach(() => {
  clearFavoriteStatesForTest();
});

describe("favorite state", () => {
  it("같은 게시글을 구독한 화면에 즉시 상태를 전달한다", () => {
    const firstListener = vi.fn();
    const secondListener = vi.fn();
    subscribeFavoriteState("post-1", "user-1", firstListener);
    subscribeFavoriteState("post-1", "user-1", secondListener);

    setFavoriteState("post-1", true, "user-1");

    expect(getFavoriteState("post-1", "user-1")).toBe(true);
    expect(firstListener).toHaveBeenCalledWith(true);
    expect(secondListener).toHaveBeenCalledWith(true);
  });

  it("전역 변경 구독자에는 게시글 ID와 최종 상태를 전달한다", () => {
    const listener = vi.fn();
    subscribeFavoriteChanges("user-1", listener);

    setFavoriteState("post-2", false, "user-1");

    expect(listener).toHaveBeenCalledWith("post-2", false);
  });
});
