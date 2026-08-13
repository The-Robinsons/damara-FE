import { useEffect, useState } from "react";

import ConfirmBottomSheet from "../../../shared/components/damara/ConfirmBottomSheet";
import FilterChip from "../../../shared/components/damara/FilterChip";
import { blue600, grey500, grey900 } from "../../../shared/constants/homeTheme";
import type { ApiPostStatus } from "../../../shared/api/swaggerTypes";

const STATUS_OPTIONS: { value: ApiPostStatus; label: string }[] = [
  { value: "open", label: "모집중" },
  { value: "closed", label: "모집 마감" },
  { value: "completed", label: "거래 완료" },
  { value: "cancelled", label: "취소됨" },
];

interface HomeFilterSheetProps {
  open: boolean;
  status: ApiPostStatus;
  onApply: (status: ApiPostStatus) => void;
  onClose: () => void;
}

export default function HomeFilterSheet({ open, status, onApply, onClose }: HomeFilterSheetProps) {
  const [draftStatus, setDraftStatus] = useState<ApiPostStatus>(status);

  useEffect(() => {
    if (open) setDraftStatus(status);
  }, [open, status]);

  return (
    <ConfirmBottomSheet
      open={open}
      title="필터"
      description="보고 싶은 공구 상태를 선택해 주세요."
      confirmLabel="적용하기"
      cancelLabel="닫기"
      onConfirm={() => {
        onApply(draftStatus);
        onClose();
      }}
      onClose={onClose}
      showCloseButton
    >
      <section aria-label="모집 상태">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <strong style={{ color: grey900, fontSize: 14, lineHeight: "20px" }}>모집 상태</strong>
          {draftStatus !== "open" ? (
            <button
              type="button"
              onClick={() => setDraftStatus("open")}
              style={{ border: 0, padding: 0, background: "transparent", color: blue600, fontSize: 12, fontWeight: 750, cursor: "pointer" }}
            >
              기본값으로
            </button>
          ) : null}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 11 }}>
          {STATUS_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              active={draftStatus === option.value}
              aria-pressed={draftStatus === option.value}
              onClick={() => setDraftStatus(option.value)}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", color: grey500, fontSize: 12, lineHeight: "18px" }}>
          기본값은 현재 참여할 수 있는 모집중 공구예요.
        </p>
      </section>
    </ConfirmBottomSheet>
  );
}
