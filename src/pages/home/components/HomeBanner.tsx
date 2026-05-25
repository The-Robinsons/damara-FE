import { useEffect, useRef, useState } from "react";
import type React from "react";

import banner1 from "../../../assets/banner_1 1.png";
import banner2 from "../../../assets/banner-2.png";
import banner3 from "../../../assets/banner-3.png";
import banner4 from "../../../assets/banner-4.png";
import banner5 from "../../../assets/banner-5.png";
import banner6 from "../../../assets/banner6.png";

const BANNERS = [
  { src: banner1, alt: "믿고 함께 사는 명지대 공동구매 플랫폼 다마라" },
  { src: banner2, alt: "명지대 공동구매 배너 2" },
  { src: banner3, alt: "명지대 공동구매 배너 3" },
  { src: banner4, alt: "명지대 공동구매 배너 4" },
  { src: banner5, alt: "명지대 공동구매 배너 5" },
  { src: banner6, alt: "명지대 공동구매 배너 6" },
] as const;

const AUTO_PLAY_MS = 3600;
const SWIPE_THRESHOLD_PX = 42;

export default function HomeBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const startXRef = useRef<number | null>(null);

  useEffect(() => {
    BANNERS.forEach((banner) => {
      const image = new Image();
      image.src = banner.src;
    });
  }, []);

  useEffect(() => {
    if (isDragging) return;

    const id = window.setInterval(() => {
      setActiveIndex((idx) => (idx + 1) % BANNERS.length);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(id);
  }, [isDragging]);

  const moveBy = (delta: number) => {
    setActiveIndex((idx) => (idx + delta + BANNERS.length) % BANNERS.length);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const startX = startXRef.current;
    startXRef.current = null;
    setIsDragging(false);

    if (startX === null) return;

    const diffX = e.clientX - startX;
    if (Math.abs(diffX) < SWIPE_THRESHOLD_PX) return;
    moveBy(diffX < 0 ? 1 : -1);
  };

  return (
    <section
      aria-label="캠퍼스 공동구매 배너"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        startXRef.current = null;
        setIsDragging(false);
      }}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: 138,
        borderRadius: 24,
        background: "linear-gradient(135deg, #6b42ec 0%, #6453f4 46%, #87b5ff 100%)",
        boxShadow: "0 14px 32px rgba(49, 130, 246, 0.12), 0 2px 8px rgba(25, 31, 40, 0.05)",
        border: "1px solid #E5E8EF",
        touchAction: "pan-y",
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {!loaded[BANNERS[activeIndex].src] ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 850,
            lineHeight: "25px",
            letterSpacing: 0,
          }}
        >
          DAMARA
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          width: `${BANNERS.length * 100}%`,
          height: "100%",
          transform: `translateX(-${activeIndex * (100 / BANNERS.length)}%)`,
          transition: isDragging ? "none" : "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {BANNERS.map((banner, idx) => (
          <img
            key={banner.src}
            src={banner.src}
            alt={banner.alt}
            decoding="async"
            loading="eager"
            fetchPriority={idx === 0 ? "high" : "auto"}
            draggable={false}
            onLoad={() => setLoaded((prev) => ({ ...prev, [banner.src]: true }))}
            style={{
              display: "block",
              width: `${100 / BANNERS.length}%`,
              height: "100%",
              flexShrink: 0,
              objectFit: "cover",
              objectPosition: "center",
              opacity: loaded[banner.src] ? 1 : 0,
              userSelect: "none",
              transition: "opacity 0.18s ease",
            }}
          />
        ))}
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, rgba(44, 29, 135, 0.10) 0%, rgba(44, 29, 135, 0.00) 48%, rgba(255, 255, 255, 0.08) 100%)",
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          bottom: 8,
          display: "flex",
          gap: 4,
          transform: "translateX(-50%)",
          padding: "3px 7px",
          borderRadius: 999,
          background: "rgba(25, 31, 40, 0.18)",
          backdropFilter: "blur(8px)",
        }}
      >
        {BANNERS.map((banner, idx) => (
          <button
            key={`${banner.src}-dot`}
            type="button"
            aria-label={`${idx + 1}번 배너 보기`}
            onClick={() => setActiveIndex(idx)}
            style={{
              width: idx === activeIndex ? 15 : 5,
              height: 5,
              padding: 0,
              border: 0,
              borderRadius: 999,
              background: idx === activeIndex ? "#fff" : "rgba(255,255,255,0.56)",
              cursor: "pointer",
              transition: "width 0.2s ease, background-color 0.2s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}
