export const STORAGE_KEYS = {
  TOKEN: "token",
  USER_ID: "userId",
  USER: "user",
  HOME_TUTORIAL_SEEN: "damaraHomeTutorialSeen",
  SHOW_HOME_TUTORIAL_ONCE: "damaraShowHomeTutorialOnce",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
