/** 라우터·탭에서 pathname 비교용(끝 슬래시 등 정규화) */
export function normalizeAppPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "");
  }
  return pathname || "/";
}

export const ROUTES = {
  SPLASH: "/",
  LOGIN: "/login",
  SIGNUP: "/register",
  HOME: "/home",
  CHAT: "/chat",
  MYPAGE: "/profile",
  GROUP_BUY_CREATE: "/create",
  GROUP_BUY_DETAIL: "/post/:id",
  MY_CREATED: "/my-posts",
  MY_JOINED: "/participated",
  FAVORITES: "/favorites",
  TRUST_INFO: "/trust-info",
  NOTICE: "/notice",
  SETTINGS: "/settings",
  FAQ: "/faq",
  WITHDRAW: "/withdraw",
  LOGOUT: "/logout",
  CATEGORY: "/category",
} as const;

/** 상단 앱 헤더를 쓰는 경로 (채팅/카테고리는 각 페이지 전용 헤더 사용) */
export const SHOW_APP_CHROME_PATHS: string[] = [
  ROUTES.HOME,
  ROUTES.CATEGORY,
  ROUTES.CHAT,
  ROUTES.MYPAGE,
];

/** 하단 탭 경로 */
export const SHOW_BOTTOM_NAV_PATHS: string[] = [
  ROUTES.HOME,
  ROUTES.CATEGORY,
  ROUTES.CHAT,
  ROUTES.MYPAGE,
];
