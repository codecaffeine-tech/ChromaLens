import type { ExtractedColor, ColorExtractionResult } from "@/types";
import {
  parseColor,
  hexToRgb,
  rgbToHsl,
  groupSimilarColors,
  secondPassMerge,
  isNearlyTransparent,
  categorizeColor,
} from "./colorUtils";

// CSS named color → hex mapping (common subset)
const CSS_NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  pink: "#ffc0cb",
  gray: "#808080",
  grey: "#808080",
  lightgray: "#d3d3d3",
  lightgrey: "#d3d3d3",
  darkgray: "#a9a9a9",
  darkgrey: "#a9a9a9",
  silver: "#c0c0c0",
  navy: "#000080",
  teal: "#008080",
  maroon: "#800000",
  olive: "#808000",
  lime: "#00ff00",
  aqua: "#00ffff",
  cyan: "#00ffff",
  fuchsia: "#ff00ff",
  magenta: "#ff00ff",
  coral: "#ff7f50",
  salmon: "#fa8072",
  tomato: "#ff6347",
  chocolate: "#d2691e",
  gold: "#ffd700",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  linen: "#faf0e6",
  ivory: "#fffff0",
  beige: "#f5f5dc",
  wheat: "#f5deb3",
  tan: "#d2b48c",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  indigo: "#4b0082",
  crimson: "#dc143c",
  transparent: "transparent",
};

export function resolveNamedColor(name: string): string | null {
  const lower = name.toLowerCase().trim();
  return CSS_NAMED_COLORS[lower] ?? null;
}

export function normalizeColorString(colorStr: string): string | null {
  const s = colorStr.trim().toLowerCase();

  if (s === "transparent" || s === "inherit" || s === "currentcolor" || s === "none") {
    return null;
  }

  if (isNearlyTransparent(s)) return null;

  if (s.startsWith("#") || s.startsWith("rgb") || s.startsWith("hsl")) {
    const parsed = parseColor(s);
    if (!parsed) return null;
    const { r, g, b } = parsed;
    return (
      "#" +
      [r, g, b]
        .map((v) => Math.round(Math.min(Math.max(v, 0), 255)).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  const named = resolveNamedColor(s);
  if (named && named !== "transparent") return named;

  return null;
}

interface RawColorData {
  color: string;
  count: number;
}

export function aggregateColors(rawColors: string[]): ExtractedColor[] {
  const colorMap = new Map<string, number>();

  for (const raw of rawColors) {
    const normalized = normalizeColorString(raw);
    if (!normalized) continue;
    colorMap.set(normalized, (colorMap.get(normalized) ?? 0) + 1);
  }

  const uniqueColors = Array.from(colorMap.keys());
  const groups = groupSimilarColors(uniqueColors, 25);

  // Merge group representatives
  const mergedMap = new Map<string, number>();
  for (const [representative, members] of Array.from(groups)) {
    let totalCount = colorMap.get(representative) ?? 0;
    for (const member of members) {
      if (member !== representative) {
        totalCount += colorMap.get(member) ?? 0;
      }
    }
    mergedMap.set(representative, totalCount);
  }

  const total = Array.from(mergedMap.values()).reduce((a, b) => a + b, 0);

  // Take top 30 candidates, run second-pass category-aware merge, cap at 12
  const candidates = Array.from(mergedMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([color, count]) => ({ color, count }));

  const sorted = secondPassMerge(candidates, uniqueColors).slice(0, 12);

  return sorted.map(({ color, count }) => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return {
      hex: color,
      rgb,
      hsl,
      frequency: count,
      percentage: Math.round((count / total) * 100 * 10) / 10,
      category: categorizeColor(color, uniqueColors),
    };
  });
}

// Extract colors from CSS text
export function extractColorsFromCss(cssText: string): string[] {
  const colors: string[] = [];

  // Match hex colors
  const hexPattern = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  let match;
  while ((match = hexPattern.exec(cssText)) !== null) {
    colors.push(match[0]);
  }

  // Match rgb/rgba
  const rgbPattern = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/g;
  while ((match = rgbPattern.exec(cssText)) !== null) {
    colors.push(match[0]);
  }

  // Match hsl/hsla
  const hslPattern = /hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?(?:\s*,\s*[\d.]+)?\s*\)/g;
  while ((match = hslPattern.exec(cssText)) !== null) {
    colors.push(match[0]);
  }

  // Match named colors in property context
  const namedPattern =
    /(?:color|background(?:-color)?|border(?:-color)?|fill|stroke|outline(?:-color)?)\s*:\s*([a-z]+)/gi;
  while ((match = namedPattern.exec(cssText)) !== null) {
    const named = match[1].toLowerCase();
    if (CSS_NAMED_COLORS[named] && named !== "transparent") {
      colors.push(named);
    }
  }

  return colors;
}

/* v8 ignore start */
// Server-side extraction using Puppeteer — excluded from unit test coverage
export async function extractColorsFromUrl(
  url: string
): Promise<ColorExtractionResult> {
  // Dynamic import to avoid bundling puppeteer on client side
  const puppeteer = await import("puppeteer-core");

  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Extract colors from computed styles and CSS
    const rawColors = await page.evaluate(() => {
      const colors: string[] = [];
      const elements = document.querySelectorAll("*");

      const properties = [
        "color",
        "background-color",
        "border-color",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",
        "outline-color",
        "text-decoration-color",
        "fill",
        "stroke",
      ];

      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        for (const prop of properties) {
          const value = style.getPropertyValue(prop);
          if (value && value !== "none" && value !== "") {
            colors.push(value);
          }
        }
      });

      return colors;
    });

    // Also extract from CSS stylesheets
    const cssColors = await page.evaluate(() => {
      const colors: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (const rule of Array.from(rules)) {
            if (rule instanceof CSSStyleRule) {
              colors.push(rule.cssText);
            }
          }
        } catch {
          // Cross-origin stylesheets may throw
        }
      }
      return colors.join("\n");
    });

    const cssExtracted = extractColorsFromCss(cssColors);
    const allRawColors = [...rawColors, ...cssExtracted];

    const colors = aggregateColors(allRawColors);
    const dominantColor = colors[0]?.hex ?? "#000000";

    // 사이트 스크린샷 캡처 (PNG, 무손실)
    const screenshotBuffer = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1280, height: 720 },
    });
    const screenshot = `data:image/png;base64,${Buffer.from(screenshotBuffer).toString("base64")}`;

    return {
      url,
      colors,
      totalColors: colors.length,
      extractedAt: new Date().toISOString(),
      dominantColor,
      screenshot,
    };
  } finally {
    await browser.close();
  }
}
/* v8 ignore stop */
