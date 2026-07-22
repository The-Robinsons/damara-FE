export type GroupBuyListPost = Record<string, unknown>;

function isRecord(value: unknown): value is GroupBuyListPost {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unwrapPost(value: unknown): GroupBuyListPost | null {
  if (!isRecord(value)) return null;
  return isRecord(value.post) ? value.post : value;
}

function extractPosts(data: unknown, keys: string[]): GroupBuyListPost[] {
  const source = Array.isArray(data)
    ? data
    : isRecord(data)
      ? keys.map((key) => data[key]).find(Array.isArray) ?? []
      : [];

  return source.map(unwrapPost).filter((post): post is GroupBuyListPost => post !== null);
}

export function normalizeFavoritePosts(data: unknown): GroupBuyListPost[] {
  return extractPosts(data, ["posts", "favorites", "data"]);
}

export function normalizeJoinedPosts(data: unknown): GroupBuyListPost[] {
  return extractPosts(data, ["posts", "data"]);
}
