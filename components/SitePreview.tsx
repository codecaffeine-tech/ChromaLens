"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtractedColor, PresetPalette } from "@/types";
import { hexToRgb } from "@/lib/colorUtils";
import { getContrastColor } from "@/lib/colorUtils";

interface SitePreviewProps {
  originalColors: ExtractedColor[];
  selectedPalette: PresetPalette;
  siteUrl: string;
  screenshot?: string;
  onProcessed?: (dataUrl: string | null) => void;
}

type CategoryEnabled = Record<ExtractedColor["category"], boolean>;

interface ColorRole {
  label: string;
  category: ExtractedColor["category"];
  role: keyof PresetPalette["colors"];
  originalColor: ExtractedColor | undefined;
  newColor: string;
}

// 카테고리별 팔레트 색상 매핑
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
  siteUrl,
  screenshot,
  onProcessed,
}: SitePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [enabled, setEnabled] = useState<CategoryEnabled>({
    primary: true, accent: true, secondary: true, background: true, text: true,
  });

  const toggleCategory = (cat: ExtractedColor["category"]) => {
    setEnabled((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // 체크된 카테고리를 deps 키로 변환 (primitive string)
  const enabledKey = (["primary", "accent", "secondary", "background", "text"] as const)
    .filter((c) => enabled[c])
    .join(",");

  // screenshot + 팔레트 + 체크박스가 바뀔 때마다 Canvas 픽셀 치환 실행
  useEffect(() => {
    if (!screenshot) {
      onProcessed?.(null);
      return;
    }

    setProcessing(true);
    setCanvasReady(false);
    onProcessed?.(null);

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

        // 체크된 카테고리의 색상만 교체
        const activeColors = originalColors.filter((c) => enabled[c.category]);

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
        setCanvasReady(true);
      };
      img.src = screenshot;
    }, 50);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenshot, selectedPalette.id, enabledKey]);

  // 카테고리 라벨 (한글)
  const categoryLabels: Record<ExtractedColor["category"], string> = {
    primary: "주요색",
    accent: "강조색",
    secondary: "보조색",
    background: "배경색",
    text: "텍스트",
  };

  const roles: ColorRole[] = (["primary", "accent", "secondary", "background", "text"] as const).map(
    (cat) => ({
      label: categoryLabels[cat],
      category: cat,
      role: ROLE_MAP[cat],
      originalColor: originalColors.find((c) => c.category === cat),
      newColor: selectedPalette.colors[ROLE_MAP[cat]],
    })
  );

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        테마 미리보기: {selectedPalette.name}
      </h2>

      {/* Color mapping table */}
      <div className="mb-6 bg-gray-800/50 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-3">색상 매핑 — 체크한 항목만 미리보기에 적용됩니다</p>
        <div className="space-y-2">
          {roles.map(({ label, category, originalColor, newColor }) => {
            const isEnabled = enabled[category];
            return (
              <div key={label} className={`flex items-center gap-3 transition-opacity ${isEnabled ? "" : "opacity-40"}`}>
                <input
                  type="checkbox"
                  id={`swap-${category}`}
                  checked={isEnabled}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 cursor-pointer accent-violet-500 flex-shrink-0"
                />
                <label
                  htmlFor={`swap-${category}`}
                  className="text-xs text-gray-400 w-14 cursor-pointer select-none"
                >
                  {label}
                </label>

                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-gray-600"
                    style={{ backgroundColor: originalColor?.hex ?? "#888" }}
                  />
                  <span className="text-xs font-mono text-gray-500">
                    {originalColor?.hex ?? "N/A"}
                  </span>
                </div>

                <svg className="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-gray-600"
                    style={{ backgroundColor: newColor }}
                  />
                  <span className="text-xs font-mono text-gray-500">{newColor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas 스크린샷 미리보기 */}
      {screenshot && (
        <div className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl relative">
          {/* 처리 중 오버레이 */}
          {processing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/80">
              <div className="w-10 h-10 relative mb-3">
                <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-sm text-gray-300">색상 교체 중...</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-auto block"
            style={{ display: canvasReady || processing ? "block" : "none" }}
          />
          {/* 처리 전 원본 이미지 (canvas 준비되기 전까지 표시) */}
          {!canvasReady && !processing && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshot}
              alt="스크린샷"
              className="w-full h-auto block"
            />
          )}
        </div>
      )}

      {/* screenshot 없을 때 Mock UI fallback */}
      {!screenshot && (
        <div
          className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl"
          style={{ backgroundColor: selectedPalette.colors.background }}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: selectedPalette.colors.primary }}
          >
            <div className="w-5 h-5 rounded" style={{ backgroundColor: selectedPalette.colors.accent }} />
            <span className="text-sm font-semibold" style={{ color: getContrastColor(selectedPalette.colors.primary) }}>
              {new URL(siteUrl.startsWith("http") ? siteUrl : "https://" + siteUrl).hostname}
            </span>
          </div>
          <div className="px-6 py-8">
            <p className="text-sm" style={{ color: selectedPalette.colors.text }}>
              <strong>{selectedPalette.name}</strong> 테마 미리보기
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
