import { AlertTriangle, ShieldAlert } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ROUTES } from "../../app/router/routes";
import ActionButton from "../../shared/components/damara/ActionButton";
import SurfaceCard from "../../shared/components/damara/SurfaceCard";
import { deleteUser } from "../../features/user/api/userApi";
import { DANGER, DANGER_BG, grey500, grey700, grey900 } from "../../shared/constants/homeTheme";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { AccountServiceShell, bodyText } from "./AccountServiceShell";

export default function WithdrawPage() {
  const nav = useNavigate();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const withdraw = async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      toast.error("로그인 정보를 찾을 수 없어요.");
      nav(ROUTES.LOGIN, { replace: true });
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userId);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      toast.success("회원 탈퇴가 완료됐어요.");
      nav(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("탈퇴 처리에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountServiceShell title="회원 탈퇴" subtitle="계정과 연결된 기록을 삭제해요.">
      <SurfaceCard padding={18}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: DANGER_BG, color: DANGER, display: "grid", placeItems: "center" }}>
          <ShieldAlert size={24} />
        </div>
        <h2 style={{ margin: "16px 0 0", color: grey900, fontSize: 20, lineHeight: "28px", fontWeight: 900 }}>
          탈퇴 전 확인해 주세요
        </h2>
        <p style={{ ...bodyText, marginTop: 8, color: grey700 }}>
          탈퇴하면 계정 정보와 연결 기록이 삭제되며, 복구가 어려울 수 있어요.
        </p>
      </SurfaceCard>

      <SurfaceCard padding="14px 16px" style={{ marginTop: 12, display: "grid", gap: 12 }}>
        <Warn text="진행 중인 공구가 있다면 먼저 거래를 마무리해 주세요." />
        <Warn text="작성한 게시글, 참여 기록, 관심목록이 계정에서 분리돼요." />
        <Warn text="탈퇴 후 같은 계정으로 다시 로그인하려면 재가입이 필요할 수 있어요." />
      </SurfaceCard>

      <button
        type="button"
        onClick={() => setChecked((value) => !value)}
        style={{
          marginTop: 14,
          width: "100%",
          border: 0,
          borderRadius: 10,
          background: "#fff",
          padding: "13px 14px",
          display: "flex",
          alignItems: "center",
          gap: 9,
          color: grey700,
          fontSize: 13,
          fontWeight: 750,
          cursor: "pointer",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            border: `1.5px solid ${checked ? DANGER : "#d1d6db"}`,
            background: checked ? DANGER : "#fff",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {checked ? "✓" : ""}
        </span>
        안내 내용을 확인했어요.
      </button>

      <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
        <ActionButton disabled={!checked || loading} onClick={() => void withdraw()} style={{ width: "100%", height: 48, background: DANGER }}>
          {loading ? "처리 중..." : "탈퇴하기"}
        </ActionButton>
        <ActionButton variant="ghost" size="compact" onClick={() => nav(-1)} style={{ width: "100%", height: 46, color: grey500 }}>
          취소
        </ActionButton>
      </div>
    </AccountServiceShell>
  );
}

function Warn({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 9, color: grey500, fontSize: 12.5, lineHeight: "18px", fontWeight: 650 }}>
      <AlertTriangle size={16} color={DANGER} style={{ flexShrink: 0, marginTop: 1 }} />
      {text}
    </div>
  );
}
