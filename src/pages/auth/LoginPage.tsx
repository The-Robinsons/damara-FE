import { useEffect, useState } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eye, EyeOff, IdCard, Lock } from "lucide-react";

import damaraLogo from "../../assets/damara-mark.png";
import { loginUser } from "../../features/auth/api/authApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { getAuthErrorMessage } from "../../shared/utils/apiError";

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
      localStorage.removeItem(STORAGE_KEYS.HOME_TUTORIAL_SEEN);
      sessionStorage.setItem(STORAGE_KEYS.SHOW_HOME_TUTORIAL_ONCE, "true");
      nav("/home");
    } catch (err) {
      console.error("로그인 실패:", err);
      setError(getAuthErrorMessage(err, "login"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-page="로그인" style={pageStyle}>
      <style>{authStyle}</style>

      <main style={mainStyle}>
        <section className="damara-login-content" style={contentStyle}>
          <header className="damara-login-brand" style={brandStyle}>
            <img src={damaraLogo} alt="다마라" style={logoStyle} />
            <h1 style={titleStyle}>DAMARA</h1>
            <p style={subtitleStyle}>같이 사고, 더 가볍게</p>
          </header>

          {error ? (
            <div role="alert" style={errorStyle}>
              {error}
            </div>
          ) : null}

          <form
            style={formStyle}
            onSubmit={(event) => {
              event.preventDefault();
              void handleLogin();
            }}
            noValidate
          >
            <LineField icon={<IdCard size={19} strokeWidth={2} aria-hidden />}>
              <input
                className="damara-login-input"
                type="text"
                autoComplete="username"
                aria-label="학번"
                value={studentId}
                onChange={(event) => {
                  setStudentId(event.target.value);
                  setError("");
                }}
                placeholder="학번"
                style={inputStyle}
              />
            </LineField>

            <LineField icon={<Lock size={18} strokeWidth={2} aria-hidden />}>
              <input
                className="damara-login-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-label="비밀번호"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="비밀번호"
                style={inputStyle}
              />
              <button
                type="button"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="damara-login-plain"
                onClick={() => setShowPassword((value) => !value)}
                style={eyeButtonStyle}
              >
                {showPassword ? <EyeOff size={19} strokeWidth={2} aria-hidden /> : <Eye size={19} strokeWidth={2} aria-hidden />}
              </button>
            </LineField>

            <div style={actionRowStyle}>
              <button
                type="button"
                className="damara-login-plain"
                onClick={() => setRememberMe((value) => !value)}
                style={rememberStyle}
              >
                <span
                  aria-hidden
                  style={{
                    ...checkboxStyle,
                    background: rememberMe ? "linear-gradient(135deg, #4688FF, #2866F1)" : "rgba(255, 255, 255, 0.46)",
                  }}
                >
                  {rememberMe ? <Check size={13} strokeWidth={3} /> : null}
                </span>
                로그인 유지
              </button>

              <button type="button" className="damara-login-plain" style={linkStyle}>
                비밀번호 찾기
              </button>
            </div>

            <button type="submit" disabled={isLoading} className="damara-login-submit" style={submitStyle}>
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div style={signupStyle}>
            <span>아직 계정이 없나요?</span>
            <button type="button" className="damara-login-plain" onClick={() => nav("/register")} style={signupButtonStyle}>
              회원가입
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function LineField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="damara-login-field" style={fieldStyle}>
      <span style={fieldIconStyle}>{icon}</span>
      {children}
    </div>
  );
}

const authStyle = `
  .damara-login-input::placeholder {
    color: #98A1B2;
    opacity: 0.92;
  }
  .damara-login-field:focus-within {
    border-color: rgba(57, 116, 244, 0.5) !important;
    box-shadow: 0 0 0 4px rgba(57, 116, 244, 0.08);
    background: rgba(255, 255, 255, 0.86) !important;
  }
  .damara-login-submit:active:not(:disabled) {
    transform: translateY(1px);
    filter: brightness(0.98);
  }
  .damara-login-submit:disabled {
    cursor: wait;
    opacity: 0.62;
  }
  .damara-login-plain:focus-visible,
  .damara-login-submit:focus-visible {
    outline: 2px solid rgba(57, 116, 244, 0.42);
    outline-offset: 3px;
  }
  @media (max-height: 700px) {
    .damara-login-content {
      padding-top: 40px !important;
      padding-bottom: 30px !important;
    }
    .damara-login-brand {
      margin-bottom: 30px !important;
    }
  }
`;

const pageStyle: React.CSSProperties = {
  width: "100%",
  height: "100dvh",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 50% 8%, rgba(210, 226, 255, 0.78) 0%, transparent 42%), linear-gradient(148deg, #F8FAFF 0%, #F2F6FF 52%, #FFFFFF 100%)",
};

const mainStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
};

const contentStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 430,
  boxSizing: "border-box",
  padding: "64px 30px 38px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 46,
  textAlign: "center",
};

const logoStyle: React.CSSProperties = {
  width: 98,
  height: 98,
  objectFit: "contain",
  display: "block",
};

const titleStyle: React.CSSProperties = {
  margin: "17px 0 0",
  color: "#3168DC",
  fontFamily: "Montserrat, Pretendard, system-ui, sans-serif",
  fontSize: 35,
  fontWeight: 850,
  lineHeight: "41px",
  letterSpacing: "0.04em",
};

const subtitleStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#697489",
  fontSize: 14,
  fontWeight: 680,
  lineHeight: "21px",
  letterSpacing: "-0.03em",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 15,
};

const fieldStyle: React.CSSProperties = {
  height: 58,
  padding: "0 16px",
  borderRadius: 17,
  border: "1px solid rgba(70, 111, 197, 0.18)",
  background: "rgba(247, 250, 255, 0.64)",
  display: "flex",
  alignItems: "center",
  gap: 13,
  transition: "160ms ease-out",
};

const fieldIconStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  color: "#6793F1",
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
  color: "#1E293B",
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
  color: "#6B96EF",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "0 2px",
};

const rememberStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: 0,
  border: 0,
  background: "transparent",
  color: "#677388",
  fontSize: 13,
  fontWeight: 650,
  cursor: "pointer",
};

const checkboxStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 6,
  border: "1.4px solid rgba(83, 119, 190, 0.4)",
  color: "#FFFFFF",
  display: "grid",
  placeItems: "center",
};

const linkStyle: React.CSSProperties = {
  padding: 0,
  border: 0,
  background: "transparent",
  color: "#2D6DEE",
  fontSize: 13,
  fontWeight: 760,
  cursor: "pointer",
};

const submitStyle: React.CSSProperties = {
  width: "100%",
  height: 54,
  marginTop: 7,
  border: 0,
  borderRadius: 17,
  color: "#FFFFFF",
  background: "linear-gradient(135deg, #3577F4 0%, #2461E9 100%)",
  boxShadow: "0 15px 28px rgba(43, 103, 232, 0.24)",
  fontSize: 16,
  fontWeight: 850,
  cursor: "pointer",
  transition: "transform 140ms ease, filter 140ms ease, opacity 180ms ease",
};

const signupStyle: React.CSSProperties = {
  marginTop: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  color: "#657084",
  fontSize: 13,
  fontWeight: 620,
};

const signupButtonStyle: React.CSSProperties = {
  padding: 0,
  border: 0,
  background: "transparent",
  color: "#2D6DEE",
  fontSize: 13,
  fontWeight: 850,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  margin: "-32px 0 16px",
  padding: "11px 13px",
  borderRadius: 13,
  border: "1px solid rgba(239, 68, 68, 0.24)",
  background: "rgba(254, 242, 242, 0.86)",
  color: "#DC2626",
  fontSize: 13,
  fontWeight: 650,
  lineHeight: "18px",
  textAlign: "center",
};
