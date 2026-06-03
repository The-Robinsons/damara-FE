import type {
  ExceptionStatus,
  TradeMethod,
  TrustLevel,
  VerificationStatus,
} from "../../../types/groupBuy";

export interface EnhancedPostFields {
  trustScore?: number;
  trustLevel?: TrustLevel;
  writerCompletedTradeCount?: number;
  writerNoShowCount?: number;
  writerCancelCount?: number;
  writerResponseRate?: number;
  verificationStatus?: VerificationStatus;
  tradeMethod?: TradeMethod;
  damaraZoneName?: string;
  damaraZoneAddress?: string;
  damaraZoneDescription?: string;
  pickupTimeText?: string;
  deliveryIncentiveText?: string;
  agreementCancelPolicy?: string;
  agreementNoShowPolicy?: string;
  agreementPriceChangePolicy?: string;
  agreementOutOfStockPolicy?: string;
  agreementDamagePolicy?: string;
  exceptionStatus?: ExceptionStatus;
  originalPrice?: number;
  changedPrice?: number;
  damagedItemCount?: number;
  adjustedPrice?: number;
  isReapprovalRequired?: boolean;
}
