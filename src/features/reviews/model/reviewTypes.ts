export type ReviewRating = "positive" | "neutral" | "negative";
export type ReviewRole = "organizer" | "participant";
export type ReviewStatus =
  | "not_submitted"
  | "pending"
  | "published"
  | "expired"
  | "hidden"
  | "disputed"
  | "invalidated";

export interface ReviewUser {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
}

export interface AllowedReviewTags {
  positive: string[];
  neutral: string[];
  negative: string[];
}

export interface ReviewTarget {
  reviewee: ReviewUser;
  revieweeRole: ReviewRole;
  allowedTags: AllowedReviewTags;
  status: ReviewStatus;
  reviewId: string | null;
  expiresAt: string | null;
}

export interface ReviewEligibilityResponse {
  postId: string;
  targets: ReviewTarget[];
}

export interface PendingReview extends ReviewTarget {
  postId: string;
  postTitle: string;
}

export interface PendingReviewsResponse {
  reviews: PendingReview[];
  total: number;
}

export interface SubmitReviewInput {
  revieweeId: string;
  rating: ReviewRating;
  tags: string[];
}

export interface ReviewResponse {
  id: string;
  postId: string;
  revieweeId: string;
  reviewerRole: ReviewRole;
  revieweeRole: ReviewRole;
  rating: ReviewRating;
  tags: string[];
  status: Exclude<ReviewStatus, "not_submitted" | "expired">;
  submittedAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
}

export interface ReviewRatingCounts {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ReviewTagCount {
  tag: string;
  count: number;
}

export interface ReviewRoleSummary {
  reviewCount: number;
  ratings: ReviewRatingCounts;
  tags: ReviewTagCount[];
}

export interface ReviewSummaryResponse {
  userId: string;
  trustScore: number;
  trustGrade: number;
  reviewCount: number;
  ratings: ReviewRatingCounts;
  tags: ReviewTagCount[];
  confidence: "low" | "medium" | "high";
  roles: Record<ReviewRole, ReviewRoleSummary>;
}
