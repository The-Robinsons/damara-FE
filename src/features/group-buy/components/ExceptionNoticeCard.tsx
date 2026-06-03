import React from "react";
import { AlertTriangle, Package, PackageX, TrendingUp } from "lucide-react";
import type { EnhancedPostFields } from "../utils/enhancedPostMapper";
import { ExceptionStatus } from "../../../types/groupBuy";

interface ExceptionNoticeCardProps {
  data: EnhancedPostFields;
}

export default function ExceptionNoticeCard({ data }: ExceptionNoticeCardProps) {
  const status = data.exceptionStatus;
  if (!status || status === "NONE") return null;

  type IconMap = Record<Exclude<ExceptionStatus, "NONE">, { Icon: React.ElementType; title: string }>;
  const config: IconMap = {
    PRICE_REAPPROVAL_REQUIRED: {
      Icon: TrendingUp,
      title: "가격이 변경되어 재승인이 필요합니다",
    },
    OUT_OF_STOCK: {
      Icon: PackageX,
      title: "구매 예정 상품이 품절되었습니다",
    },
    DAMAGED_ITEM: {
      Icon: Package,
      title: "일부 물품이 파손되었습니다",
    },
    DISPUTE_IN_PROGRESS: {
      Icon: AlertTriangle,
      title: "현재 거래 분쟁 처리 중입니다",
    },
  };

  const item = config[status as Exclude<ExceptionStatus, "NONE">];
  if (!item) return null;
  const Icon = item.Icon;

  return (
    <div data-card="exception-notice" data-status={status}>
      <div>
        <Icon aria-hidden />
        <span>{item.title}</span>
      </div>

      {status === "PRICE_REAPPROVAL_REQUIRED" &&
        data.originalPrice &&
        data.changedPrice && (
          <div>
            <div>
              <div>기존 가격</div>
              <div>
                <s>{data.originalPrice.toLocaleString()}원</s>
              </div>
            </div>
            <div aria-hidden>→</div>
            <div>
              <div>변경 가격</div>
              <div>{data.changedPrice.toLocaleString()}원</div>
            </div>
          </div>
        )}

      {status === "DAMAGED_ITEM" && (
        <div>
          {data.damagedItemCount !== undefined && (
            <div>
              파손 수량: <strong>{data.damagedItemCount}개</strong>
            </div>
          )}
          {data.adjustedPrice !== undefined && (
            <div>
              조정 가격: <strong>{data.adjustedPrice.toLocaleString()}원/인</strong>
            </div>
          )}
        </div>
      )}

      <div>
        {status === "PRICE_REAPPROVAL_REQUIRED" && "채팅을 통해 재승인 여부를 결정해주세요."}
        {status === "OUT_OF_STOCK" && "자동 취소 또는 대체 상품 안내가 필요합니다."}
        {status === "DAMAGED_ITEM" && "파손 수량과 조정 금액을 확인 후 채팅으로 협의하세요."}
        {status === "DISPUTE_IN_PROGRESS" && "분쟁 해결까지 거래가 보류됩니다. 관리자 문의를 이용해주세요."}
      </div>
    </div>
  );
}
