import React from "react";
import type { EnhancedPostFields } from "../utils/enhancedPostMapper";
import { VerificationBadge, TrustBadge } from "./TrustBadges";

interface TrustInfoCardProps {
  data: EnhancedPostFields;
  title?: string;
}

export default function TrustInfoCard({
  data,
  title = "신뢰 학점",
}: TrustInfoCardProps) {
  const score = data.trustScore ?? 0;
  const tier = score >= 90 ? "high" : score >= 70 ? "mid" : "low";

  return (
    <div data-card="trust-info">
      <div>
        <div>
          
          <div>
            <h3>{title}</h3>
            {data.verificationStatus && (
              <div>
                
                <span>본인인증 완료</span>
                <VerificationBadge status={data.verificationStatus} size="xs" />
              </div>
            )}
          </div>
        </div>
        {data.trustLevel && <TrustBadge level={data.trustLevel} size="sm" />}
      </div>

      {data.trustScore !== undefined && (
        <div>
          <div>
            <span>현재 학점</span>
            <div>
              <span data-tier={tier}>{score}</span>
              <span>점</span>
            </div>
          </div>
          <div role="progressbar" aria-valuenow={score}>
            <div data-progress={score} data-tier={tier} />
          </div>
        </div>
      )}

      <div>
        {[
          {
            label: "거래 완료",
            value: `${data.writerCompletedTradeCount ?? 0}회`,
            warn: false,
          },
          {
            label: "응답률",
            value: `${data.writerResponseRate ?? 0}%`,
            warn: false,
          },
          {
            label: "노쇼",
            value: `${data.writerNoShowCount ?? 0}회`,
            warn: (data.writerNoShowCount ?? 0) > 0,
          },
          {
            label: "거래 취소",
            value: `${data.writerCancelCount ?? 0}회`,
            warn: (data.writerCancelCount ?? 0) > 1,
          },
        ].map((item) => (
          <div key={item.label} data-warn={item.warn}>
            <div>
              <span>{item.label}</span>
            </div>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
