import axiosInstance from "../../../shared/api/axiosInstance";
import type {
  PendingReviewsResponse,
  ReviewEligibilityResponse,
  ReviewResponse,
  ReviewSummaryResponse,
  SubmitReviewInput,
  UpdateReviewInput,
} from "../model/reviewTypes";

const userHeaders = (userId: string) => ({ "X-User-Id": userId });

export const getReviewEligibility = (postId: string, userId: string) =>
  axiosInstance.get<ReviewEligibilityResponse>(`/posts/${postId}/reviews/eligibility`, {
    headers: userHeaders(userId),
  });

export const createReview = (postId: string, input: SubmitReviewInput, userId: string) =>
  axiosInstance.post<ReviewResponse>(`/posts/${postId}/reviews`, input, {
    headers: userHeaders(userId),
  });

export const updateReview = (reviewId: string, input: UpdateReviewInput, userId: string) =>
  axiosInstance.put<ReviewResponse>(`/reviews/${reviewId}`, input, {
    headers: userHeaders(userId),
  });

export const getPendingReviews = (userId: string) =>
  axiosInstance.get<PendingReviewsResponse>("/users/me/pending-reviews", {
    headers: userHeaders(userId),
  });

export const getReviewSummary = (userId: string) =>
  axiosInstance.get<ReviewSummaryResponse>(`/users/${userId}/review-summary`);
