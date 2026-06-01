import { useEffect, useState } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, IdCard, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

import damaraLogo from "../../assets/damara-mark.png";
import { loginUser, registerUser } from "../../features/auth/api/authApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { getAuthErrorMessage } from "../../shared/utils/apiError";

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
        toast.success("회원가입이 완료되었어요. 로그인해 주세요.");
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
    <div data-page="회원가입" style={pageStyle}>
      <style>{authStyle}</style>

      <main style={mainStyle}>
        <section className="damara-signup-content" style={contentStyle}>
          <header className="damara-signup-brand" style={brandStyle}>
            <img src={damaraLogo} alt="다마라" style={logoStyle} />
            <h1 style={titleStyle}>DAMARA</h1>
            <p style={subtitleStyle}>계정을 만들고 공동구매를 시작해요</p>
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
              void handleRegister();
            }}
            noValidate
          >
            <LineField icon={<User size={17} strokeWidth={2} aria-hidden />}>
              <input className="damara-signup-input" type="text" autoComplete="name" aria-label="닉네임" value={nickname} onChange={(event) => updateValue(event, setNickname)} placeholder="닉네임" style={inputStyle} />
            </LineField>

            <LineField icon={<IdCard size={17} strokeWidth={2} aria-hidden />}>
              <input className="damara-signup-input" type="text" autoComplete="username" aria-label="학번" value={studentId} onChange={(event) => updateValue(event, setStudentId)} placeholder="학번" style={inputStyle} />
            </LineField>

            <LineField icon={<Mail size={17} strokeWidth={2} aria-hidden />}>
              <input className="damara-signup-input" type="email" autoComplete="email" aria-label="학교 이메일" value={email} onChange={(event) => updateValue(event, setEmail)} placeholder="학교 이메일" style={inputStyle} />
            </LineField>

            <LineField icon={<Lock size={17} strokeWidth={2} aria-hidden />}>
              <input className="damara-signup-input" type={showPassword ? "text" : "password"} autoComplete="new-password" aria-label="비밀번호" value={password} onChange={(event) => updateValue(event, setPassword)} placeholder="비밀번호" style={inputStyle} />
              <EyeButton active={showPassword} onClick={() => setShowPassword((value) => !value)} label="비밀번호" />
            </LineField>

            <LineField icon={<Lock size={17} strokeWidth={2} aria-hidden />}>
              <input className="damara-signup-input" type={showConfirm ? "text" : "password"} autoComplete="new-password" aria-label="비밀번호 확인" value={confirmPassword} onChange={(event) => updateValue(event, setConfirmPassword)} placeholder="비밀번호 확인" style={inputStyle} />
              <EyeButton active={showConfirm} onClick={() => setShowConfirm((value) => !value)} label="비밀번호 확인" />
            </LineField>

            <button type="submit" disabled={isLoading} className="damara-signup-submit" style={submitStyle}>
              {isLoading ? "처리 중..." : "회원가입"}
            </button>
          </form>

          <div style={loginLinkRowStyle}>
            <span>이미 계정이 있나요?</span>
            <button type="button" className="damara-signup-plain" onClick={() => nav("/login")} style={loginLinkStyle}>
              로그인
            </button>
          </div>
        </section>
      </main>
    </div>
  );

  function updateValue(event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) {
    setter(event.target.value);
    setError("");
  }
}

function LineField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="damara-signup-field" style={fieldStyle}>
      <span style={fieldIconStyle}>{icon}</span>
      {children}
    </div>
  );
}

function EyeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={active ? `${label} 숨기기` : `${label} 보기`} className="damara-signup-plain" style={eyeButtonStyle}>
      {active ? <EyeOff size={18} strokeWidth={2} aria-hidden /> : <Eye size={18} strokeWidth={2} aria-hidden />}
    </button>
  );
}

const authStyle = `
  .damara-signup-input::placeholder {
    color: #98A1B2;
    opacity: 0.92;
  }
  .damara-signup-field:focus-within {
    border-color: rgba(57, 116, 244, 0.5) !important;
    box-shadow: 0 0 0 4px rgba(57, 116, 244, 0.08);
    background: rgba(255, 255, 255, 0.86) !important;
  }
  .damara-signup-submit:active:not(:disabled) {
    transform: translateY(1px);
    filter: brightness(0.98);
  }
  .damara-signup-submit:disabled {
    cursor: wait;
    opacity: 0.62;
  }
  .damara-signup-plain:focus-visible,
  .damara-signup-submit:focus-visible {
    outline: 2px solid rgba(57, 116, 244, 0.42);
    outline-offset: 3px;
  }
  @media (max-height: 700px) {
    .damara-signup-content {
      padding-top: 24px !important;
      padding-bottom: 22px !important;
    }
    .damara-signup-brand {
      margin-bottom: 20px !important;
    }
  }
`;

const pageStyle: React.CSSProperties = {
  width: "100%",
  height: "100dvh",
  overflow: "hidden",
  background: "radial-gradient(circle at 50% 8%, rgba(210, 226, 255, 0.78) 0%, transparent 42%), linear-gradient(148deg, #F8FAFF 0%, #F2F6FF 52%, #FFFFFF 100%)",
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
  padding: "34px 30px 30px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 26,
  textAlign: "center",
};

const logoStyle: React.CSSProperties = {
  width: 74,
  height: 74,
  objectFit: "contain",
  display: "block",
};

const titleStyle: React.CSSProperties = {
  margin: "11px 0 0",
  color: "#3168DC",
  fontFamily: "Montserrat, Pretendard, system-ui, sans-serif",
  fontSize: 29,
  fontWeight: 850,
  lineHeight: "34px",
  letterSpacing: "0.04em",
};

const subtitleStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#697489",
  fontSize: 13,
  fontWeight: 680,
  lineHeight: "19px",
  letterSpacing: "-0.03em",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 11,
};

const fieldStyle: React.CSSProperties = {
  height: 52,
  padding: "0 15px",
  borderRadius: 16,
  border: "1px solid rgba(70, 111, 197, 0.18)",
  background: "rgba(247, 250, 255, 0.64)",
  display: "flex",
  alignItems: "center",
  gap: 12,
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

const submitStyle: React.CSSProperties = {
  width: "100%",
  height: 54,
  marginTop: 6,
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

const loginLinkRowStyle: React.CSSProperties = {
  marginTop: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  color: "#657084",
  fontSize: 13,
  fontWeight: 620,
};

const loginLinkStyle: React.CSSProperties = {
  padding: 0,
  border: 0,
  background: "transparent",
  color: "#2D6DEE",
  fontSize: 13,
  fontWeight: 850,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  margin: "-10px 0 12px",
  padding: "10px 12px",
  borderRadius: 13,
  border: "1px solid rgba(239, 68, 68, 0.24)",
  background: "rgba(254, 242, 242, 0.86)",
  color: "#DC2626",
  fontSize: 12,
  fontWeight: 650,
  lineHeight: "17px",
  textAlign: "center",
};
