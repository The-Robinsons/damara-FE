import axiosInstance from "../../../shared/api/axiosInstance";
import type { ApiFaqCategory, ApiNoticeType } from "../../../shared/api/swaggerTypes";

export const getNotices = (
  params: { limit?: number; offset?: number; type?: ApiNoticeType } = {}
) =>
  axiosInstance.get("/notices", {
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      ...(params.type && { type: params.type }),
    },
  });

export const getNotice = (id: string) =>
  axiosInstance.get(`/notices/${id}`);

export const getFaqs = (
  params: { limit?: number; offset?: number; category?: ApiFaqCategory } = {}
) =>
  axiosInstance.get("/faqs", {
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      ...(params.category && { category: params.category }),
    },
  });
