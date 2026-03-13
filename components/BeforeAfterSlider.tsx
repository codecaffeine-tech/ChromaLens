"use client";

import { useRef, useState, useCallback } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  before,
  after,
  afterLabel,
}: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-col-resize select-none"
      onMouseDown={(e) => { isDragging.current = true; updatePos(e.clientX); }}
      onMouseMove={(e) => { if (isDragging.current) updatePos(e.clientX); }}
      onMouseUp={() => { isDragging.current = false; }}
      onMouseLeave={() => { isDragging.current = false; }}
      onTouchStart={(e) => { isDragging.current = true; updatePos(e.touches[0].clientX); }}
      onTouchMove={(e) => { if (isDragging.current) { updatePos(e.touches[0].clientX); e.preventDefault(); } }}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      {/* Before — 원본 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before} alt="원본" className="w-full h-auto block" draggable={false} />

      {/* After — 테마 적용, 왼쪽부터 sliderPos%만큼 노출 */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt="테마 적용" className="w-full h-auto block" draggable={false} />
      </div>

      {/* 구분선 */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      >
        {/* 드래그 핸들 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center pointer-events-auto cursor-col-resize">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* 레이블 */}
      <span className="absolute top-3 left-3 text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-full pointer-events-none">
        원본
      </span>
      {afterLabel && (
        <span className="absolute top-3 right-3 text-xs font-medium text-white bg-violet-600/80 px-2 py-1 rounded-full pointer-events-none">
          {afterLabel}
        </span>
      )}
    </div>
  );
}
