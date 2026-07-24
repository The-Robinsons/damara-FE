import { lazy, Suspense } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../../shared/components/layout/MobileLayout";
import BottomTabBar from "../../shared/components/layout/BottomTabBar";
import AppHeader from "../../shared/components/layout/AppHeader";
import { Toaster } from "../../shared/components/ui/sonner";
import { APP_HEADER_HEIGHT_PX, APP_TAB_BAR_HEIGHT_PX } from "../../shared/components/layout/appShellConstants";

import { ROUTES, SHOW_APP_CHROME_PATHS, SHOW_BOTTOM_NAV_PATHS, normalizeAppPath } from "./routes";

const SplashPage = lazy(() => import("../../pages/splash/SplashPage"));
const LoginPage = lazy(() => import("../../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../../pages/auth/SignupPage"));
const HomePage = lazy(() => import("../../pages/home/HomePage"));
const ChatListPage = lazy(() => import("../../pages/chat/ChatListPage"));
const MyPage = lazy(() => import("../../pages/mypage/MyPage"));
const GroupBuyCreatePage = lazy(() => import("../../pages/group-buy/GroupBuyCreatePage"));
const GroupBuyDetailPage = lazy(() => import("../../pages/group-buy/GroupBuyDetailPage"));
const MyCreatedGroupBuyPage = lazy(() => import("../../pages/group-buy/MyCreatedGroupBuyPage"));
const MyJoinedGroupBuyPage = lazy(() => import("../../pages/group-buy/MyJoinedGroupBuyPage"));
const FavoriteGroupBuyPage = lazy(() => import("../../pages/group-buy/FavoriteGroupBuyPage"));
const TrustInfoPage = lazy(() => import("../../pages/mypage/TrustInfoPage"));
const NoticePage = lazy(() => import("../../pages/mypage/NoticePage"));
const SettingsPage = lazy(() => import("../../pages/mypage/SettingsPage"));
const FAQPage = lazy(() => import("../../pages/mypage/FAQPage"));
const WithdrawPage = lazy(() => import("../../pages/mypage/WithdrawPage"));
const LogoutPage = lazy(() => import("../../pages/mypage/LogoutPage"));
const CategoryPage = lazy(() => import("../../pages/category/CategoryPage"));

export default function AppRouter() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const pathKey = normalizeAppPath(pathname);
  const showBottomNav = SHOW_BOTTOM_NAV_PATHS.includes(pathKey);
  const showAppChrome = SHOW_APP_CHROME_PATHS.includes(pathKey);

  const contentPaddingTop = showAppChrome
    ? `calc(${APP_HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px))`
    : 0;
  const contentPaddingBottom = showBottomNav
    ? `calc(${APP_TAB_BAR_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`
    : 0;

  return (
    <MobileLayout>
      {showAppChrome && <AppHeader />}
      <div
        className="w-full box-border"
        style={{
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom,
        }}
      >
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path={ROUTES.SPLASH} element={<SplashPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.CATEGORY} element={<CategoryPage />} />
            <Route path={ROUTES.CHAT} element={<ChatListPage />} />
            <Route path={ROUTES.MYPAGE} element={<MyPage />} />
            <Route path={ROUTES.GROUP_BUY_CREATE} element={<GroupBuyCreatePage />} />
            <Route path={ROUTES.GROUP_BUY_DETAIL} element={<GroupBuyDetailPage />} />
            <Route path={ROUTES.MY_CREATED} element={<MyCreatedGroupBuyPage />} />
            <Route path={ROUTES.MY_JOINED} element={<MyJoinedGroupBuyPage />} />
            <Route path={ROUTES.FAVORITES} element={<FavoriteGroupBuyPage />} />
            <Route path={ROUTES.TRUST_INFO} element={<TrustInfoPage />} />
            <Route path={ROUTES.NOTICE} element={<NoticePage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path={ROUTES.FAQ} element={<FAQPage />} />
            <Route path={ROUTES.WITHDRAW} element={<WithdrawPage />} />
            <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
          </Routes>
        </Suspense>
      </div>

      {showBottomNav && <BottomTabBar onCreateClick={() => nav(ROUTES.GROUP_BUY_CREATE)} />}
      <Toaster showBottomTab={showBottomNav} />
    </MobileLayout>
  );
}

function RouteLoadingFallback() {
  return (
    <main role="status" aria-live="polite" aria-label="화면을 불러오는 중" style={{ minHeight: "58dvh", padding: "20px 16px" }}>
      <div data-skeleton style={{ width: "42%", height: 22, borderRadius: 7 }} />
      <div data-skeleton style={{ width: "100%", height: 152, marginTop: 18, borderRadius: 20 }} />
      <div data-skeleton style={{ width: "82%", height: 18, marginTop: 22, borderRadius: 6 }} />
      <div data-skeleton style={{ width: "100%", height: 112, marginTop: 14, borderRadius: 18 }} />
    </main>
  );
}
