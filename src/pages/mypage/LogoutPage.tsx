import { LogOut, MessageCircle, PackageCheck } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "../../app/router/routes";
import ActionButton from "../../shared/components/damara/ActionButton";
import SurfaceCard from "../../shared/components/damara/SurfaceCard";
import { blue50, blue600, grey500, grey900 } from "../../shared/constants/homeTheme";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { AccountServiceShell, bodyText } from "./AccountServiceShell";

export default function LogoutPage() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    nav(ROUTES.LOGIN, { replace: true });
  };

  return (
    <AccountServiceShell title="로그아웃" subtitle="이 기기에서 계정 연결을 해제해요.">
      <SurfaceCard padding={18}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: blue50, color: blue600, display: "grid", placeItems: "center" }}>
          <LogOut size={24} />
        </div>
        <h2 style={{ margin: "16px 0 0", color: grey900, fontSize: 20, lineHeight: "28px", fontWeight: 900 }}>
          로그아웃할까요?
        </h2>
        <p style={{ ...bodyText, marginTop: 8 }}>
          다시 로그인하면 내 공구, 관심목록, 채팅 내역을 이어서 볼 수 있어요.
        </p>
      </SurfaceCard>

      <SurfaceCard padding="14px 16px" style={{ marginTop: 12, display: "grid", gap: 12 }}>
        <Info icon={<PackageCheck size={17} />} text="진행 중인 공구는 그대로 유지돼요." />
        <Info icon={<MessageCircle size={17} />} text="채팅 내역은 계정에 저장돼요." />
      </SurfaceCard>

      <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
        <ActionButton onClick={logout} style={{ width: "100%", height: 48 }}>
          로그아웃
        </ActionButton>
        <ActionButton variant="ghost" size="compact" onClick={() => nav(-1)} style={{ width: "100%", height: 46, color: grey500 }}>
          취소
        </ActionButton>
      </div>
    </AccountServiceShell>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, color: grey500, fontSize: 12.5, lineHeight: "18px", fontWeight: 650 }}>
      <span style={{ color: blue600 }}>{icon}</span>
      {text}
    </div>
  );
}
