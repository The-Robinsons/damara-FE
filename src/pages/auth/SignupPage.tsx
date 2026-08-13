import { useEffect, useState } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, CircleAlert, Clock3, Eye, EyeOff, IdCard, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

import damaraLogo from "../../assets/damara-mark.png";
import {
  loginUser,
  registerUser,
  sendEmailVerification,
  verifyEmailVerification,
} from "../../features/auth/api/authApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import {
  getApiErrorCode,
  getAuthErrorMessage,
  getEmailVerificationErrorMessage,
} from "../../shared/utils/apiError";

const VERIFICATION_RESTART_ERROR_CODES = new Set([
  "EMAIL_VERIFICATION_REQUIRED",
  "INVALID_EMAIL_VERIFICATION_TOKEN",
  "EMAIL_VERIFICATION_EXPIRED",
]);
const PASSWORD_MAX_LENGTH = 20;

function getRemainingSeconds(expiresAt: number | null, now: number) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function isValidPassword(value: string) {
  return value.length >= 8 && value.length <= PASSWORD_MAX_LENGTH && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export default function SignupPage() {
  const nav = useNavigate();
  const [nickname, setNickname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [clockMs, setClockMs] = useState(() => Date.now());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const normalizedStudentId = studentId.replace(/\D/g, "").slice(0, 8);
  const normalizedNickname = nickname.trim();
  const normalizedEmailLocalPart = emailLocalPart.trim();
  const email = `${normalizedEmailLocalPart}@mju.ac.kr`;
  const isStudentIdValid = /^\d{8}$/.test(normalizedStudentId);
  const isNicknameValid = normalizedNickname.length >= 2;
  const isEmailLocalPartValid = /^[A-Za-z0-9._%+-]+$/.test(normalizedEmailLocalPart);
  const isPasswordValid = isValidPassword(password);
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;
  const codeRemainingSeconds = getRemainingSeconds(codeExpiresAt, clockMs);
  const resendRemainingSeconds = getRemainingSeconds(resendAvailableAt, clockMs);
  const tokenRemainingSeconds = getRemainingSeconds(tokenExpiresAt, clockMs);
  const isEmailVerified = Boolean(emailVerificationToken && tokenRemainingSeconds > 0);
  const isVerificationCodeValid = /^\d{6}$/.test(verificationCode);
  const hasActiveTimer = Boolean(
    codeRemainingSeconds || resendRemainingSeconds || tokenRemainingSeconds,
  );
  const canSubmit = Boolean(
    isNicknameValid &&
    isPasswordValid &&
    passwordsMatch &&
    isStudentIdValid &&
    isEmailLocalPartValid &&
    isEmailVerified,
  );

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

  useEffect(() => {
    if (!hasActiveTimer) return;
    const timerId = window.setInterval(() => setClockMs(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [hasActiveTimer]);

  useEffect(() => {
    if (!emailVerificationToken || !tokenExpiresAt || tokenRemainingSeconds > 0) return;
    setVerificationCode("");
    setVerificationRequested(false);
    setEmailVerificationToken("");
    setCodeExpiresAt(null);
    setResendAvailableAt(null);
    setTokenExpiresAt(null);
    setError("이메일 인증이 만료되었습니다. 다시 인증해 주세요.");
  }, [emailVerificationToken, tokenExpiresAt, tokenRemainingSeconds]);

  const resetEmailVerification = () => {
    setVerificationCode("");
    setVerificationRequested(false);
    setEmailVerificationToken("");
    setCodeExpiresAt(null);
    setResendAvailableAt(null);
    setTokenExpiresAt(null);
    setClockMs(Date.now());
  };

  const handleSendVerification = async () => {
    if (!isEmailLocalPartValid) {
      setError("명지대학교 이메일 아이디 형식을 확인해 주세요.");
      return;
    }
    if (isSendingCode || resendRemainingSeconds > 0 || isEmailVerified) return;

    setIsSendingCode(true);
    setError("");
    try {
      const response = await sendEmailVerification({ email });
      const now = Date.now();
      const expiresInSeconds = Math.max(1, Number(response.data.expiresInSeconds) || 300);
      const resendAfterSeconds = Math.max(0, Number(response.data.resendAfterSeconds) || 0);

      setVerificationCode("");
      setVerificationRequested(true);
      setEmailVerificationToken("");
      setTokenExpiresAt(null);
      setCodeExpiresAt(now + expiresInSeconds * 1000);
      setResendAvailableAt(now + resendAfterSeconds * 1000);
      setClockMs(now);
      toast.success("명지대학교 이메일로 인증번호를 보냈어요.");
    } catch (err) {
      setError(getEmailVerificationErrorMessage(err));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!isVerificationCodeValid) {
      setError("인증번호 숫자 6자리를 입력해 주세요.");
      return;
    }
    if (codeRemainingSeconds <= 0) {
      setError("인증번호가 만료되었습니다. 다시 발급해 주세요.");
      return;
    }
    if (isVerifyingCode || isEmailVerified) return;

    setIsVerifyingCode(true);
    setError("");
    try {
      const response = await verifyEmailVerification({
        email,
        code: verificationCode,
      });
      const { verified, emailVerificationToken: token, expiresInSeconds } = response.data;
      if (!verified || !token) {
        setError("인증번호가 올바르지 않습니다.");
        return;
      }

      const now = Date.now();
      setEmailVerificationToken(token);
      setTokenExpiresAt(now + Math.max(1, Number(expiresInSeconds) || 900) * 1000);
      setCodeExpiresAt(null);
      setClockMs(now);
      toast.success("이메일 인증이 완료되었어요.");
    } catch (err) {
      const errorCode = getApiErrorCode(err);
      if (
        errorCode === "VERIFICATION_CODE_EXPIRED" ||
        errorCode === "VERIFICATION_ATTEMPTS_EXCEEDED"
      ) {
        setVerificationCode("");
        setCodeExpiresAt(null);
      }
      setError(getEmailVerificationErrorMessage(err));
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleRegister = async () => {
    if (!normalizedNickname || !studentId || !emailLocalPart || !password || !confirmPassword) {
      setError("필수 항목을 모두 입력해 주세요.");
      return;
    }
    if (!isNicknameValid) {
      setError("닉네임 글자 수가 너무 적어요. 2자 이상 입력해 주세요.");
      return;
    }
    if (!isStudentIdValid) {
      setError("학번은 숫자 8자리로 입력해 주세요.");
      return;
    }
    if (!isEmailLocalPartValid) {
      setError("명지대학교 이메일 아이디 형식을 확인해 주세요.");
      return;
    }
    if (!isEmailVerified || !emailVerificationToken) {
      setError("이메일 인증을 완료해 주세요.");
      return;
    }
    if (!isPasswordValid) {
      setError("비밀번호는 영문과 숫자를 포함해 8~20자로 입력해 주세요.");
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
        nickname: normalizedNickname,
        studentId: normalizedStudentId,
        emailVerificationToken,
      });

      resetEmailVerification();

      try {
        const loginResponse = await loginUser(normalizedStudentId, password);
        const userData = loginResponse.data;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.USER_ID, userData.id);
        localStorage.removeItem(STORAGE_KEYS.HOME_TUTORIAL_SEEN);
        sessionStorage.setItem(STORAGE_KEYS.SHOW_HOME_TUTORIAL_ONCE, "true");
        nav("/home");
      } catch {
        toast.success("회원가입이 완료되었어요. 로그인해 주세요.");
        nav("/login");
      }
    } catch (err) {
      console.error("회원가입 실패:", err);
      if (VERIFICATION_RESTART_ERROR_CODES.has(getApiErrorCode(err))) {
        resetEmailVerification();
      }
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
            <FieldWithIndicator
              icon={<User size={17} strokeWidth={2} aria-hidden />}
              neutralIcon={User}
              message={
                isNicknameValid
                  ? "사용 가능한 닉네임이에요."
                  : "닉네임 글자 수가 너무 적어요. 2자 이상 입력해 주세요."
              }
              status={nickname ? (isNicknameValid ? "valid" : "invalid") : "neutral"}
            >
              <input
                className="damara-signup-input"
                type="text"
                autoComplete="name"
                aria-label="닉네임"
                aria-invalid={nickname ? !isNicknameValid : undefined}
                value={nickname}
                onChange={(event) => updateValue(event, setNickname)}
                placeholder="닉네임"
                maxLength={20}
                style={inputStyle}
              />
            </FieldWithIndicator>

            <FieldWithIndicator
              icon={<IdCard size={17} strokeWidth={2} aria-hidden />}
              neutralIcon={IdCard}
              message={isStudentIdValid ? "8자리 학번을 확인했어요." : `숫자 8자리로 입력해 주세요. (${normalizedStudentId.length}/8)`}
              status={studentId ? (isStudentIdValid ? "valid" : "invalid") : "neutral"}
            >
              <input
                className="damara-signup-input"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                aria-label="학번 8자리"
                aria-invalid={studentId ? !isStudentIdValid : undefined}
                value={studentId}
                onChange={(event) => {
                  setStudentId(event.target.value.replace(/\D/g, "").slice(0, 8));
                  setError("");
                }}
                placeholder="학번 8자리"
                maxLength={8}
                style={inputStyle}
              />
            </FieldWithIndicator>

            <FieldWithIndicator
              icon={<Mail size={17} strokeWidth={2} aria-hidden />}
              neutralIcon={Mail}
              message={
                isEmailVerified
                  ? `이메일 인증 완료 · 회원가입까지 ${formatCountdown(tokenRemainingSeconds)}`
                  : verificationRequested
                    ? "입력한 이메일로 인증번호를 보냈어요."
                    : isEmailLocalPartValid
                      ? "인증번호를 받아 이메일을 확인해 주세요."
                      : "명지대학교 이메일만 사용할 수 있어요."
              }
              status={
                isEmailVerified
                  ? "valid"
                  : emailLocalPart && !isEmailLocalPartValid
                    ? "invalid"
                    : "neutral"
              }
            >
              <input
                className="damara-signup-input"
                type="text"
                autoComplete="email"
                aria-label="명지대학교 이메일 아이디"
                aria-invalid={emailLocalPart ? !isEmailLocalPartValid : undefined}
                disabled={isEmailVerified || isSendingCode || isVerifyingCode}
                value={emailLocalPart}
                onChange={(event) => {
                  const value = event.target.value.toLowerCase();
                  const suffix = "@mju.ac.kr";
                  const nextValue = value.toLowerCase().endsWith(suffix)
                    ? value.slice(0, -suffix.length)
                    : value;
                  if (nextValue !== emailLocalPart) resetEmailVerification();
                  setEmailLocalPart(nextValue);
                  setError("");
                }}
                placeholder="이메일 아이디"
                style={inputStyle}
              />
              <span aria-hidden style={emailSuffixStyle}>@mju.ac.kr</span>
              <button
                type="button"
                className="damara-signup-verify-action"
                aria-label={verificationRequested ? "이메일 인증번호 다시 받기" : "이메일 인증번호 받기"}
                disabled={
                  !isEmailLocalPartValid ||
                  isSendingCode ||
                  isVerifyingCode ||
                  isEmailVerified ||
                  resendRemainingSeconds > 0
                }
                onClick={() => void handleSendVerification()}
                style={verificationActionStyle}
              >
                {isEmailVerified
                  ? "인증 완료"
                  : isSendingCode
                    ? "전송 중"
                    : verificationRequested && resendRemainingSeconds > 0
                      ? `${resendRemainingSeconds}초`
                      : verificationRequested
                        ? "다시 받기"
                        : "인증번호 받기"}
              </button>
            </FieldWithIndicator>

            {verificationRequested ? (
              <FieldWithIndicator
                icon={<ShieldCheck size={17} strokeWidth={2} aria-hidden />}
                neutralIcon={Clock3}
                message={
                  isEmailVerified
                    ? "명지대학교 이메일 인증이 완료되었어요."
                    : codeRemainingSeconds > 0
                      ? "메일로 받은 숫자 6자리를 입력해 주세요."
                      : "인증번호가 만료되었어요. 다시 발급해 주세요."
                }
                status={
                  isEmailVerified
                    ? "valid"
                    : codeRemainingSeconds <= 0 || (verificationCode && !isVerificationCodeValid)
                      ? "invalid"
                      : "neutral"
                }
              >
                <input
                  className="damara-signup-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="이메일 인증번호 6자리"
                  aria-invalid={verificationCode ? !isVerificationCodeValid : undefined}
                  disabled={isEmailVerified || isVerifyingCode}
                  value={verificationCode}
                  onChange={(event) => {
                    setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="인증번호 6자리"
                  maxLength={6}
                  style={inputStyle}
                />
                <span aria-live="polite" style={countdownStyle}>
                  {isEmailVerified ? "완료" : formatCountdown(codeRemainingSeconds)}
                </span>
                <button
                  type="button"
                  className="damara-signup-verify-action"
                  disabled={
                    !isVerificationCodeValid ||
                    codeRemainingSeconds <= 0 ||
                    isVerifyingCode ||
                    isEmailVerified
                  }
                  onClick={() => void handleVerifyEmail()}
                  style={verificationActionStyle}
                >
                  {isEmailVerified ? "인증 완료" : isVerifyingCode ? "확인 중" : "인증 확인"}
                </button>
              </FieldWithIndicator>
            ) : null}

            <FieldWithIndicator
              icon={<Lock size={17} strokeWidth={2} aria-hidden />}
              neutralIcon={Lock}
              message={isPasswordValid ? "안전한 비밀번호 형식이에요." : "영문과 숫자를 포함해 8~20자로 입력해 주세요."}
              status={password ? (isPasswordValid ? "valid" : "invalid") : "neutral"}
            >
              <input className="damara-signup-input" type={showPassword ? "text" : "password"} autoComplete="new-password" aria-label="비밀번호" value={password} onChange={(event) => updateValue(event, setPassword, PASSWORD_MAX_LENGTH)} placeholder="비밀번호" minLength={8} maxLength={PASSWORD_MAX_LENGTH} style={inputStyle} />
              <EyeButton active={showPassword} onClick={() => setShowPassword((value) => !value)} label="비밀번호" />
            </FieldWithIndicator>

            <FieldWithIndicator
              icon={<Lock size={17} strokeWidth={2} aria-hidden />}
              neutralIcon={Lock}
              message={passwordsMatch ? "비밀번호가 일치해요." : "비밀번호를 한 번 더 입력해 주세요."}
              status={confirmPassword ? (passwordsMatch ? "valid" : "invalid") : "neutral"}
            >
              <input className="damara-signup-input" type={showConfirm ? "text" : "password"} autoComplete="new-password" aria-label="비밀번호 확인" value={confirmPassword} onChange={(event) => updateValue(event, setConfirmPassword, PASSWORD_MAX_LENGTH)} placeholder="비밀번호 확인" maxLength={PASSWORD_MAX_LENGTH} style={inputStyle} />
              <EyeButton active={showConfirm} onClick={() => setShowConfirm((value) => !value)} label="비밀번호 확인" />
            </FieldWithIndicator>

            <button
              type="submit"
              disabled={isLoading || isSendingCode || isVerifyingCode || !canSubmit}
              className="damara-signup-submit"
              style={submitStyle}
            >
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

  function updateValue(event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>, maxLength?: number) {
    setter(maxLength ? event.target.value.slice(0, maxLength) : event.target.value);
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

function FieldWithIndicator({
  icon,
  neutralIcon: NeutralIcon,
  children,
  message,
  status,
}: {
  icon: React.ReactNode;
  neutralIcon: React.ElementType;
  children: React.ReactNode;
  message: string;
  status: "neutral" | "valid" | "invalid";
}) {
  const Icon = status === "valid" ? CircleCheck : status === "invalid" ? CircleAlert : NeutralIcon;

  return (
    <div style={fieldGroupStyle}>
      <LineField icon={icon}>{children}</LineField>
      <p style={{ ...indicatorStyle, color: status === "valid" ? "#2272eb" : status === "invalid" ? "#dc2626" : "#657084" }}>
        <Icon size={13} strokeWidth={2.2} aria-hidden />
        {message}
      </p>
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
  .damara-signup-input:disabled {
    color: #526078;
    cursor: not-allowed;
    opacity: 1;
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
  .damara-signup-verify-action:active:not(:disabled) {
    transform: scale(0.97);
  }
  .damara-signup-verify-action:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .damara-signup-submit:disabled {
    cursor: wait;
    opacity: 0.62;
  }
  .damara-signup-plain:focus-visible,
  .damara-signup-verify-action:focus-visible,
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
  @media (max-width: 360px) {
    .damara-signup-content {
      padding-left: 18px !important;
      padding-right: 18px !important;
    }
    .damara-signup-verify-action {
      min-width: 62px !important;
      padding-left: 7px !important;
      padding-right: 7px !important;
    }
  }
`;

const pageStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "100dvh",
  height: "100dvh",
  overflowX: "hidden",
  overflowY: "auto",
  background: "radial-gradient(circle at 50% 8%, rgba(210, 226, 255, 0.78) 0%, transparent 42%), linear-gradient(148deg, #F8FAFF 0%, #F2F6FF 52%, #FFFFFF 100%)",
};

const mainStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "100%",
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

const fieldGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
};

const indicatorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  minHeight: 16,
  margin: "0 2px",
  fontSize: 11,
  fontWeight: 650,
  lineHeight: "16px",
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

const emailSuffixStyle: React.CSSProperties = {
  flexShrink: 0,
  paddingLeft: 10,
  borderLeft: "1px solid rgba(70, 111, 197, 0.16)",
  color: "#3168dc",
  fontSize: 13,
  fontWeight: 800,
  lineHeight: "20px",
};

const verificationActionStyle: React.CSSProperties = {
  minWidth: 68,
  height: 32,
  padding: "0 9px",
  flexShrink: 0,
  border: "1px solid rgba(49, 104, 220, 0.2)",
  borderRadius: 10,
  background: "rgba(231, 239, 255, 0.9)",
  color: "#2864DD",
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "transform 140ms ease, opacity 160ms ease, background-color 160ms ease",
};

const countdownStyle: React.CSSProperties = {
  minWidth: 38,
  flexShrink: 0,
  color: "#DC5A5A",
  fontSize: 11,
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
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
