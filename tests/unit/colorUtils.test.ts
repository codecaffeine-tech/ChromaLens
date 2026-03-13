import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  parseColor,
  colorDistance,
  getLuminance,
  getContrastColor,
  normalizeUrl,
  isNearlyTransparent,
} from "@/lib/colorUtils";

describe("hexToRgb", () => {
  it("converts 6-digit hex to RGB", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts 3-digit hex to RGB", () => {
    expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("handles hex without #", () => {
    expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe("rgbToHex", () => {
  it("converts RGB to lowercase hex string", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
    expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });

  it("pads single-digit hex values", () => {
    expect(rgbToHex(0, 0, 15)).toBe("#00000f");
  });
});

describe("rgbToHsl", () => {
  it("converts red correctly", () => {
    const result = rgbToHsl(255, 0, 0);
    expect(result.h).toBe(0);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it("converts white correctly", () => {
    const result = rgbToHsl(255, 255, 255);
    expect(result.s).toBe(0);
    expect(result.l).toBe(100);
  });

  it("converts black correctly", () => {
    const result = rgbToHsl(0, 0, 0);
    expect(result.s).toBe(0);
    expect(result.l).toBe(0);
  });

  it("converts blue correctly", () => {
    const result = rgbToHsl(0, 0, 255);
    expect(result.h).toBe(240);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });
});

describe("hslToRgb", () => {
  it("converts red correctly", () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("converts white correctly", () => {
    expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts black correctly", () => {
    expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("parseColor", () => {
  it("parses hex colors", () => {
    expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor("#abc")).toBeDefined();
  });

  it("parses rgb() colors", () => {
    expect(parseColor("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor("rgb(0,128,0)")).toEqual({ r: 0, g: 128, b: 0 });
  });

  it("parses rgba() colors", () => {
    expect(parseColor("rgba(0, 0, 255, 0.5)")).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("parses hsl() colors", () => {
    const result = parseColor("hsl(0, 100%, 50%)");
    expect(result).toBeDefined();
    expect(result!.r).toBe(255);
  });

  it("returns null for invalid colors", () => {
    expect(parseColor("notacolor")).toBeNull();
    expect(parseColor("")).toBeNull();
  });
});

describe("colorDistance", () => {
  it("returns 0 for identical colors", () => {
    expect(colorDistance({ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 })).toBe(0);
  });

  it("returns higher value for more different colors", () => {
    const d1 = colorDistance({ r: 255, g: 0, b: 0 }, { r: 250, g: 0, b: 0 });
    const d2 = colorDistance({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 0 });
    expect(d2).toBeGreaterThan(d1);
  });

  it("is symmetric", () => {
    const a = { r: 100, g: 150, b: 200 };
    const b = { r: 50, g: 80, b: 120 };
    expect(colorDistance(a, b)).toBeCloseTo(colorDistance(b, a));
  });
});

describe("getLuminance", () => {
  it("returns ~1 for white", () => {
    expect(getLuminance(255, 255, 255)).toBeCloseTo(1, 1);
  });

  it("returns ~0 for black", () => {
    expect(getLuminance(0, 0, 0)).toBeCloseTo(0, 5);
  });

  it("returns value between 0 and 1 for mid colors", () => {
    const lum = getLuminance(128, 128, 128);
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });
});

describe("getContrastColor", () => {
  it("returns black for light backgrounds", () => {
    expect(getContrastColor("#ffffff")).toBe("#000000");
    expect(getContrastColor("#eeeeee")).toBe("#000000");
    expect(getContrastColor("#ffff00")).toBe("#000000");
  });

  it("returns white for dark backgrounds", () => {
    expect(getContrastColor("#000000")).toBe("#ffffff");
    expect(getContrastColor("#0000ff")).toBe("#ffffff");
    expect(getContrastColor("#333333")).toBe("#ffffff");
  });
});

describe("normalizeUrl", () => {
  it("adds https:// if missing", () => {
    expect(normalizeUrl("github.com")).toBe("https://github.com");
    expect(normalizeUrl("www.example.com")).toBe("https://www.example.com");
  });

  it("preserves existing protocol", () => {
    expect(normalizeUrl("https://github.com")).toBe("https://github.com");
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
  });
});

describe("isNearlyTransparent", () => {
  it("detects transparent keyword", () => {
    expect(isNearlyTransparent("transparent")).toBe(true);
  });

  it("detects rgba with zero alpha", () => {
    expect(isNearlyTransparent("rgba(0, 0, 0, 0)")).toBe(true);
    expect(isNearlyTransparent("rgba(255, 255, 255, 0.05)")).toBe(true);
  });

  it("returns false for opaque colors", () => {
    expect(isNearlyTransparent("rgba(255, 0, 0, 1)")).toBe(false);
    expect(isNearlyTransparent("rgba(0, 0, 0, 0.5)")).toBe(false);
    expect(isNearlyTransparent("#ff0000")).toBe(false);
  });
});
