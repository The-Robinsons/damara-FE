import React from "react";
import {
  TrustLevel,
  VerificationStatus,
  TradeMethod,
  ExceptionStatus,
  VERIFICATION_STATUS_LABEL,
  TRADE_METHOD_LABEL,
  EXCEPTION_STATUS_LABEL,
} from "../../../types/groupBuy";

type BadgeSize = "xs" | "sm" | "md";

export function TrustBadge({
  level,
}: {
  level?: TrustLevel | null;
  size?: BadgeSize;
}) {
  if (!level) return null;

  const labelMap: Record<TrustLevel, string> = {
    HIGH: "신뢰 높음",
    NORMAL: "보통",
    LOW: "주의",
  };

  return <span data-trust-level={level}>{labelMap[level]}</span>;
}

export function VerificationBadge({
  status,
}: {
  status?: VerificationStatus | null;
  size?: BadgeSize;
}) {
  if (!status) return null;

  return (
    <span data-verification-status={status}>
      
      {VERIFICATION_STATUS_LABEL[status]}
    </span>
  );
}

export function TradeMethodBadge({
  method,
}: {
  method?: TradeMethod | null;
  size?: BadgeSize;
}) {
  if (!method) return null;

  return (
    <span data-trade-method={method}>
      {TRADE_METHOD_LABEL[method]}
    </span>
  );
}

export function DamaraZoneBadge(_props: { size?: BadgeSize } = {}) {
  return (
    <span data-damara-zone="true">
      
      다마라 존
    </span>
  );
}

export function ExceptionStatusBadge({
  status,
}: {
  status?: ExceptionStatus | null;
  size?: BadgeSize;
}) {
  if (!status || status === "NONE") return null;

  return (
    <span data-exception-status={status}>
      
      {EXCEPTION_STATUS_LABEL[status]}
    </span>
  );
}

export function TrustScoreBadge({
  score,
}: {
  score?: number | null;
  size?: BadgeSize;
}) {
  if (score === null || score === undefined) return null;

  const tier = score >= 90 ? "high" : score >= 70 ? "mid" : "low";

  return (
    <span data-trust-tier={tier}>
      
      {score}점
    </span>
  );
}
