import { useEffect, useState } from "react";
import type React from "react";

type AnimatedProgressFillProps = {
  value: number;
  style?: React.CSSProperties;
};

function clampProgress(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export default function AnimatedProgressFill({ value, style }: AnimatedProgressFillProps) {
  const target = clampProgress(value);
  const [displayedValue, setDisplayedValue] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setDisplayedValue(target));
    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  return (
    <span
      aria-hidden
      className="damara-progress-fill"
      style={{
        display: "block",
        width: `${displayedValue}%`,
        height: "100%",
        ...style,
      }}
    />
  );
}
