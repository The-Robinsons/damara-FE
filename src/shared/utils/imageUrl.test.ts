import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getImageUrl } from "./imageUrl";

describe("getImageUrl", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_BASE", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the local placeholder for empty or placeholder values", () => {
    expect(getImageUrl(undefined)).toBe("/placeholder.png");
    expect(getImageUrl("uploads/images/placeholder.png")).toBe("/placeholder.png");
  });

  it("normalizes relative image names to upload URLs", () => {
    expect(getImageUrl("sample.png")).toBe("/uploads/images/sample.png");
  });

  it("upgrades non-local http URLs to https", () => {
    expect(getImageUrl("http://example.com/uploads/images/sample.png")).toBe(
      "https://example.com/uploads/images/sample.png",
    );
  });
});
