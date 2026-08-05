import axiosInstance from "../../../shared/api/axiosInstance";
import type {
  ApiRegisterUserInput,
  ApiSendEmailVerificationInput,
  ApiSendEmailVerificationResponse,
  ApiVerifyEmailVerificationInput,
  ApiVerifyEmailVerificationResponse,
} from "../../../shared/api/swaggerTypes";

export const sendEmailVerification = (data: ApiSendEmailVerificationInput) =>
  axiosInstance.post<ApiSendEmailVerificationResponse>(
    "/auth/email-verifications/send",
    data,
  );

export const verifyEmailVerification = (data: ApiVerifyEmailVerificationInput) =>
  axiosInstance.post<ApiVerifyEmailVerificationResponse>(
    "/auth/email-verifications/verify",
    data,
  );

export const registerUser = (userData: ApiRegisterUserInput) =>
  axiosInstance.post(`/users`, {
    user: userData,
  });

export const loginUser = (studentId: string, password: string) =>
  axiosInstance.post(`/users/login`, { studentId, password });
