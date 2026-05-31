import { useEffect, useState } from "react";
import { Bell, ChevronRight, Megaphone } from "lucide-react";
import { toast } from "sonner";

import { getNotices } from "../../features/user/api/serviceApi";
import type { ApiNotice } from "../../shared/api/swaggerTypes";
import ListRow from "../../shared/components/damara/ListRow";
import { blue500, grey400, grey500 } from "../../shared/constants/homeTheme";
import { AccountServiceShell, bodyText, sectionTitle, serviceCard, softInfoBox } from "./AccountServiceShell";

export default function NoticePage() {
  const [notices, setNotices] = useState<ApiNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotices()
      .then(({ data }) => setNotices(Array.isArray(data?.notices) ? data.notices : []))
      .catch(() => toast.error("공지사항을 불러오지 못했어요."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountServiceShell title="공지사항" subtitle="서비스 소식과 운영 안내를 확인해요.">
      <div style={softInfoBox}>중요한 서비스 변경과 점검 일정을 이곳에서 알려드려요.</div>
      <h2 style={sectionTitle}>최근 소식</h2>
      <div style={serviceCard}>
        {loading ? (
          <p style={{ ...bodyText, padding: 16 }}>공지사항을 불러오는 중이에요.</p>
        ) : notices.length === 0 ? (
          <p style={{ ...bodyText, padding: 16 }}>등록된 공지사항이 없어요.</p>
        ) : (
          notices.map((notice, index) => (
            <ListRow
              key={notice.id}
              compact
              left={<Megaphone size={18} color={blue500} />}
              title={notice.title}
              description={notice.summary || notice.content}
              right={<ChevronRight size={15} color={grey400} />}
              showDivider={index !== notices.length - 1}
              onClick={() => toast.message(notice.content)}
            />
          ))
        )}
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: grey500 }}>
        <Bell size={15} />
        <p style={{ ...bodyText, color: grey500, fontSize: 12 }}>서버에 등록된 최신 공지를 표시해요.</p>
      </div>
    </AccountServiceShell>
  );
}
