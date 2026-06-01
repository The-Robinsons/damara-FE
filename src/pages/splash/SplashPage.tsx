import { useEffect } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";
import damaraMark from "../../assets/damara-mark.png";

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
    }, 3400);

    return () => {
      window.clearTimeout(timer);
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [navigate]);

  return (
    <div data-page="스플래시" style={pageStyle}>
      <style>{splashStyle}</style>

      <div className="damara-splash-soft-light" aria-hidden />
      <div className="damara-splash-wave damara-splash-wave-back" aria-hidden />
      <div className="damara-splash-wave damara-splash-wave-front" aria-hidden />

      <main style={mainStyle}>
        <section style={brandStyle}>
          <div className="damara-splash-mark-wrap" style={markWrapStyle}>
            <div className="damara-splash-mark-glow" aria-hidden />
            <img className="damara-splash-mark" src={damaraMark} alt="다마라" style={markStyle} />
          </div>

          <div className="damara-splash-copy" style={copyStyle}>
            <p style={eyebrowStyle}>CAMPUS COMMUNITY</p>
            <h1 style={titleStyle}>DAMARA</h1>
            <p style={taglineStyle}>함께 사서, 더 가볍게</p>
          </div>
        </section>

        <p className="damara-splash-footer" style={footerStyle}>
          명지대 공동구매 커뮤니티
        </p>
      </main>
    </div>
  );
}

const splashStyle = `
  @keyframes damara-mark-enter {
    0% { opacity: 0; transform: translateY(20px) scale(0.86); filter: blur(8px); }
    70% { opacity: 1; transform: translateY(-3px) scale(1.025); filter: blur(0); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }
  @keyframes damara-mark-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  @keyframes damara-copy-enter {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes damara-wave-enter {
    from { opacity: 0; transform: translateY(36px) rotate(-10deg); }
    to { opacity: 1; transform: translateY(0) rotate(-10deg); }
  }
  @keyframes damara-glow-breathe {
    0%, 100% { opacity: 0.36; transform: scale(0.92); }
    50% { opacity: 0.64; transform: scale(1.08); }
  }
  .damara-splash-mark-wrap {
    animation: damara-mark-enter 880ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .damara-splash-mark {
    animation: damara-mark-float 3000ms 950ms ease-in-out infinite;
  }
  .damara-splash-copy {
    animation: damara-copy-enter 680ms 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .damara-splash-footer {
    animation: damara-copy-enter 680ms 660ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .damara-splash-mark-glow {
    position: absolute;
    inset: 14%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(64, 126, 245, 0.2) 0%, rgba(118, 170, 255, 0.08) 54%, transparent 76%);
    filter: blur(22px);
    animation: damara-glow-breathe 2600ms ease-in-out infinite;
  }
  .damara-splash-soft-light {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.38) 36%, transparent 68%),
      radial-gradient(circle at 46% 12%, rgba(217, 231, 255, 0.7) 0%, transparent 42%);
  }
  .damara-splash-wave {
    position: absolute;
    width: 138%;
    height: 27%;
    left: -19%;
    bottom: -15%;
    border-radius: 50% 50% 0 0;
    transform: rotate(-10deg);
    animation: damara-wave-enter 960ms 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .damara-splash-wave-back {
    bottom: -8%;
    background: rgba(207, 224, 255, 0.38);
  }
  .damara-splash-wave-front {
    left: -8%;
    bottom: -17%;
    background: rgba(234, 242, 255, 0.82);
    animation-delay: 340ms;
  }
  @media (prefers-reduced-motion: reduce) {
    .damara-splash-mark-wrap,
    .damara-splash-mark,
    .damara-splash-copy,
    .damara-splash-footer,
    .damara-splash-mark-glow,
    .damara-splash-wave {
      animation: none !important;
    }
  }
`;

const pageStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100dvh",
  overflow: "hidden",
  background: "linear-gradient(145deg, #F7FAFF 0%, #EEF4FF 48%, #E5EEFF 100%)",
};

const mainStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  transform: "translateY(-12px)",
};

const markWrapStyle: React.CSSProperties = {
  position: "relative",
  width: 164,
  height: 164,
  display: "grid",
  placeItems: "center",
};

const markStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};

const copyStyle: React.CSSProperties = {
  marginTop: 22,
  textAlign: "center",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#8DAFE7",
  fontFamily: "Montserrat, Pretendard, system-ui, sans-serif",
  fontSize: 9,
  fontWeight: 800,
  lineHeight: "13px",
  letterSpacing: "0.22em",
};

const titleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#2D5CC8",
  fontFamily: "Montserrat, Pretendard, system-ui, sans-serif",
  fontSize: 34,
  fontWeight: 850,
  lineHeight: "40px",
  letterSpacing: "0.045em",
};

const taglineStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#5680D2",
  fontSize: 14,
  fontWeight: 750,
  lineHeight: "20px",
  letterSpacing: "-0.015em",
};

const footerStyle: React.CSSProperties = {
  position: "absolute",
  left: 24,
  right: 24,
  bottom: "calc(31px + env(safe-area-inset-bottom, 0px))",
  margin: 0,
  color: "#7797CC",
  textAlign: "center",
  fontSize: 10,
  fontWeight: 700,
  lineHeight: "15px",
  letterSpacing: "0.045em",
};
