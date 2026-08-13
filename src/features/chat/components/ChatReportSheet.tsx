import { useEffect, useState } from "react";
import { Check, UserRound } from "lucide-react";

import ConfirmBottomSheet from "../../../shared/components/damara/ConfirmBottomSheet";
import FilterChip from "../../../shared/components/damara/FilterChip";
import InfoBanner from "../../../shared/components/damara/InfoBanner";
import { blue50, blue600, grey100, grey200, grey400, grey500, grey900 } from "../../../shared/constants/homeTheme";
import { submitChatReport } from "../api/chatApi";
import {
  buildChatReportInput,
  CHAT_REPORT_CATEGORIES,
  getChatReportErrorMessage,
  type ChatReportCategory,
  type ChatReportTarget,
} from "../model/chatReport";

interface ChatReportSheetProps {
  open: boolean;
  chatRoomId: string;
  currentUserId: string;
  targets: ChatReportTarget[];
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ChatReportSheet({
  open,
  chatRoomId,
  currentUserId,
  targets,
  onClose,
  onSubmitted,
}: ChatReportSheetProps) {
  const [step, setStep] = useState<"target" | "reason">("target");
  const [targetId, setTargetId] = useState("");
  const [category, setCategory] = useState<ChatReportCategory | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("target");
    setTargetId("");
    setCategory(null);
    setDetails("");
    setError("");
    setSubmitting(false);
  }, [open]);

  const selectedTarget = targets.find((target) => target.userId === targetId);
  const hasReason = Boolean(category || details.trim());

  const close = () => {
    if (submitting) return;
    onClose();
  };

  const goBack = () => {
    setError("");
    setStep("target");
  };

  const handleConfirm = async () => {
    if (step === "target") {
      if (!selectedTarget) return;
      setError("");
      setStep("reason");
      return;
    }

    if (!selectedTarget || !hasReason || submitting) return;

    try {
      setSubmitting(true);
      setError("");
      await submitChatReport(
        chatRoomId,
        buildChatReportInput(selectedTarget.userId, category, details),
        currentUserId
      );
      onSubmitted();
      onClose();
    } catch (requestError) {
      setError(getChatReportErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfirmBottomSheet
      open={open}
      title={step === "target" ? "신고할 사용자 선택" : `${selectedTarget?.nickname ?? "사용자"}님 신고`}
      description={step === "target" ? "신고할 채팅 참여자를 선택해 주세요." : "신고 사유 또는 상세 내용 중 하나 이상 입력해 주세요."}
      confirmLabel={step === "target" ? "다음" : "신고 제출"}
      cancelLabel={step === "target" ? "닫기" : "이전"}
      onConfirm={() => void handleConfirm()}
      onClose={step === "target" ? close : goBack}
      confirmDanger={step === "reason"}
      confirmDisabled={step === "target" ? !selectedTarget : !hasReason}
      loading={submitting}
      scrollable
    >
      {step === "target" ? (
        <div style={{ display: "grid", gap: 8 }}>
          {targets.map((target) => {
            const selected = target.userId === targetId;
            return (
              <button
                key={target.userId}
                type="button"
                aria-pressed={selected}
                onClick={() => { setTargetId(target.userId); setError(""); }}
                style={{ width: "100%", minHeight: 56, padding: "10px 12px", borderRadius: 8, border: `1px solid ${selected ? blue600 : grey200}`, background: selected ? blue50 : "#fff", display: "flex", alignItems: "center", gap: 10, color: grey900, cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8, display: "grid", placeItems: "center", background: selected ? "#fff" : grey100, color: selected ? blue600 : grey500 }}>
                  <UserRound size={17} aria-hidden />
                </span>
                <strong style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{target.nickname}</strong>
                {selected ? <Check size={17} color={blue600} aria-hidden /> : null}
              </button>
            );
          })}
          {targets.length === 0 ? <InfoBanner tone="danger">신고할 수 있는 사용자를 찾지 못했어요.</InfoBanner> : null}
        </div>
      ) : (
        <div>
          <strong style={{ display: "block", color: grey900, fontSize: 13 }}>신고 사유</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
            {CHAT_REPORT_CATEGORIES.map((option) => (
              <FilterChip
                key={option.value}
                active={category === option.value}
                size="compact"
                onClick={() => { setCategory((current) => current === option.value ? null : option.value); setError(""); }}
                style={category === option.value
                  ? { background: blue600, borderColor: blue600, color: "#fff" }
                  : { background: grey100, borderColor: grey200 }}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>

          <label style={{ display: "block", marginTop: 16 }}>
            <span style={{ display: "flex", justifyContent: "space-between", gap: 8, color: grey900, fontSize: 13, fontWeight: 800 }}>
              상세 내용 <span style={{ color: details.length >= 1000 ? "#e42939" : grey400, fontSize: 11 }}>{details.length}/1000</span>
            </span>
            <textarea
              aria-label="신고 상세 내용"
              value={details}
              onChange={(event) => { setDetails(event.target.value.slice(0, 1000)); setError(""); }}
              placeholder="운영팀이 확인할 수 있도록 상황을 적어 주세요."
              style={{ width: "100%", minHeight: 112, marginTop: 8, padding: "12px 13px", resize: "vertical", borderRadius: 8, border: `1px solid ${grey200}`, outline: "none", background: grey100, color: grey900, fontSize: 13, lineHeight: "19px", boxSizing: "border-box" }}
            />
          </label>
          <p style={{ margin: "8px 0 0", color: grey500, fontSize: 11.5, lineHeight: "17px" }}>닉네임이나 이메일을 따로 입력할 필요 없이 서버에서 사용자와 채팅 정보를 확인해요.</p>
        </div>
      )}

      {error ? <InfoBanner tone="danger" style={{ marginTop: 12 }}>{error}</InfoBanner> : null}
    </ConfirmBottomSheet>
  );
}
