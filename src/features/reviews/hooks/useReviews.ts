import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReview,
  getPendingReviews,
  getReviewEligibility,
  getReviewSummary,
} from "../api/reviewApi";
import type { SubmitReviewInput } from "../model/reviewTypes";

export const reviewKeys = {
  all: ["reviews"] as const,
  eligibility: (postId: string, userId: string) => ["reviews", "eligibility", postId, userId] as const,
  pending: (userId: string) => ["reviews", "pending", userId] as const,
  summary: (userId: string) => ["reviews", "summary", userId] as const,
};

export function useReviewEligibility(postId?: string, userId?: string | null, enabled = true) {
  return useQuery({
    queryKey: reviewKeys.eligibility(postId ?? "", userId ?? ""),
    queryFn: async () => (await getReviewEligibility(postId!, userId!)).data,
    enabled: enabled && Boolean(postId && userId),
  });
}

export function usePendingReviews(userId?: string | null) {
  return useQuery({
    queryKey: reviewKeys.pending(userId ?? ""),
    queryFn: async () => (await getPendingReviews(userId!)).data,
    enabled: Boolean(userId),
  });
}

export function useReviewSummary(userId?: string | null) {
  return useQuery({
    queryKey: reviewKeys.summary(userId ?? ""),
    queryFn: async () => (await getReviewSummary(userId!)).data,
    enabled: Boolean(userId),
  });
}

export function useSubmitReview(postId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitReviewInput) => createReview(postId, input, userId),
    onSuccess: async (_, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reviewKeys.eligibility(postId, userId) }),
        queryClient.invalidateQueries({ queryKey: reviewKeys.pending(userId) }),
        queryClient.invalidateQueries({ queryKey: reviewKeys.summary(input.revieweeId) }),
      ]);
    },
  });
}
