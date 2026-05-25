import axiosInstance from "../../../shared/api/axiosInstance";
import type { ApiRegisterUserInput, ApiUpdateUserInput } from "../../../shared/api/swaggerTypes";

export const getUsers = (limit = 20, offset = 0) =>
  axiosInstance.get(`/users`, {
    params: { limit, offset },
  });

export const createUser = (data: ApiRegisterUserInput) =>
  axiosInstance.post(`/users`, {
    user: data,
  });

export const getUser = (id: string) =>
  axiosInstance.get(`/users/${id}`);

export const updateUser = (id: string, data: ApiUpdateUserInput) =>
  axiosInstance.put(`/users/${id}`, {
    user: data,
  });

export const deleteUser = (id: string) =>
  axiosInstance.delete(`/users/${id}`);

export const getUserFavorites = (userId: string, limit = 20, offset = 0) =>
  axiosInstance.get(`/users/${userId}/favorites`, {
    params: { limit, offset },
  });

export const getUserTrustEvents = (id: string, limit = 20, offset = 0) =>
  axiosInstance.get(`/users/${id}/trust-events`, {
    params: { limit, offset },
  });
