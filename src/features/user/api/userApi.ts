import axiosInstance from "../../../shared/api/axiosInstance";
import type {
  ApiMyPostsListParams,
  ApiRegisterUserInput,
  ApiUpdateUserInput,
  ApiUserSettings,
} from "../../../shared/api/swaggerTypes";

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

export const getUserSummary = (id: string) =>
  axiosInstance.get(`/users/${id}/summary`);

export const getUserTrustSummary = (id: string) =>
  axiosInstance.get(`/users/${id}/trust-summary`);

export const getUserSettings = (id: string) =>
  axiosInstance.get(`/users/${id}/settings`);

export const updateUserSettings = (id: string, settings: Partial<ApiUserSettings>) =>
  axiosInstance.put(`/users/${id}/settings`, { settings });

export const getMyPosts = (userId: string, params: ApiMyPostsListParams = {}) =>
  axiosInstance.get(`/users/${userId}/my-posts`, {
    params: {
      tab: params.tab ?? "registered",
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      ...(params.status && { status: params.status }),
      ...(params.q && { q: params.q }),
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.category && { category: params.category }),
      ...(params.sort && { sort: params.sort }),
      ...(params.deadlineSoonHours && { deadlineSoonHours: params.deadlineSoonHours }),
      ...(params.recentDays && { recentDays: params.recentDays }),
    },
  });

export const getMyPostsSummary = (
  userId: string,
  params: { deadlineSoonHours?: number; recentDays?: number } = {}
) =>
  axiosInstance.get(`/users/${userId}/my-posts/summary`, {
    params: {
      deadlineSoonHours: params.deadlineSoonHours ?? 24,
      recentDays: params.recentDays ?? 7,
    },
  });
