import { describe, expect, it } from "vitest";

import {
  getAuthErrorMessage,
  getEmailVerificationErrorMessage,
} from "./apiError";

function createApiError(error: string, status = 400, message?: string) {
  return {
    isAxiosError: true,
    response: {
      status,
      data: { error, ...(message ? { message } : {}) },
    },
  };
}

describe("getEmailVerificationErrorMessage", () => {
  it.each([
    ["VALIDATION_ERROR", "이메일 또는 인증번호 형식을 확인해 주세요."],
    ["EMAIL_VERIFICATION_FAILED", "인증번호가 올바르지 않습니다."],
    ["VERIFICATION_CODE_EXPIRED", "인증번호가 만료되었습니다. 다시 발급해 주세요."],
    ["VERIFICATION_ATTEMPTS_EXCEEDED", "인증 시도 횟수를 초과했습니다. 인증번호를 다시 발급해 주세요."],
    ["EMAIL_VERIFICATION_RATE_LIMITED", "잠시 후 다시 요청해 주세요."],
    ["EMAIL_DELIVERY_FAILED", "인증 메일 발송에 실패했습니다."],
    ["EMAIL_VERIFICATION_REQUIRED", "이메일 인증을 완료해 주세요."],
    ["INVALID_EMAIL_VERIFICATION_TOKEN", "이메일 인증 정보가 올바르지 않습니다. 다시 인증해 주세요."],
    ["EMAIL_VERIFICATION_EXPIRED", "이메일 인증이 만료되었습니다. 다시 인증해 주세요."],
    ["EMAIL_ALREADY_EXISTS", "이미 가입된 이메일입니다."],
  ])("maps %s", (errorCode, message) => {
    expect(getEmailVerificationErrorMessage(createApiError(errorCode))).toBe(message);
  });

  it("returns a network message when no response is available", () => {
    expect(
      getEmailVerificationErrorMessage({ isAxiosError: true }),
    ).toBe("서버에 연결할 수 없습니다. 네트워크 또는 서버 상태를 확인해 주세요.");
  });

  it("maps verification HTTP status when the backend omits an error code", () => {
    expect(getEmailVerificationErrorMessage(createApiError("", 429))).toBe("잠시 후 다시 요청해 주세요.");
    expect(getEmailVerificationErrorMessage(createApiError("", 502))).toBe("인증 메일 발송에 실패했습니다.");
  });

  it("uses an error code provided in the response message", () => {
    expect(
      getEmailVerificationErrorMessage(createApiError("", 409, "EMAIL_ALREADY_EXISTS")),
    ).toBe("이미 가입된 이메일입니다.");
  });
});

describe("getAuthErrorMessage", () => {
  it("maps an expired verification token during registration", () => {
    expect(
      getAuthErrorMessage(createApiError("EMAIL_VERIFICATION_EXPIRED", 410), "register"),
    ).toBe("이메일 인증이 만료되었습니다. 다시 인증해 주세요.");
  });
});
