import type { ExtractedColor, ColorFormat } from "@/types";

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(expanded, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.clamp(v, 0, 255)).toString(16).padStart(2, "0"))
      .join("")
  );
}

// Clamp polyfill for Math.clamp (not standard)
Math.clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

declare global {
  interface Math {
    clamp(value: number, min: number, max: number): number;
  }
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function parseColor(
  colorStr: string
): { r: number; g: number; b: number } | null {
  const s = colorStr.trim().toLowerCase();

  // HEX format
  if (s.startsWith("#")) {
    try {
      return hexToRgb(s);
    } catch {
      return null;
    }
  }

  // RGB/RGBA format
  const rgbMatch = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // HSL/HSLA format
  const hslMatch = s.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1]),
      parseInt(hslMatch[2]),
      parseInt(hslMatch[3])
    );
  }

  return null;
}

export function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  // Weighted Euclidean distance (human perception model)
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  const rmean = (c1.r + c2.r) / 2;
  const weightR = 2 + rmean / 256;
  const weightG = 4;
  const weightB = 2 + (255 - rmean) / 256;
  return Math.sqrt(weightR * dr * dr + weightG * dg * dg + weightB * db * db);
}

export function isNearlyTransparent(colorStr: string): boolean {
  const s = colorStr.trim().toLowerCase();
  if (s === "transparent" || s === "rgba(0,0,0,0)" || s === "rgba(0, 0, 0, 0)") {
    return true;
  }
  // Only check alpha for rgba() — rgb() has no alpha channel
  const alphaMatch = s.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
  if (alphaMatch) {
    return parseFloat(alphaMatch[1]) < 0.1;
  }
  return false;
}

export function groupSimilarColors(
  colors: string[],
  threshold = 30
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  const assigned = new Set<string>();

  for (const color of colors) {
    if (assigned.has(color)) continue;

    const rgb = parseColor(color);
    if (!rgb) continue;

    const group = [color];
    assigned.add(color);

    for (const other of colors) {
      if (assigned.has(other)) continue;
      const otherRgb = parseColor(other);
      if (!otherRgb) continue;

      if (colorDistance(rgb, otherRgb) < threshold) {
        group.push(other);
        assigned.add(other);
      }
    }

    groups.set(color, group);
  }

  return groups;
}

// Category-specific thresholds for second-pass merge
const SECOND_PASS_THRESHOLDS: Record<string, number> = {
  background: 60, // near-whites and near-blacks merge aggressively
  text: 60,
  secondary: 50, // grays merge moderately
  primary: 35,
  accent: 25,    // brand colors stay distinct
};

/**
 * Second-pass merge: after initial grouping, further consolidate colors
 * within the same category using looser per-category thresholds.
 * Reduces near-duplicate neutrals while preserving distinct brand colors.
 */
export function secondPassMerge(
  candidates: { color: string; count: number }[],
  allColors: string[]
): { color: string; count: number }[] {
  const categorized = candidates.map(({ color, count }) => ({
    color,
    count,
    rgb: hexToRgb(color),
    category: categorizeColor(color, allColors),
  }));

  const result: { color: string; count: number }[] = [];
  const assigned = new Set<string>();

  for (const item of categorized) {
    if (assigned.has(item.color)) continue;

    let totalCount = item.count;
    assigned.add(item.color);
    const threshold = SECOND_PASS_THRESHOLDS[item.category] ?? 35;

    for (const other of categorized) {
      if (assigned.has(other.color)) continue;
      if (other.category !== item.category) continue;
      if (colorDistance(item.rgb, other.rgb) < threshold) {
        totalCount += other.count;
        assigned.add(other.color);
      }
    }

    result.push({ color: item.color, count: totalCount });
  }

  return result.sort((a, b) => b.count - a.count);
}

export function formatColor(
  color: ExtractedColor,
  format: ColorFormat
): string {
  switch (format) {
    case "hex":
      return color.hex;
    case "rgb":
      return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    case "hsl":
      return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
  }
}

export function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = getLuminance(r, g, b);
  return luminance > 0.179 ? "#000000" : "#ffffff";
}

export function categorizeColor(
  hex: string,
  allColors: string[]
): ExtractedColor["category"] {
  const { r, g, b } = hexToRgb(hex);
  const { s, l } = rgbToHsl(r, g, b);
  const luminance = getLuminance(r, g, b);

  if (l > 90 || (s < 10 && l > 80)) return "background";
  if (l < 15 || (s < 10 && l < 20)) return "text";
  if (s > 60 && l > 40 && l < 70) return "accent";
  if (s < 20) return "secondary";
  return "primary";
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
}
