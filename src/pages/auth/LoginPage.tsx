import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eye, EyeOff, IdCard, Lock } from "lucide-react";

import { loginUser } from "../../features/auth/api/authApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { getAuthErrorMessage } from "../../shared/utils/apiError";
import damaraLogo from "../../assets/damara-logo.png";
import {
  background,
  blue500,
  blue600,
  DANGER,
  DANGER_BG,
  grey400,
  grey500,
  grey600,
  grey700,
  grey900,
  red200,
} from "../../shared/constants/homeTheme";

export default function LoginPage() {
  const nav = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  const handleLogin = async () => {
    if (!studentId || !password) {
      setError("학번과 비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser(studentId, password);
      const userData = response.data;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.USER_ID, userData.id);
      nav("/home");
    } catch (err) {
      console.error("로그인 실패:", err);
      setError(getAuthErrorMessage(err, "login"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      void handleLogin();
    }
  };

  return (
    <AuthShell pageName="로그인">
      <style>{authStyle}</style>
      <section className="damara-auth-card" style={cardStyle}>
        <BrandHeader subtitle="명지대 공동구매를 안전하게 시작해요" />

        {error ? <AuthError message={error} /> : null}

        <form
          className="damara-auth-form"
          style={formStyle}
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
          noValidate
        >
          <LineField icon={<IdCard size={17} strokeWidth={1.9} aria-hidden />}>
            <input
              className="damara-line-input"
              id="login-student-id"
              type="text"
              autoComplete="username"
              aria-label="학번"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="학번"
              style={inputStyle}
            />
          </LineField>

          <LineField icon={<Lock size={16} strokeWidth={1.9} aria-hidden />}>
            <input
              className="damara-line-input"
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-label="비밀번호"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="비밀번호"
              style={inputStyle}
            />
            <EyeButton active={showPassword} onClick={() => setShowPassword((v) => !v)} label="비밀번호" />
          </LineField>

          <div style={subActionRowStyle}>
            <button type="button" className="damara-auth-plain" onClick={() => setRememberMe((v) => !v)} style={rememberStyle}>
              <span aria-hidden style={{ ...checkBoxStyle, background: rememberMe ? "linear-gradient(135deg, #4593FC, #3182F6)" : "transparent" }}>
                {rememberMe ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              로그인 유지
            </button>
            <button type="button" className="damara-auth-plain" style={linkButtonStyle}>
              비밀번호 찾기
            </button>
          </div>

          <button type="submit" disabled={isLoading} className="damara-auth-submit" style={submitButtonStyle}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div style={switchBlockStyle}>
          <span style={switchTextStyle}>처음 오셨나요?</span>
          <button type="button" className="damara-auth-plain" onClick={() => nav("/register")} style={switchButtonStyle}>
            회원가입
          </button>
        </div>
      </section>
    </AuthShell>
  );
}

function AuthShell({ pageName, children }: { pageName: string; children: React.ReactNode }) {
  return (
    <div data-page={pageName} style={pageWrapStyle}>
      <main style={screenStyle}>
        <AuthWave />
        <div style={contentStyle}>{children}</div>
      </main>
    </div>
  );
}

function AuthWave() {
  return (
    <svg aria-hidden viewBox="0 0 362 202" preserveAspectRatio="none" style={waveStyle}>
      <defs>
        <linearGradient id="damaraAuthWaveA" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6EAEFF" />
          <stop offset="100%" stopColor="#3182F6" />
        </linearGradient>
        <linearGradient id="damaraAuthWaveB" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#D9ECFF" />
          <stop offset="100%" stopColor="#82BBFF" />
        </linearGradient>
      </defs>
      <rect width="362" height="202" fill="url(#damaraAuthWaveA)" />
      <path
        d="M0 54C35 83 62 79 99 50C137 20 169 36 201 80C239 132 276 154 316 130C338 116 351 102 362 90V202H0V54Z"
        fill="url(#damaraAuthWaveB)"
        opacity="0.82"
      />
      <path
        d="M0 158C34 183 72 176 112 137C154 96 199 93 240 128C279 162 319 172 362 151V202H0V158Z"
        fill="#F5F9FF"
      />
      <path d="M72 -20L258 184" stroke="rgba(255,255,255,0.22)" />
      <path d="M214 -30L68 178" stroke="rgba(255,255,255,0.18)" />
    </svg>
  );
}

function BrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <header style={brandHeaderStyle}>
      <div aria-hidden style={brandOrbStyle}>
        <img src={damaraLogo} alt="" style={logoImageStyle} />
      </div>
      <h1 style={brandTextStyle}>DAMARA</h1>
      <p style={brandSubTextStyle}>{subtitle}</p>
    </header>
  );
}

function AuthError({ message }: { message: string }) {
  return (
    <div role="alert" style={errorStyle}>
      {message}
    </div>
  );
}

function LineField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="damara-line-field" style={lineFieldStyle}>
      <span style={fieldIconStyle}>{icon}</span>
      {children}
    </div>
  );
}

function EyeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? `${label} 숨기기` : `${label} 보기`}
      className="damara-auth-plain"
      style={eyeButtonStyle}
    >
      {active ? <EyeOff size={17} strokeWidth={2} aria-hidden /> : <Eye size={17} strokeWidth={2} aria-hidden />}
    </button>
  );
}

const authStyle = `
  .damara-line-input::placeholder {
    color: ${grey500};
    opacity: 0.9;
  }
  .damara-line-field:focus-within {
    border-color: rgba(49, 130, 246, 0.44) !important;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.08);
    background: #fff !important;
  }
  .damara-auth-submit:active:not(:disabled) {
    transform: translateY(1px);
    filter: brightness(0.98);
  }
  .damara-auth-submit:disabled {
    opacity: 0.62;
    cursor: wait;
  }
  .damara-auth-plain:focus-visible,
  .damara-auth-submit:focus-visible {
    outline: 2px solid rgba(49, 130, 246, 0.36);
    outline-offset: 3px;
  }
  @media (max-height: 720px) {
    .damara-auth-card {
      padding-top: 24px !important;
      padding-bottom: 22px !important;
    }
    .damara-auth-form {
      gap: 12px !important;
    }
  }
  @media (max-width: 370px) {
    .damara-auth-card {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
  }
`;

const pageWrapStyle: React.CSSProperties = {
  minHeight: "100dvh",
  height: "100dvh",
  width: "100%",
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
  height: 202,
  display: "block",
  zIndex: 1,
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  minHeight: "100%",
  padding: "126px 22px 54px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 360,
  padding: "30px 24px 24px",
  borderRadius: 28,
  border: "1px solid rgba(49, 130, 246, 0.12)",
  background: "rgba(255, 255, 255, 0.86)",
  boxShadow: "0 20px 48px rgba(49, 130, 246, 0.13), 0 3px 12px rgba(15, 23, 42, 0.04)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const brandHeaderStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  marginBottom: 24,
};

const brandOrbStyle: React.CSSProperties = {
  width: 76,
  height: 76,
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
  transform: "scale(1.34)",
};

const brandTextStyle: React.CSSProperties = {
  margin: "14px 0 0",
  color: blue500,
  fontFamily: "Montserrat, Pretendard, system-ui, sans-serif",
  fontSize: 27,
  fontWeight: 800,
  lineHeight: "32px",
  letterSpacing: 0,
};

const brandSubTextStyle: React.CSSProperties = {
  margin: "7px 0 0",
  color: grey600,
  fontSize: 12,
  fontWeight: 650,
  lineHeight: "18px",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const lineFieldStyle: React.CSSProperties = {
  height: 48,
  padding: "0 13px",
  borderRadius: 15,
  border: "1px solid rgba(49, 130, 246, 0.16)",
  background: "rgba(245, 249, 255, 0.82)",
  display: "flex",
  alignItems: "center",
  gap: 11,
  transition: "160ms ease-out",
};

const fieldIconStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  color: "#6B9FEA",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: "100%",
  border: 0,
  outline: "none",
  background: "transparent",
  color: grey900,
  fontFamily: "Pretendard, Inter, system-ui, sans-serif",
  fontSize: 14,
  fontWeight: 650,
};

const eyeButtonStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  border: 0,
  borderRadius: 10,
  background: "transparent",
  color: "#8CB9F7",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const subActionRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 2,
};

const rememberStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: 0,
  background: "transparent",
  color: grey600,
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
  padding: 0,
};

const checkBoxStyle: React.CSSProperties = {
  width: 17,
  height: 17,
  borderRadius: 5,
  border: "1.4px solid rgba(49, 130, 246, 0.34)",
  display: "grid",
  placeItems: "center",
  color: background,
};

const linkButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: blue500,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  padding: 0,
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  height: 50,
  marginTop: 6,
  border: 0,
  borderRadius: 16,
  color: background,
  background: "linear-gradient(135deg, #4593FC 0%, #3182F6 100%)",
  boxShadow: "0 12px 22px rgba(49, 130, 246, 0.25)",
  fontSize: 15,
  fontWeight: 850,
  cursor: "pointer",
  transition: "transform 0.14s ease, filter 0.14s ease, opacity 0.18s ease",
};

const switchBlockStyle: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const switchTextStyle: React.CSSProperties = {
  color: grey700,
  fontSize: 13,
  fontWeight: 600,
};

const switchButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: blue500,
  fontSize: 13,
  fontWeight: 850,
  padding: 0,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  marginBottom: 14,
  borderRadius: 14,
  border: `1px solid ${red200}`,
  background: DANGER_BG,
  padding: "10px 12px",
  color: DANGER,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: "17px",
  textAlign: "center",
};
