/**
 * 앱 시맨틱 색상 — Toss TDS Mobile Colors 기반.
 * 레거시 export 이름(HOME_*)은 유지하여 기존 import 경로를 깨지 않습니다.
 *
 * 전역 진입점: `damaraDesignSystem.ts` — 색·간격·타이포를 한 경로에서 import 할 때 사용.
 * CSS 변수: `shared/styles/damara-theme.css`
 */
import {
  background,
  blue50,
  blue100,
  blue400,
  blue500,
  blue600,
  blue700,
  green50,
  green600,
  grey100,
  grey200,
  grey300,
  grey400,
  grey50,
  grey500,
  grey600,
  grey700,
  grey800,
  grey900,
  greyOpacity100,
  greyOpacity200,
  greyOpacity50,
  greyOpacity500,
  orange50,
  orange500,
  purple50,
  purple500,
  purple600,
  red50,
  red500,
  red600,
  teal50,
  teal600,
  yellow50,
  yellow700,
} from "./tdsMobileColors";

/** 로그인·가입 화면 상단 그라데이션 */
export const AUTH_SCREEN_GRADIENT = `linear-gradient(180deg, ${blue50} 0%, ${blue100} 22%, ${grey100} 48%, ${grey50} 78%, ${background} 100%)`;

/** 그라데이션 하단 폴백 단색 */
export const AUTH_SCREEN_FALLBACK_BG = blue50;

/** 인증 폼 포커스 링 */
export const AUTH_FOCUS_BORDER = "rgba(49, 130, 246, 0.55)";
export const AUTH_FOCUS_RING = "0 0 0 3px rgba(49, 130, 246, 0.12)";

/** 인증 화면 보조 블루 틴트 */
export const AUTH_SOFT_TINT = "rgba(49, 130, 246, 0.12)";
export const AUTH_SOFT_TINT_HOVER = "rgba(49, 130, 246, 0.08)";
export const AUTH_OUTLINE = "rgba(49, 130, 246, 0.45)";

/** 인증 카드 그림자 */
export const AUTH_CARD_SHADOW = `0 10px 32px rgba(49, 130, 246, 0.1), 0 2px 10px ${greyOpacity100}`;
export const AUTH_SECONDARY_CARD_SHADOW = `0 8px 24px rgba(49, 130, 246, 0.08), 0 1px 6px ${greyOpacity100}`;
export const AUTH_SIGNUP_CARD_HOVER_SHADOW = `0 10px 28px rgba(49, 130, 246, 0.12), 0 2px 8px rgba(49, 130, 246, 0.06)`;

export const AUTH_HALO_BLUR = "rgba(232, 243, 255, 0.7)";

/** 아이콘 보조 톤 */
export const AUTH_ICON_DIM = "rgba(49, 130, 246, 0.5)";

/** 페이지 루트 배경 */
export const HOME_CANVAS = "#F6F8FC";

/** 카드·섹션 살짝 띄운 면 */
export const HOME_SURFACE = grey100;

/** 입력·칩 등 컨트롤 면 */
export const HOME_CONTROL = grey100;

/** 보조 메타 텍스트 */
export const HOME_CONTROL_TEXT = grey600;

/** 구분선·약한 border */
export const HOME_BORDER = grey200;

/** 카드/플로팅 면 */
export const APP_HEADER_BG = background;

/** 메인 브랜드 액션 (구 #3D5CFF 계열 → blue500) */
export const BRAND_PRIMARY = blue500;
export const BRAND_PRIMARY_HOVER = blue600;
export const BRAND_PRIMARY_SOFT = blue50;
export const BRAND_PRIMARY_TEXT = blue600;
export const BRAND_GRADIENT_END = blue400;

/** 텍스트 역할 */
export const TEXT_TITLE = grey900;
export const TEXT_BODY = grey700;
export const TEXT_SUB = grey600;
export const TEXT_META = grey500;
export const TEXT_MUTED = grey400;
export const TEXT_PLACEHOLDER = grey400;
export const BORDER_STRONG = grey300;
export const TEXT_STRONG = grey800;

/** 상태·배지 */
export const BADGE_URGENT_BG = orange50;
export const BADGE_URGENT_TEXT = orange500;
export const BADGE_SUCCESS_BG = green50;
export const BADGE_SUCCESS_TEXT = green600;
export const BADGE_INFO_BG = blue50;
export const BADGE_INFO_TEXT = blue600;
export const BADGE_PROMO_BG = yellow50;
export const BADGE_PROMO_TEXT = yellow700;
export const BADGE_TRUST_BG = teal50;
export const BADGE_TRUST_TEXT = teal600;
export const BADGE_SPECIAL_BG = purple50;
export const BADGE_SPECIAL_TEXT = purple600;
export const BADGE_RECOMMEND_BG = purple50;
export const BADGE_RECOMMEND_TEXT = purple500;

/** 위험·에러 */
export const DANGER = red500;
export const DANGER_BG = red50;
export const DANGER_HOVER = red600;

/** 그림자 (Toss grey opacity 기반) */
export const SHADOW_SOFT = `0 2px 10px ${greyOpacity100}`;

/** 브랜드 버튼·플로팅 액션 그림자 */
export const SHADOW_PRIMARY_GLOW = `0 6px 18px rgba(49, 130, 246, 0.28)`;

/** 채팅 미읽음 카드 등 브랜드 톤 그림자 */
export const SHADOW_BRAND_SOFT = `0 6px 24px rgba(49, 130, 246, 0.16), 0 2px 8px ${greyOpacity100}`;
export const SHADOW_CARD = `0 4px 20px ${greyOpacity100}, 0 1px 2px ${greyOpacity50}`;
export const SHADOW_LIFTED = `0 8px 28px ${greyOpacity200}`;

/** 고정 하단 바·입력 영역 위로 올라오는 그림자 */
export const SHADOW_FOOTER_UP = `0 -10px 36px ${greyOpacity100}`;

/** 밝은 글래스 스크림 (썸네일 위 작은 컨트롤) */
export const SCRIM_LIGHT = "rgba(255, 255, 255, 0.65)";

/** 흰색 위에 올리는 반투명 하이라이트 (아이콘 fill 등) */
export const GHOST_ON_SOLID = "rgba(255, 255, 255, 0.25)";

/** 에러·긴급 뱃지용 그림자 */
export const SHADOW_DANGER_SOFT = `0 4px 12px rgba(240, 68, 82, 0.28)`;

/** 모달 딤 */
export const OVERLAY_DIM = greyOpacity500;

/** 팔레트 직접 참조가 필요할 때 */
export * from "./tdsMobileColors";
