"use client";

import { useState } from "react";
import type { ExtractedColor, ColorFormat } from "@/types";
import { formatColor, getContrastColor } from "@/lib/colorUtils";

interface ColorPaletteProps {
  colors: ExtractedColor[];
}

const CATEGORY_ORDER: ExtractedColor["category"][] = [
  "primary",
  "accent",
  "secondary",
  "background",
  "text",
];

const categoryLabels: Record<ExtractedColor["category"], string> = {
  accent: "강조색",
  primary: "주요색",
  secondary: "보조색",
  background: "배경색",
  text: "텍스트",
};

export default function ColorPalette({ colors }: ColorPaletteProps) {
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: ExtractedColor) => {
    const value = formatColor(color, format);
    navigator.clipboard.writeText(value).then(() => {
      setCopiedColor(value);
      setTimeout(() => setCopiedColor(null), 1500);
    });
  };

  const formatLabels: Record<ColorFormat, string> = {
    hex: "HEX",
    rgb: "RGB",
    hsl: "HSL",
  };

  // 카테고리 순서대로 그룹핑
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    colors: colors.filter((c) => c.category === cat),
  })).filter((g) => g.colors.length > 0);

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">추출된 색상</h2>
        <div className="flex gap-1 bg-gray-200/70 dark:bg-gray-800 rounded-lg p-1">
          {(["hex", "rgb", "hsl"] as ColorFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                format === f
                  ? "bg-violet-600 text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {formatLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* 비율 바 */}
      <div className="flex w-full h-6 rounded-lg overflow-hidden mb-6 border border-gray-300 dark:border-gray-700">
        {colors.slice(0, 12).map((color) => (
          <div
            key={color.hex}
            style={{
              backgroundColor: color.hex,
              width: `${color.percentage}%`,
              minWidth: "2%",
            }}
            title={`${color.hex} (${color.percentage}%)`}
            className="transition-all duration-300"
          />
        ))}
      </div>

      {/* 카테고리별 섹션 */}
      <div className="space-y-6">
        {grouped.map(({ category, label, colors: groupColors }) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-600">
                {groupColors.length}개
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {groupColors.map((color) => {
                const displayValue = formatColor(color, format);
                const textColor = getContrastColor(color.hex);
                const isCopied = copiedColor === displayValue;

                return (
                  <button
                    key={color.hex}
                    onClick={() => handleCopy(color)}
                    className="group relative rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 border border-white/10"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="p-2.5 h-[72px] flex flex-col justify-between">
                      <p
                        className="text-[11px] font-mono font-semibold truncate"
                        style={{ color: textColor }}
                      >
                        {isCopied ? "복사됨!" : displayValue}
                      </p>
                      <p
                        className="text-[10px] opacity-60"
                        style={{ color: textColor }}
                      >
                        {color.percentage}%
                      </p>
                    </div>

                    {/* hover 복사 오버레이 */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor:
                          textColor === "#000000"
                            ? "rgba(0,0,0,0.08)"
                            : "rgba(255,255,255,0.12)",
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        style={{ color: textColor }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
