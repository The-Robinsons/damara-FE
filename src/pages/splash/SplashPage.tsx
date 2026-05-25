import { useEffect } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";
import damaraLogo from "../../assets/damara-logo.png";
import { background, blue500, grey400, grey600 } from "../../shared/constants/homeTheme";

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      navigate(ROUTES.LOGIN, { replace: true });
    }, 2600);

    return () => {
      window.clearTimeout(timer);
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [navigate]);

  return (
    <div data-page="스플래시" style={pageWrapStyle}>
      <style>
        {`
          @keyframes damara-splash-rise {
            from { opacity: 0; transform: translateY(14px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes damara-splash-pulse {
            0%, 100% { transform: scale(1); opacity: 0.84; }
            50% { transform: scale(1.035); opacity: 1; }
          }
          @keyframes damara-splash-bar {
            from { transform: translateX(-100%); }
            to { transform: translateX(170%); }
          }
        `}
      </style>

      <main style={screenStyle}>
        <AuthWave />
        <section style={contentStyle}>
          <div style={artWrapStyle}>
            <div style={haloStyle} aria-hidden />
            <div style={logoCardStyle}>
              <img src={damaraLogo} alt="DAMARA" style={logoImageStyle} />
            </div>
          </div>

          <div style={brandBlockStyle}>
            <h1 style={brandTextStyle}>DAMARA</h1>
            <p style={taglineStyle}>믿고 함께 사는 우리 학교 공동구매</p>
          </div>

          <div style={progressTrackStyle} aria-hidden>
            <span style={progressBarStyle} />
          </div>
        </section>

        <p style={bottomTextStyle}>명지대 캠퍼스 공동구매 플랫폼</p>
      </main>
    </div>
  );
}

function AuthWave() {
  return (
    <svg aria-hidden viewBox="0 0 362 214" preserveAspectRatio="none" style={waveStyle}>
      <defs>
        <linearGradient id="damaraSplashWaveA" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6EAEFF" />
          <stop offset="100%" stopColor="#3182F6" />
        </linearGradient>
        <linearGradient id="damaraSplashWaveB" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#D9ECFF" />
          <stop offset="100%" stopColor="#82BBFF" />
        </linearGradient>
      </defs>
      <rect width="362" height="214" fill="url(#damaraSplashWaveA)" />
      <path
        d="M0 58C35 86 62 82 99 52C137 22 167 38 199 84C238 140 276 162 316 135C338 120 351 105 362 92V214H0V58Z"
        fill="url(#damaraSplashWaveB)"
        opacity="0.82"
      />
      <path
        d="M0 168C34 191 72 184 112 145C155 103 198 99 240 135C279 169 319 181 362 160V214H0V168Z"
        fill="#F5F9FF"
      />
      <path d="M70 -16L258 192" stroke="rgba(255,255,255,0.22)" />
      <path d="M214 -32L68 182" stroke="rgba(255,255,255,0.18)" />
    </svg>
  );
}

const pageWrapStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  minHeight: "100dvh",
  height: "100dvh",
  overflow: "hidden",
  background: "#F5F9FF",
};

const screenStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100dvh",
  overflow: "hidden",
  background: "#F5F9FF",
};

const waveStyle: React.CSSProperties = {
  position: "absolute",
  inset: "0 0 auto 0",
  width: "100%",
  height: 214,
  display: "block",
  zIndex: 1,
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  height: "100%",
  padding: "192px 42px 84px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  animation: "damara-splash-rise 680ms ease-out both",
};

const artWrapStyle: React.CSSProperties = {
  position: "relative",
  width: 184,
  height: 184,
  display: "grid",
  placeItems: "center",
};

const haloStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 56,
  background: "radial-gradient(circle, rgba(49,130,246,0.20) 0%, rgba(49,130,246,0.08) 48%, rgba(49,130,246,0) 72%)",
  filter: "blur(5px)",
  animation: "damara-splash-pulse 1900ms ease-in-out infinite",
};

const logoCardStyle: React.CSSProperties = {
  position: "relative",
  width: 136,
  height: 136,
  borderRadius: 0,
  overflow: "hidden",
  background: "transparent",
  border: 0,
  boxShadow: "none",
};

const logoImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  transform: "scale(1.28)",
};

const brandBlockStyle: React.CSSProperties = {
  marginTop: 20,
  textAlign: "center",
};

const brandTextStyle: React.CSSProperties = {
  margin: 0,
  color: blue500,
  fontFamily: "Montserrat, Pretendard, system-ui, sans-serif",
  fontSize: 31,
  fontWeight: 800,
  lineHeight: "38px",
  letterSpacing: 0,
};

const taglineStyle: React.CSSProperties = {
  margin: "9px 0 0",
  color: grey600,
  fontSize: 13,
  fontWeight: 650,
  lineHeight: "19px",
  letterSpacing: 0,
};

const progressTrackStyle: React.CSSProperties = {
  position: "relative",
  width: 118,
  height: 4,
  marginTop: 34,
  overflow: "hidden",
  borderRadius: 999,
  background: "rgba(49, 130, 246, 0.13)",
};

const progressBarStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "46%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #6EAEFF 0%, #3182F6 100%)",
  animation: "damara-splash-bar 1450ms ease-in-out infinite",
};

const bottomTextStyle: React.CSSProperties = {
  position: "absolute",
  left: 24,
  right: 24,
  bottom: 30,
  zIndex: 2,
  margin: 0,
  color: grey400,
  textAlign: "center",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "16px",
};
