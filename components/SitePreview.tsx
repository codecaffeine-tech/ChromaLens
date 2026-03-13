"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtractedColor, PresetPalette } from "@/types";
import { hexToRgb } from "@/lib/colorUtils";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface SitePreviewProps {
  originalColors: ExtractedColor[];
  selectedPalette: PresetPalette;
  screenshot?: string;
}

const ROLE_MAP: Record<ExtractedColor["category"], keyof PresetPalette["colors"]> = {
  primary: "primary",
  secondary: "secondary",
  background: "background",
  text: "text",
  accent: "accent",
};

const CATEGORY_LABELS: Record<ExtractedColor["category"], string> = {
  primary: "주요색",
  accent: "강조색",
  secondary: "보조색",
  background: "배경색",
  text: "텍스트",
};

export default function SitePreview({
  originalColors,
  selectedPalette,
  screenshot,
}: SitePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);

  // 개별 색상별 체크박스
  const [enabledColors, setEnabledColors] = useState<Record<string, boolean>>(
    () => Object.fromEntries(originalColors.map((c) => [c.hex, true]))
  );

  const toggleColor = (hex: string) => {
    setEnabledColors((prev) => ({ ...prev, [hex]: !prev[hex] }));
  };

  const toggleAll = (value: boolean) => {
    setEnabledColors(Object.fromEntries(originalColors.map((c) => [c.hex, value])));
  };

  const allChecked = originalColors.every((c) => enabledColors[c.hex]);
  const enabledKey = originalColors.filter((c) => enabledColors[c.hex]).map((c) => c.hex).join(",");

  useEffect(() => {
    if (!screenshot) {
      setProcessedDataUrl(null);
      return;
    }

    setProcessing(true);
    setProcessedDataUrl(null);

    const timer = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        const activeColors = originalColors.filter((c) => enabledColors[c.hex]);

        if (activeColors.length > 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          const numColors = activeColors.length;
          const colorData = new Int32Array(numColors * 6);
          for (let i = 0; i < numColors; i++) {
            const c = activeColors[i];
            const newHex = selectedPalette.colors[ROLE_MAP[c.category]];
            const newRgb = hexToRgb(newHex);
            colorData[i * 6 + 0] = c.rgb.r;
            colorData[i * 6 + 1] = c.rgb.g;
            colorData[i * 6 + 2] = c.rgb.b;
            colorData[i * 6 + 3] = newRgb.r;
            colorData[i * 6 + 4] = newRgb.g;
            colorData[i * 6 + 5] = newRgb.b;
          }

          const THRESHOLD_SQ = 40 * 40;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            let bestDistSq = Infinity;
            let bestOffset = -1;

            for (let j = 0; j < numColors; j++) {
              const base = j * 6;
              const dr = r - colorData[base];
              const dg = g - colorData[base + 1];
              const db = b - colorData[base + 2];
              const distSq = dr * dr + dg * dg + db * db;
              if (distSq < bestDistSq) {
                bestDistSq = distSq;
                bestOffset = base;
              }
            }

            if (bestDistSq <= THRESHOLD_SQ && bestOffset >= 0) {
              data[i] = colorData[bestOffset + 3];
              data[i + 1] = colorData[bestOffset + 4];
              data[i + 2] = colorData[bestOffset + 5];
            }
          }

          ctx.putImageData(imageData, 0, 0);
        }

        setProcessedDataUrl(canvas.toDataURL("image/png"));
        setProcessing(false);
      };
      img.src = screenshot;
    }, 50);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenshot, selectedPalette.id, enabledKey]);

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        테마 미리보기: {selectedPalette.name}
      </h2>

      <div className="flex gap-4 items-start">
        {/* 좌측: 색상 매핑 패널 */}
        <div className="w-60 flex-shrink-0 bg-gray-800/50 rounded-xl p-3 flex flex-col gap-2">
          {/* 헤더 + 전체 선택 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">색상 매핑</span>
            <button
              onClick={() => toggleAll(!allChecked)}
              className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
            >
              {allChecked ? "전체 해제" : "전체 선택"}
            </button>
          </div>

          {/* 색상 목록 */}
          <div className="space-y-1 max-h-[440px] overflow-y-auto pr-0.5">
            {originalColors.map((color) => {
              const newHex = selectedPalette.colors[ROLE_MAP[color.category]];
              const isEnabled = enabledColors[color.hex];
              return (
                <label
                  key={color.hex}
                  className={`flex items-center gap-1.5 cursor-pointer rounded-lg px-1.5 py-1 transition-all hover:bg-gray-700/40 ${isEnabled ? "" : "opacity-35"}`}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleColor(color.hex)}
                    className="w-3 h-3 flex-shrink-0 cursor-pointer accent-violet-500"
                  />
                  {/* 원본 스워치 */}
                  <div
                    className="w-4 h-4 rounded flex-shrink-0 border border-white/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] font-mono text-gray-400 w-[52px] flex-shrink-0">
                    {color.hex}
                  </span>
                  {/* 화살표 */}
                  <svg className="w-2.5 h-2.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  {/* 교체 스워치 */}
                  <div
                    className="w-4 h-4 rounded flex-shrink-0 border border-white/10"
                    style={{ backgroundColor: newHex }}
                  />
                  {/* 카테고리 뱃지 */}
                  <span className="text-[9px] text-gray-600 truncate">
                    {CATEGORY_LABELS[color.category]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 우측: 비포/애프터 슬라이더 */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-700 relative">
          {/* 원본 스크린샷 — 항상 렌더링해서 컨테이너 높이 확보 */}
          {screenshot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={screenshot} alt="스크린샷" className="w-full h-auto block" />
          )}

          {/* 처리 중 오버레이 */}
          {processing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/75">
              <div className="w-8 h-8 relative mb-2">
                <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-xs text-gray-300">색상 교체 중...</p>
            </div>
          )}

          {/* 처리 완료 시 슬라이더로 덮기 */}
          {screenshot && processedDataUrl && !processing && (
            <div className="absolute inset-0">
              <BeforeAfterSlider
                before={screenshot}
                after={processedDataUrl}
                afterLabel={selectedPalette.name}
              />
            </div>
          )}
        </div>
      </div>

      {/* 픽셀 연산 전용 숨김 캔버스 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
