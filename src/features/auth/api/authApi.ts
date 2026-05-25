import axiosInstance from "../../../shared/api/axiosInstance";
import type { ApiRegisterUserInput } from "../../../shared/api/swaggerTypes";

export const registerUser = (userData: ApiRegisterUserInput) =>
  axiosInstance.post(`/users`, {
    user: userData,
  });

export const loginUser = (studentId: string, password: string) =>
  axiosInstance.post(`/users/login`, { studentId, password });
