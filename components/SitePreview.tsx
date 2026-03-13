"use client";

import type { ExtractedColor, PresetPalette } from "@/types";
import { colorDistance, hexToRgb } from "@/lib/colorUtils";
import { getContrastColor } from "@/lib/colorUtils";

interface SitePreviewProps {
  originalColors: ExtractedColor[];
  selectedPalette: PresetPalette;
  siteUrl: string;
}

interface ColorRole {
  label: string;
  role: keyof PresetPalette["colors"];
  originalColor: ExtractedColor | undefined;
  newColor: string;
}

function findBestMatch(
  target: ExtractedColor,
  palette: PresetPalette
): string {
  const paletteColors = Object.values(palette.colors);
  const targetRgb = hexToRgb(target.hex);

  let bestColor = paletteColors[0];
  let bestDist = Infinity;

  for (const pc of paletteColors) {
    const pcRgb = hexToRgb(pc);
    const dist = colorDistance(targetRgb, pcRgb);
    if (dist < bestDist) {
      bestDist = dist;
      bestColor = pc;
    }
  }

  return bestColor;
}

export default function SitePreview({
  originalColors,
  selectedPalette,
  siteUrl,
}: SitePreviewProps) {
  // Map original color categories to palette roles
  const roles: ColorRole[] = [
    {
      label: "Primary",
      role: "primary",
      originalColor: originalColors.find((c) => c.category === "primary"),
      newColor: selectedPalette.colors.primary,
    },
    {
      label: "Secondary",
      role: "secondary",
      originalColor: originalColors.find((c) => c.category === "secondary"),
      newColor: selectedPalette.colors.secondary,
    },
    {
      label: "Background",
      role: "background",
      originalColor: originalColors.find((c) => c.category === "background"),
      newColor: selectedPalette.colors.background,
    },
    {
      label: "Text",
      role: "text",
      originalColor: originalColors.find((c) => c.category === "text"),
      newColor: selectedPalette.colors.text,
    },
    {
      label: "Accent",
      role: "accent",
      originalColor: originalColors.find((c) => c.category === "accent"),
      newColor: selectedPalette.colors.accent,
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        Theme Preview: {selectedPalette.name}
      </h2>

      {/* Color mapping table */}
      <div className="mb-6 bg-gray-800/50 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-3">Color Mapping</p>
        <div className="space-y-2">
          {roles.map(({ label, originalColor, newColor }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-20">{label}</span>

              {/* Original */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded border border-gray-600"
                  style={{
                    backgroundColor: originalColor?.hex ?? "#888",
                  }}
                />
                <span className="text-xs font-mono text-gray-400">
                  {originalColor?.hex ?? "N/A"}
                </span>
              </div>

              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>

              {/* New */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded border border-gray-600"
                  style={{ backgroundColor: newColor }}
                />
                <span className="text-xs font-mono text-gray-400">
                  {newColor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock UI preview */}
      <div
        className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl"
        style={{ backgroundColor: selectedPalette.colors.background }}
      >
        {/* Mock nav bar */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: selectedPalette.colors.primary }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: selectedPalette.colors.accent }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: getContrastColor(selectedPalette.colors.primary) }}
            >
              {new URL(siteUrl.startsWith("http") ? siteUrl : "https://" + siteUrl).hostname}
            </span>
          </div>
          <div className="flex gap-3">
            {["Home", "About", "Contact"].map((item) => (
              <span
                key={item}
                className="text-xs opacity-80"
                style={{
                  color: getContrastColor(selectedPalette.colors.primary),
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Mock hero */}
        <div className="px-6 py-8">
          <div
            className="text-xl font-bold mb-2"
            style={{ color: selectedPalette.colors.text }}
          >
            Welcome to the site
          </div>
          <div
            className="text-sm mb-4 opacity-70"
            style={{ color: selectedPalette.colors.text }}
          >
            This is a preview of your website with the{" "}
            <strong>{selectedPalette.name}</strong> color theme applied.
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: selectedPalette.colors.accent,
              color: getContrastColor(selectedPalette.colors.accent),
            }}
          >
            Get Started
          </button>
        </div>

        {/* Mock cards */}
        <div className="px-6 pb-6 grid grid-cols-3 gap-3">
          {["Feature 1", "Feature 2", "Feature 3"].map((feature, i) => (
            <div
              key={feature}
              className="p-3 rounded-lg"
              style={{ backgroundColor: selectedPalette.colors.surface }}
            >
              <div
                className="w-8 h-8 rounded mb-2"
                style={{
                  backgroundColor:
                    i % 2 === 0
                      ? selectedPalette.colors.secondary
                      : selectedPalette.colors.accent,
                }}
              />
              <p
                className="text-xs font-medium"
                style={{ color: selectedPalette.colors.text }}
              >
                {feature}
              </p>
              <p
                className="text-xs opacity-60 mt-1"
                style={{ color: selectedPalette.colors.text }}
              >
                Sample description text.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
