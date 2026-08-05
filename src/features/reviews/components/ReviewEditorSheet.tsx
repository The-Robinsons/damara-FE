import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import ActionButton from "../../../shared/components/damara/ActionButton";
import ConfirmBottomSheet from "../../../shared/components/damara/ConfirmBottomSheet";
import InfoBanner from "../../../shared/components/damara/InfoBanner";
import FilterChip from "../../../shared/components/damara/FilterChip";
import { blue50, blue600, grey500, grey700, grey900 } from "../../../shared/constants/homeTheme";
import { useSubmitReview, useUpdateReview } from "../hooks/useReviews";
import { getReviewErrorMessage, getReviewTagLabel, RATING_OPTIONS } from "../model/reviewPresentation";
import type { ReviewRating, ReviewTarget } from "../model/reviewTypes";

interface ReviewEditorSheetProps {
  open: boolean;
  postId: string;
  userId: string;
  target: ReviewTarget | null;
  onClose: () => void;
  onCompleted?: () => void;
}

export default function ReviewEditorSheet({
  open,
  postId,
  userId,
  target,
  onClose,
  onCompleted,
}: ReviewEditorSheetProps) {
  const [rating, setRating] = useState<ReviewRating>("positive");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const submitReview = useSubmitReview(postId, userId);
  const editReview = useUpdateReview(postId, userId);

  useEffect(() => {
    if (!open) return;
    setRating("positive");
    setTags([]);
    setError("");
  }, [open, target?.reviewId]);

  if (!target) return null;

  const allowedTags = target.allowedTags[rating] ?? [];
  const isEditable = target.status === "not_submitted" || (target.status === "pending" && Boolean(target.reviewId));
  const valid = rating === "neutral" || (tags.length >= 1 && tags.length <= 5);
  const pending = submitReview.isPending || editReview.isPending;

  const selectRating = (nextRating: ReviewRating) => {
    setRating(nextRating);
    setTags([]);
    setError("");
  };

  const toggleTag = (tag: string) => {
    setError("");
    setTags((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      if (current.length >= 5) return current;
      return [...current, tag];
    });
  };

  const handleSubmit = async () => {
    if (!valid || !isEditable || pending) {
      if (!valid) setError("좋았거나 아쉬웠다면 태그를 1개 이상 선택해 주세요.");
      return;
    }
    const input = { rating, tags: rating === "neutral" ? [] : tags };
    try {
      if (target.status === "pending" && target.reviewId) {
        await editReview.mutateAsync({ reviewId: target.reviewId, input });
      } else {
        await submitReview.mutateAsync({ revieweeId: target.reviewee.id, ...input });
      }
      onCompleted?.();
      onClose();
    } catch (requestError) {
      setError(getReviewErrorMessage(requestError));
    }
  };

  return (
    <ConfirmBottomSheet
      open={open}
      title={`${target.reviewee.nickname}님은 어떠셨나요?`}
      description="평가는 작성자를 드러내지 않고 신뢰학점에 반영돼요."
      confirmLabel={target.status === "pending" ? "평가 수정" : "평가 제출"}
      onConfirm={() => void handleSubmit()}
      onClose={onClose}
      loading={pending}
      showCloseButton
      scrollable
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7 }}>
        {RATING_OPTIONS.map((option) => (
          <ActionButton
            key={option.value}
            variant={rating === option.value ? "primary" : "secondary"}
            size="compact"
            onClick={() => selectRating(option.value)}
            aria-pressed={rating === option.value}
            style={{ padding: "0 6px", fontSize: 12 }}
          >
            {rating === option.value ? <Check size={14} aria-hidden /> : null}
            {option.label}
          </ActionButton>
        ))}
      </div>

      {rating === "neutral" ? (
        <div style={{ marginTop: 14, padding: "13px 14px", borderRadius: 8, background: blue50, color: blue600, fontSize: 12.5, fontWeight: 700 }}>
          보통 평가는 별도 태그 없이 제출돼요.
        </div>
      ) : (
        <div style={{ marginTop: 17 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <strong style={{ color: grey900, fontSize: 13 }}>해당하는 항목</strong>
            <span style={{ color: grey500, fontSize: 11, fontWeight: 700 }}>{tags.length}/5</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
            {allowedTags.map((tag) => (
              <FilterChip key={tag} active={tags.includes(tag)} size="compact" onClick={() => toggleTag(tag)}>
                {getReviewTagLabel(tag)}
              </FilterChip>
            ))}
          </div>
          {allowedTags.length === 0 ? (
            <p style={{ margin: "10px 0 0", color: grey700, fontSize: 12 }}>선택 가능한 평가 항목이 없어요.</p>
          ) : null}
        </div>
      )}

      {error ? <InfoBanner tone="danger" style={{ marginTop: 14 }}>{error}</InfoBanner> : null}
    </ConfirmBottomSheet>
  );
}
