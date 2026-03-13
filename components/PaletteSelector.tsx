"use client";

import type { PresetPalette } from "@/types";
import { PRESET_PALETTES } from "@/lib/palettes";

interface PaletteSelectorProps {
  selectedPaletteId: string | null;
  onSelect: (palette: PresetPalette) => void;
}

export default function PaletteSelector({
  selectedPaletteId,
  onSelect,
}: PaletteSelectorProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        Apply a Color Theme
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESET_PALETTES.map((palette) => {
          const isSelected = palette.id === selectedPaletteId;
          const swatchColors = Object.values(palette.colors);

          return (
            <button
              key={palette.id}
              onClick={() => onSelect(palette)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-violet-500 bg-violet-950/50"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800"
              }`}
            >
              <div className="flex gap-1 mb-2">
                {swatchColors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-6 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-200">{palette.name}</p>
              <p className="text-xs text-gray-500 truncate">{palette.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
