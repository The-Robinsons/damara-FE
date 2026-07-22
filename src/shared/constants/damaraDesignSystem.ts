/**
 * 다마라 디자인 시스템 — 전역 단일 진입점 (색·간격·타이포·시맨틱).
 *
 * - TS/React: `import { BRAND_PRIMARY, UI_PAGE_PAD_X, grey900 } from ".../damaraDesignSystem"`
 * - CSS/마크업: `src/shared/styles/damara-theme.css`의 `var(--damara-*)` (값은 이 모듈과 동기화)
 *
 * 세부 정의 위치:
 * - 원시 팔레트: `tdsMobileColors.ts`
 * - 시맨틱 색·그림자·HOME_*: `homeTheme.ts` (내부에서 팔레트 조합)
 * - Toast API·문구: `damaraToast`, `damaraToastMessages` (`../lib/damaraToast`, Sonner 스타일은 `damara-toast.css`)
 */


export * from "./damaraUISystem";
export * from "./homeTheme";

export { damaraToast, damaraToastMessages } from "../lib/damaraToast";
