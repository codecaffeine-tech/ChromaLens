"use client";

import { useState } from "react";
import type { ExtractedColor, ColorFormat } from "@/types";
import { formatColor, getContrastColor } from "@/lib/colorUtils";

interface ColorPaletteProps {
  colors: ExtractedColor[];
}

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

  const categoryLabels: Record<ExtractedColor["category"], string> = {
    primary: "주요색",
    secondary: "보조색",
    background: "배경",
    text: "텍스트",
    accent: "강조색",
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-200">추출된 색상</h2>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {(["hex", "rgb", "hsl"] as ColorFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                format === f
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {formatLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Proportion bar */}
      <div className="flex w-full h-8 rounded-lg overflow-hidden mb-4">
        {colors.slice(0, 10).map((color) => (
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

      {/* Color grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {colors.map((color) => {
          const displayValue = formatColor(color, format);
          const textColor = getContrastColor(color.hex);
          const isCopied = copiedColor === displayValue;

          return (
            <button
              key={color.hex}
              onClick={() => handleCopy(color)}
              className="group relative rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              style={{ backgroundColor: color.hex }}
            >
              <div className="p-3 h-20 flex flex-col justify-between">
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded self-start opacity-80"
                  style={{
                    backgroundColor:
                      textColor === "#000000"
                        ? "rgba(0,0,0,0.1)"
                        : "rgba(255,255,255,0.15)",
                    color: textColor,
                  }}
                >
                  {categoryLabels[color.category]}
                </span>

                <div>
                  <p
                    className="text-xs font-mono font-semibold truncate"
                    style={{ color: textColor }}
                  >
                    {isCopied ? "Copied!" : displayValue}
                  </p>
                  <p
                    className="text-xs opacity-70"
                    style={{ color: textColor }}
                  >
                    {color.percentage}%
                  </p>
                </div>
              </div>

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
                  className="w-5 h-5"
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
  );
}
