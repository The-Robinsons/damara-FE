import {
  GroupBuyType,
  GroupBuyStatus,
  GROUP_BUY_TYPE_LABEL,
  GROUP_BUY_STATUS_LABEL,
} from "../../../types/groupBuy";

interface GroupBuyTypeBadgeProps {
  type?: GroupBuyType | string | null;
  size?: "sm" | "md";
}

export function GroupBuyTypeBadge({ type }: GroupBuyTypeBadgeProps) {
  if (!type) return null;

  const isPreRecruit = type === "PRE_RECRUIT";
  const label =
    GROUP_BUY_TYPE_LABEL[type as GroupBuyType] ??
    (isPreRecruit ? "선 모집" : "후 모집");

  return (
    <span data-type={type}>
      {label}
    </span>
  );
}

interface GroupBuyStatusBadgeProps {
  status?: GroupBuyStatus | string | null;
  size?: "sm" | "md";
}

export function GroupBuyStatusBadge({ status }: GroupBuyStatusBadgeProps) {
  if (!status) return null;

  const label = GROUP_BUY_STATUS_LABEL[status as GroupBuyStatus] ?? status;

  return <span data-status={status}>{label}</span>;
}

interface ReceiptVerifiedBadgeProps {
  verified?: boolean;
  size?: "sm" | "md";
}

export function ReceiptVerifiedBadge({ verified }: ReceiptVerifiedBadgeProps) {
  if (verified === undefined || verified === null) return null;

  return (
    <span data-verified={verified}>
      {verified ? "영수증 인증" : "미인증"}
    </span>
  );
}
