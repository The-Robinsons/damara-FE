import { useEffect, useState } from "react";
import type React from "react";
import { Bell, MessageCircle, Megaphone, Moon, Package } from "lucide-react";
import { toast } from "sonner";

import { getUserSettings, updateUserSettings } from "../../features/user/api/userApi";
import type { ApiUserSettings } from "../../shared/api/swaggerTypes";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { blue500, grey500, grey900, HOME_BORDER } from "../../shared/constants/homeTheme";
import { AccountServiceShell, bodyText, sectionTitle, serviceCard } from "./AccountServiceShell";

const DEFAULT_SETTINGS: ApiUserSettings = {
  pushEnabled: true,
  chatNotificationEnabled: true,
  postNotificationEnabled: true,
  marketingNotificationEnabled: false,
  quietHoursEnabled: false,
  quietHoursStart: "23:00",
  quietHoursEnd: "08:00",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) return;
    getUserSettings(userId)
      .then(({ data }) => setSettings(data))
      .catch(() => toast.error("설정을 불러오지 못했어요."));
  }, []);

  const toggle = async (key: keyof ApiUserSettings) => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId || typeof settings[key] !== "boolean") {
      toast.error("로그인이 필요해요.");
      return;
    }
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setSaving(true);
    try {
      const { data } = await updateUserSettings(userId, next);
      setSettings(data);
    } catch {
      setSettings(settings);
      toast.error("설정을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountServiceShell title="설정" subtitle="알림과 방해금지 시간을 관리해요.">
      <h2 style={{ ...sectionTitle, marginTop: 0 }}>알림</h2>
      <div style={serviceCard}>
        <SettingToggle icon={<Bell size={18} color={blue500} />} title="전체 푸시 알림" checked={settings.pushEnabled} onChange={() => toggle("pushEnabled")} />
        <SettingToggle icon={<MessageCircle size={18} color={blue500} />} title="채팅 알림" checked={settings.chatNotificationEnabled} onChange={() => toggle("chatNotificationEnabled")} />
        <SettingToggle icon={<Package size={18} color={blue500} />} title="공구 알림" checked={settings.postNotificationEnabled} onChange={() => toggle("postNotificationEnabled")} />
        <SettingToggle icon={<Megaphone size={18} color={blue500} />} title="이벤트 알림" checked={settings.marketingNotificationEnabled} onChange={() => toggle("marketingNotificationEnabled")} />
        <SettingToggle icon={<Moon size={18} color={blue500} />} title="방해 금지" desc={`${settings.quietHoursStart} ~ ${settings.quietHoursEnd}`} checked={settings.quietHoursEnabled} onChange={() => toggle("quietHoursEnabled")} last />
      </div>
      <p style={{ ...bodyText, margin: "14px 2px 0", color: grey500 }}>
        {saving ? "설정을 저장하는 중이에요." : "설정은 계정에 저장되어 다른 기기에서도 유지돼요."}
      </p>
    </AccountServiceShell>
  );
}

function SettingToggle({
  icon,
  title,
  desc,
  checked,
  onChange,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  checked: boolean;
  onChange: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: "100%",
        minHeight: 58,
        padding: "12px 16px",
        border: 0,
        borderBottom: last ? 0 : `1px solid ${HOME_BORDER}`,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        gap: 12,
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <span style={{ width: 32, height: 32, borderRadius: 10, background: "#f2f7ff", display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", color: grey900, fontSize: 13, fontWeight: 750 }}>{title}</span>
        {desc ? <span style={{ display: "block", marginTop: 3, color: grey500, fontSize: 11 }}>{desc}</span> : null}
      </span>
      <span aria-hidden style={{ width: 42, height: 24, borderRadius: 999, background: checked ? blue500 : "#d1d6db", padding: 2 }}>
        <span style={{ display: "block", width: 20, height: 20, borderRadius: 999, background: "#fff", transform: checked ? "translateX(18px)" : "translateX(0)", transition: "150ms ease-out" }} />
      </span>
    </button>
  );
}
