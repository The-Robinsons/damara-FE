import React from "react";
import type { EnhancedPostFields } from "../utils/enhancedPostMapper";
import { TradeMethodBadge } from "./TrustBadges";
import { grey600, grey900, HOME_BORDER } from "../../../shared/constants/homeTheme";
import ConfirmBottomSheet from "../../../shared/components/damara/ConfirmBottomSheet";

interface ParticipationConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  data: EnhancedPostFields;
  postTitle?: string;
  isLoading?: boolean;
}

export default function ParticipationConfirmModal({
  isOpen,
  onConfirm,
  onClose,
  data,
  postTitle,
  isLoading = false,
}: ParticipationConfirmModalProps) {
  const agreements = [
    {
      label: "거래 방식",
      value: data.tradeMethod ? (
        <TradeMethodBadge method={data.tradeMethod} size="xs" />
      ) : null,
    },
    { label: "거래 장소", value: data.damaraZoneName || "채팅으로 협의" },
    { label: "수령 시간", value: data.pickupTimeText || "미정" },
    { label: "취소 가능", value: data.agreementCancelPolicy },
    { label: "가격 변경", value: data.agreementPriceChangePolicy },
    { label: "품절 시", value: data.agreementOutOfStockPolicy },
    { label: "노쇼 기준", value: data.agreementNoShowPolicy },
    { label: "파손 정산", value: data.agreementDamagePolicy },
  ].filter((a) => a.value);

  const description = [postTitle?.trim(), "아래 약속을 확인했을 때만 참여해 주세요."].filter(Boolean).join("\n\n");

  return (
    <ConfirmBottomSheet
      open={isOpen}
      title="이 공동구매에 참여할까요?"
      description={description}
      confirmLabel={isLoading ? "처리 중…" : "네, 참여할게요"}
      cancelLabel="닫기"
      onConfirm={onConfirm}
      onClose={onClose}
      loading={isLoading}
      cancelVariant="text"
      showCloseButton
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          borderRadius: 16,
          border: `1px solid ${HOME_BORDER}`,
          overflow: "hidden",
        }}
      >
        {agreements.map((a, i) => (
          <div
            key={a.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              padding: "14px 16px",
              borderTop: i === 0 ? "none" : `1px solid ${HOME_BORDER}`,
              backgroundColor: "#fafbfc",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: grey900, flexShrink: 0 }}>{a.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: grey600, textAlign: "right", minWidth: 0 }}>
              {typeof a.value === "string" ? a.value : a.value}
            </span>
          </div>
        ))}
      </div>
    </ConfirmBottomSheet>
  );
}
