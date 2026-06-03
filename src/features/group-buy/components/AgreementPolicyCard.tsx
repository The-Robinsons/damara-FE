import React, { useState } from "react";
import type { EnhancedPostFields } from "../utils/enhancedPostMapper";

interface AgreementPolicyCardProps {
  data: EnhancedPostFields;
  defaultOpen?: boolean;
}

export default function AgreementPolicyCard({
  data,
  defaultOpen = false,
}: AgreementPolicyCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const items = [
    { label: "참여 취소", value: data.agreementCancelPolicy },
    { label: "노쇼 기준", value: data.agreementNoShowPolicy },
    { label: "가격 변경", value: data.agreementPriceChangePolicy },
    { label: "품절 처리", value: data.agreementOutOfStockPolicy },
    { label: "파손 정산", value: data.agreementDamagePolicy },
  ].filter((i) => i.value);

  if (items.length === 0) return null;

  return (
    <div data-card="agreement-policy">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div>
          
          <span>사전 약속</span>
          <span>{items.length}개 항목</span>
        </div>
        
      </button>

      {open && (
        <div>
          {items.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
          <p>* 참여 시 위 약속에 동의한 것으로 간주됩니다</p>
        </div>
      )}
    </div>
  );
}
