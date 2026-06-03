import React from "react";
import { Gift } from "lucide-react";
import type { EnhancedPostFields } from "../utils/enhancedPostMapper";
import { TradeMethodBadge } from "./TrustBadges";
import { TRADE_METHOD_DESC } from "../../../types/groupBuy";

interface TradeMethodCardProps {
  data: EnhancedPostFields;
}

export default function TradeMethodCard({ data }: TradeMethodCardProps) {
  if (!data.tradeMethod) return null;

  const isDamaraZone = data.tradeMethod === "DAMARA_ZONE";

  return (
    <div data-card="trade-method">
      <div>
        <span>거래 방식</span>
        <TradeMethodBadge method={data.tradeMethod} size="xs" />
      </div>

      <p>{TRADE_METHOD_DESC[data.tradeMethod]}</p>

      {isDamaraZone && data.damaraZoneName && (
        <div data-zone="damara">
          <div>
            
            <span>{data.damaraZoneName}</span>
            <span>공식 접선지</span>
          </div>
          {data.damaraZoneDescription && (
            <p>{data.damaraZoneDescription}</p>
          )}
        </div>
      )}

      {data.pickupTimeText && (
        <div>
          
          <span>
            수령 예정: <strong>{data.pickupTimeText}</strong>
          </span>
        </div>
      )}

      {data.deliveryIncentiveText && (
        <div data-incentive="true">
          <Gift aria-hidden />
          {data.deliveryIncentiveText}
        </div>
      )}
    </div>
  );
}
