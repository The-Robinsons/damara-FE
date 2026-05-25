import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, IdCard, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { loginUser, registerUser } from "../../features/auth/api/authApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { getAuthErrorMessage } from "../../shared/utils/apiError";
import damaraLogo from "../../assets/damara-logo.png";
import {
  background,
  blue500,
  DANGER,
  DANGER_BG,
  grey400,
  grey500,
  grey600,
  grey700,
  grey900,
  red200,
} from "../../shared/constants/homeTheme";

export default function SignupPage() {
  const nav = useNavigate();
  const [nickname, setNickname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const handleRegister = async () => {
    if (!nickname || !studentId || !email || !password || !confirmPassword) {
      setError("필수 항목을 모두 입력해 주세요.");
      return;
    }
    if (!email.includes("@")) {
      setError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await registerUser({
        email,
        passwordHash: password,
        nickname,
        studentId,
      });

      try {
        const loginResponse = await loginUser(studentId, password);
        const userData = loginResponse.data;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.USER_ID, userData.id);
        nav("/home");
      } catch {
        toast.success("회원가입이 완료됐어요. 로그인해 주세요.");
        nav("/login");
      }
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError(getAuthErrorMessage(err, "register"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-page="회원가입" style={pageWrapStyle}>
      <style>{authStyle}</style>
      <main style={screenStyle}>
        <AuthWave />
        <div style={contentStyle}>
          <section className="damara-auth-card" style={cardStyle}>
            <header style={brandHeaderStyle}>
              <div aria-hidden style={brandOrbStyle}>
                <img src={damaraLogo} alt="" style={logoImageStyle} />
              </div>
              <h1 style={brandTextStyle}>DAMARA</h1>
              <p style={brandSubTextStyle}>계정을 만들고 공동구매를 시작해요</p>
            </header>

            {error ? (
              <div role="alert" style={errorStyle}>
                {error}
              </div>
            ) : null}

            <form
              className="damara-auth-form"
              style={formStyle}
              onSubmit={(e) => {
                e.preventDefault();
                void handleRegister();
              }}
              noValidate
            >
              <LineField icon={<User size={17} strokeWidth={1.9} aria-hidden />}>
                <input
                  className="damara-line-input"
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  aria-label="이름"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError("");
                  }}
                  placeholder="이름"
                  style={inputStyle}
                />
              </LineField>

              <LineField icon={<IdCard size={17} strokeWidth={1.9} aria-hidden />}>
                <input
                  className="damara-line-input"
                  id="signup-student-id"
                  type="text"
                  autoComplete="username"
                  aria-label="학번"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setError("");
                  }}
                  placeholder="학번"
                  style={inputStyle}
                />
              </LineField>

              <LineField icon={<Mail size={17} strokeWidth={1.9} aria-hidden />}>
                <input
                  className="damara-line-input"
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  aria-label="학교 이메일"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="학교 이메일"
                  style={inputStyle}
                />
              </LineField>

              <LineField icon={<Lock size={16} strokeWidth={1.9} aria-hidden />}>
                <input
                  className="damara-line-input"
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-label="비밀번호"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="비밀번호"
                  style={inputStyle}
                />
                <EyeButton active={showPassword} onClick={() => setShowPassword((v) => !v)} label="비밀번호" />
              </LineField>

              <LineField icon={<Lock size={16} strokeWidth={1.9} aria-hidden />}>
                <input
                  className="damara-line-input"
                  id="signup-password-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  aria-label="비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="비밀번호 확인"
                  style={inputStyle}
                />
                <EyeButton active={showConfirm} onClick={() => setShowConfirm((v) => !v)} label="비밀번호 확인" />
              </LineField>

              <button type="submit" disabled={isLoading} className="damara-auth-submit" style={submitButtonStyle}>
                {isLoading ? "처리 중..." : "회원가입"}
              </button>
            </form>

            <div style={switchBlockStyle}>
              <span style={switchTextStyle}>이미 계정이 있나요?</span>
              <button type="button" className="damara-auth-plain" onClick={() => nav("/login")} style={switchButtonStyle}>
                로그인
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function AuthWave() {
  return (
    <svg aria-hidden viewBox="0 0 362 188" preserveAspectRatio="none" style={waveStyle}>
      <defs>
        <linearGradient id="damaraSignupWaveA" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6EAEFF" />
          <stop offset="100%" stopColor="#3182F6" />
        </linearGradient>
        <linearGradient id="damaraSignupWaveB" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#D9ECFF" />
          <stop offset="100%" stopColor="#82BBFF" />
        </linearGradient>
      </defs>
      <rect width="362" height="188" fill="url(#damaraSignupWaveA)" />
      <path
        d="M0 50C36 79 65 75 103 46C141 16 172 34 203 77C240 128 276 146 315 121C337 107 350 94 362 82V188H0V50Z"
        fill="url(#damaraSignupWaveB)"
        opacity="0.82"
      />
      <path
        d="M0 147C34 170 72 164 112 126C154 86 199 84 239 119C278 153 318 162 362 143V188H0V147Z"
        fill="#F5F9FF"
      />
      <path d="M72 -24L258 170" stroke="rgba(255,255,255,0.22)" />
      <path d="M214 -30L68 164" stroke="rgba(255,255,255,0.18)" />
    </svg>
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
    <button type="button" onClick={onClick} aria-label={active ? `${label} 숨기기` : `${label} 보기`} className="damara-auth-plain" style={eyeButtonStyle}>
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
  @media (max-height: 760px) {
    .damara-auth-card {
      padding-top: 22px !important;
      padding-bottom: 20px !important;
    }
    .damara-auth-form {
      gap: 10px !important;
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
  height: 188,
  display: "block",
  zIndex: 1,
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  minHeight: "100%",
  padding: "96px 22px 48px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 360,
  padding: "25px 24px 22px",
  borderRadius: 28,
  border: "1px solid rgba(49, 130, 246, 0.12)",
  background: "rgba(255, 255, 255, 0.88)",
  boxShadow: "0 20px 48px rgba(49, 130, 246, 0.13), 0 3px 12px rgba(15, 23, 42, 0.04)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const brandHeaderStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  marginBottom: 18,
};

const brandOrbStyle: React.CSSProperties = {
  width: 68,
  height: 68,
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
  margin: "11px 0 0",
  color: blue500,
  fontFamily: "Montserrat, Pretendard, system-ui, sans-serif",
  fontSize: 25,
  fontWeight: 800,
  lineHeight: "30px",
  letterSpacing: 0,
};

const brandSubTextStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: grey600,
  fontSize: 12,
  fontWeight: 650,
  lineHeight: "18px",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 11,
};

const lineFieldStyle: React.CSSProperties = {
  height: 46,
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

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  height: 49,
  marginTop: 5,
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
  marginTop: 15,
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
  marginBottom: 12,
  borderRadius: 14,
  border: `1px solid ${red200}`,
  background: DANGER_BG,
  padding: "9px 12px",
  color: DANGER,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: "17px",
  textAlign: "center",
};
