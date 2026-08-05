import axios from "axios";

type AuthMode = "login" | "register";

export interface ApiErrorFeedback {
  message: string;
  requiresLogin?: boolean;
}

const REGISTER_DUPLICATE_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "이미 가입된 이메일입니다.",
  STUDENT_ID_ALREADY_EXISTS: "이미 등록된 학번입니다.",
};

const EMAIL_VERIFICATION_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "이메일 또는 인증번호 형식을 확인해 주세요.",
  EMAIL_VERIFICATION_FAILED: "인증번호가 올바르지 않습니다.",
  VERIFICATION_CODE_EXPIRED: "인증번호가 만료되었습니다. 다시 발급해 주세요.",
  VERIFICATION_ATTEMPTS_EXCEEDED: "인증 시도 횟수를 초과했습니다. 인증번호를 다시 발급해 주세요.",
  EMAIL_VERIFICATION_RATE_LIMITED: "잠시 후 다시 요청해 주세요.",
  EMAIL_DELIVERY_FAILED: "인증 메일 발송에 실패했습니다.",
  EMAIL_VERIFICATION_REQUIRED: "이메일 인증을 완료해 주세요.",
  INVALID_EMAIL_VERIFICATION_TOKEN: "이메일 인증 정보가 올바르지 않습니다. 다시 인증해 주세요.",
  EMAIL_VERIFICATION_EXPIRED: "이메일 인증이 만료되었습니다. 다시 인증해 주세요.",
  EMAIL_ALREADY_EXISTS: "이미 가입된 이메일입니다.",
};

function getResponseValue(data: unknown, key: "error" | "message") {
  return typeof data === "object" && data && key in data
    ? String((data as Record<string, unknown>)[key] ?? "")
    : "";
}

export function getApiErrorCode(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) return "";
  return getResponseValue(error.response.data, "error");
}

export function getEmailVerificationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "이메일 인증에 실패했습니다. 다시 시도해 주세요.";
  }
  if (!error.response) {
    return "서버에 연결할 수 없습니다. 네트워크 또는 서버 상태를 확인해 주세요.";
  }

  const errorCode = getApiErrorCode(error);
  if (EMAIL_VERIFICATION_MESSAGES[errorCode]) {
    return EMAIL_VERIFICATION_MESSAGES[errorCode];
  }
  const statusMessages: Record<number, string> = {
    400: "이메일 또는 인증번호 형식을 확인해 주세요.",
    401: "인증 요청을 처리할 수 없습니다. 다시 시도해 주세요.",
    409: "이미 가입되었거나 처리된 이메일입니다.",
    410: "인증번호가 만료되었습니다. 다시 발급해 주세요.",
    423: "인증 시도 횟수를 초과했습니다. 인증번호를 다시 발급해 주세요.",
    429: "잠시 후 다시 요청해 주세요.",
    502: "인증 메일 발송에 실패했습니다.",
  };
  if (statusMessages[error.response.status]) return statusMessages[error.response.status];
  if (error.response.status >= 500) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
  return "이메일 인증에 실패했습니다. 다시 시도해 주세요.";
}

export function getCreatePostErrorFeedback(error: unknown): ApiErrorFeedback {
  if (!axios.isAxiosError(error)) {
    return { message: "공구 등록에 실패했어요. 다시 시도해 주세요." };
  }

  if (!error.response) {
    return { message: "서버에 연결할 수 없어요. 네트워크 상태를 확인해 주세요." };
  }

  const { status, data } = error.response;
  const errorCode = getResponseValue(data, "error");
  const serverMessage = getResponseValue(data, "message");

  if (status === 404 && errorCode === "AUTHOR_NOT_FOUND") {
    return {
      message: "로그인 정보가 만료됐어요. 다시 로그인해 주세요.",
      requiresLogin: true,
    };
  }
  if (status === 400) {
    return {
      message:
        serverMessage && serverMessage !== errorCode
          ? serverMessage
          : "입력 정보를 다시 확인해 주세요.",
    };
  }
  if (status >= 500) {
    return { message: "서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요." };
  }
  return {
    message:
      serverMessage && serverMessage !== errorCode
        ? serverMessage
        : "공구 등록에 실패했어요. 다시 시도해 주세요.",
  };
}

export function getAuthErrorMessage(error: unknown, mode: AuthMode): string {
  if (!axios.isAxiosError(error)) {
    return mode === "login"
      ? "로그인에 실패했습니다. 다시 시도해주세요."
      : "회원가입에 실패했습니다. 다시 시도해주세요.";
  }

  // 요청은 보냈지만 응답이 없는 경우 (CORS, 네트워크 단절, Mixed Content 등)
  if (!error.response) {
    return "서버에 연결할 수 없습니다. 네트워크 또는 서버 상태를 확인해주세요.";
  }

  const { status, data } = error.response;
  const errorCode =
    typeof data === "object" && data && "error" in data
      ? String((data as { error?: unknown }).error ?? "")
      : "";

  if (mode === "login") {
    if (status === 401) return "학번 또는 비밀번호가 올바르지 않습니다.";
    if (status === 400) return "입력 형식이 올바르지 않습니다.";
    if (status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    return "로그인에 실패했습니다. 다시 시도해주세요.";
  }

  if (status === 409) {
    return REGISTER_DUPLICATE_MESSAGES[errorCode] ?? "이미 존재하는 계정입니다.";
  }
  if (EMAIL_VERIFICATION_MESSAGES[errorCode]) {
    return EMAIL_VERIFICATION_MESSAGES[errorCode];
  }
  if (status === 400) return "입력 형식이 올바르지 않습니다.";
  if (status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  return "회원가입에 실패했습니다. 다시 시도해주세요.";
}
