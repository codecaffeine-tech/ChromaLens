"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtractedColor, PresetPalette } from "@/types";
import { hexToRgb } from "@/lib/colorUtils";

interface SitePreviewProps {
  originalColors: ExtractedColor[];
  selectedPalette: PresetPalette;
  screenshot?: string;
  onProcessed?: (dataUrl: string) => void;
}

const ROLE_MAP: Record<ExtractedColor["category"], keyof PresetPalette["colors"]> = {
  primary: "primary",
  secondary: "secondary",
  background: "background",
  text: "text",
  accent: "accent",
};

export default function SitePreview({
  originalColors,
  selectedPalette,
  screenshot,
  onProcessed,
}: SitePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);

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
      return;
    }

    setProcessing(true);

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

        onProcessed?.(canvas.toDataURL("image/png"));
        setProcessing(false);
      };
      img.src = screenshot;
    }, 50);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenshot, selectedPalette.id, enabledKey]);

  return (
    <div className="w-full">
      {/* 색상 매핑 패널 */}
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3 flex flex-col gap-2 border border-gray-200 dark:border-transparent">
        {/* 헤더 + 전체 선택 + 처리 중 표시 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">색상 매핑</span>
            {processing && (
              <span className="flex items-center gap-1 text-[10px] text-violet-400">
                <span className="w-2.5 h-2.5 relative inline-block">
                  <span className="absolute inset-0 rounded-full border-2 border-gray-600" />
                  <span className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                </span>
                처리 중...
              </span>
            )}
          </div>
          <button
            onClick={() => toggleAll(!allChecked)}
            className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
          >
            {allChecked ? "전체 해제" : "전체 선택"}
          </button>
        </div>

        {/* 색상 목록 — 가로 wrap */}
        <div className="flex flex-wrap gap-1">
          {originalColors.map((color) => {
            const newHex = selectedPalette.colors[ROLE_MAP[color.category]];
            const isEnabled = enabledColors[color.hex];
            return (
              <label
                key={color.hex}
                className={`flex items-center gap-1 cursor-pointer rounded-lg px-1.5 py-1 transition-all hover:bg-gray-200/60 dark:hover:bg-gray-700/40 ${isEnabled ? "" : "opacity-35"}`}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleColor(color.hex)}
                  className="w-3 h-3 flex-shrink-0 cursor-pointer accent-violet-500"
                />
                <div
                  className="w-4 h-4 rounded flex-shrink-0 border border-white/10"
                  style={{ backgroundColor: color.hex }}
                />
                <svg className="w-2 h-2 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div
                  className="w-4 h-4 rounded flex-shrink-0 border border-white/10"
                  style={{ backgroundColor: newHex }}
                />
                <span className="text-[9px] font-mono text-gray-500">{color.hex}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 픽셀 연산 전용 숨김 캔버스 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
