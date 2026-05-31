import axiosInstance from "../../../shared/api/axiosInstance";
import type {
  ApiCreatePostInput,
  ApiGetPostsParams,
  ApiParticipantStatus,
  ApiPostCategory,
  ApiPostExceptionSeverity,
  ApiPostExceptionStatus,
  ApiPostSort,
  ApiPostStatus,
  ApiUpdatePostInput,
} from "../../../shared/api/swaggerTypes";

export const getPosts = (
  limitOrOptions: number | ApiGetPostsParams = 20,
  offset = 0,
  category?: ApiPostCategory | "all" | string,
  userId?: string | null,
  sort?: ApiPostSort,
  status?: ApiPostStatus,
  keyword?: string,
  q?: string
) => {
  const options: ApiGetPostsParams =
    typeof limitOrOptions === "object"
      ? limitOrOptions
      : { limit: limitOrOptions, offset, category, userId, sort, status, keyword, q };
  const currentUserId = options.userId || undefined;

  return axiosInstance.get(`/posts`, {
    params: {
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
      ...(options.category && options.category !== "all" && { category: options.category }),
      ...(options.sort && { sort: options.sort }),
      ...(options.status && { status: options.status }),
      ...(options.keyword && { keyword: options.keyword }),
      ...(options.q && { q: options.q }),
      ...(currentUserId && { userId: currentUserId }),
    },
    ...(currentUserId ? { headers: { "x-user-id": currentUserId } } : {}),
  });
};

export const getPostDetail = (id: string, userId?: string | null) =>
  axiosInstance.get(`/posts/${id}`, {
    ...(userId ? { params: { userId }, headers: { "x-user-id": userId } } : {}),
  });

export const createPost = (data: ApiCreatePostInput) =>
  axiosInstance.post(`/posts`, {
    post: data,
  });

export const updatePost = (id: string, data: ApiUpdatePostInput) =>
  axiosInstance.put(`/posts/${id}`, { post: data });

export const deletePost = (id: string) =>
  axiosInstance.delete(`/posts/${id}`);

export const getPostsByStudentId = (
  studentId: string,
  limit = 20,
  offset = 0
) =>
  axiosInstance.get(`/posts/student/${studentId}`, {
    params: { limit, offset },
  });

export const participatePost = (postId: string, userId: string) =>
  axiosInstance.post(`/posts/${postId}/participate`, { userId });

export const cancelParticipation = (postId: string, userId: string) =>
  axiosInstance.delete(`/posts/${postId}/participate/${userId}`);

export const checkParticipation = (postId: string, userId: string) =>
  axiosInstance.get(`/posts/${postId}/participate/${userId}`);

export const getParticipants = (postId: string) =>
  axiosInstance.get(`/posts/${postId}/participants`);

export const updateParticipantStatus = (
  postId: string,
  userId: string,
  participantStatus: ApiParticipantStatus,
  actorUserId: string
) =>
  axiosInstance.patch(
    `/posts/${postId}/participants/${userId}/status`,
    { participantStatus, actorUserId },
    { headers: { "x-user-id": actorUserId } }
  );

export const getParticipatedPosts = (userId: string) =>
  axiosInstance.get(`/posts/user/${userId}/participated`);

export const updatePostStatus = (
  postId: string,
  status: ApiPostStatus,
  authorId: string
) => axiosInstance.patch(`/posts/${postId}/status`, { status, authorId });

export const addFavorite = (postId: string, userId: string) =>
  axiosInstance.post(`/posts/${postId}/favorite`, { userId });

export const checkFavorite = (postId: string, userId: string) =>
  axiosInstance.get(`/posts/${postId}/favorite/${userId}`);

export const removeFavorite = (postId: string, userId: string) =>
  axiosInstance.delete(`/posts/${postId}/favorite/${userId}`);

export const getFavoritePosts = (userId: string, limit = 20, offset = 0) =>
  axiosInstance.get(`/users/${userId}/favorites`, {
    params: { limit, offset },
  });

export const getPostExceptions = (postId: string, limit = 20, offset = 0) =>
  axiosInstance.get(`/posts/${postId}/exceptions`, {
    params: { limit, offset },
  });

export const createPostException = (
  postId: string,
  reporterId: string,
  exception: {
    type: string;
    reason: string;
    displayTitle?: string;
    displayMessage?: string;
    severity?: ApiPostExceptionSeverity;
    oldPrice?: number;
    newPrice?: number;
    affectedQuantity?: number;
    metadata?: Record<string, unknown>;
  }
) =>
  axiosInstance.post(
    `/posts/${postId}/exceptions`,
    { exception: { ...exception, reporterId } },
    { headers: { "x-user-id": reporterId } }
  );

export const updatePostExceptionStatus = (
  postId: string,
  exceptionId: string,
  actorUserId: string,
  status: ApiPostExceptionStatus,
  resolutionNote?: string
) =>
  axiosInstance.patch(
    `/posts/${postId}/exceptions/${exceptionId}/status`,
    { actorUserId, status, ...(resolutionNote && { resolutionNote }) },
    { headers: { "x-user-id": actorUserId } }
  );
