import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { toast } from "sonner";

import { getFaqs } from "../../features/user/api/serviceApi";
import type { ApiFaq } from "../../shared/api/swaggerTypes";
import ListRow from "../../shared/components/damara/ListRow";
import { blue500, grey400, grey700, HOME_BORDER } from "../../shared/constants/homeTheme";
import { AccountServiceShell, bodyText, sectionTitle, serviceCard, softInfoBox } from "./AccountServiceShell";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<ApiFaq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaqs()
      .then(({ data }) => {
        const items = Array.isArray(data?.faqs) ? data.faqs : [];
        setFaqs(items);
        setOpenId(items[0]?.id ?? null);
      })
      .catch(() => toast.error("FAQ를 불러오지 못했어요."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountServiceShell title="FAQ" subtitle="자주 묻는 질문을 빠르게 확인해요.">
      <div style={softInfoBox}>거래 전 수령 장소와 마감일을 확인하면 대부분의 문제를 줄일 수 있어요.</div>
      <h2 style={sectionTitle}>자주 묻는 질문</h2>
      <div style={serviceCard}>
        {loading ? (
          <p style={{ ...bodyText, padding: 16 }}>FAQ를 불러오는 중이에요.</p>
        ) : faqs.length === 0 ? (
          <p style={{ ...bodyText, padding: 16 }}>등록된 FAQ가 없어요.</p>
        ) : (
          faqs.map((item, index) => {
            const open = openId === item.id;
            return (
              <div key={item.id} style={{ borderTop: index === 0 ? 0 : `1px solid ${HOME_BORDER}` }}>
                <ListRow
                  compact
                  left={<HelpCircle size={18} color={open ? blue500 : grey400} />}
                  title={item.question}
                  right={open ? <ChevronUp size={17} color={grey400} /> : <ChevronDown size={17} color={grey400} />}
                  showDivider={false}
                  onClick={() => setOpenId(open ? null : item.id)}
                />
                {open ? <p style={{ ...bodyText, padding: "0 16px 15px 44px", color: grey700 }}>{item.answer}</p> : null}
              </div>
            );
          })
        )}
      </div>
    </AccountServiceShell>
  );
}
