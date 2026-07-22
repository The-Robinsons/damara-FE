import { describe, expect, it } from "vitest";

import { normalizeAppPath } from "./routes";

describe("normalizeAppPath", () => {
  it("keeps the root route stable", () => {
    expect(normalizeAppPath("/")).toBe("/");
    expect(normalizeAppPath("")).toBe("/");
  });

  it("removes trailing slashes from nested app paths", () => {
    expect(normalizeAppPath("/home/")).toBe("/home");
    expect(normalizeAppPath("/post/123///")).toBe("/post/123");
  });
});
