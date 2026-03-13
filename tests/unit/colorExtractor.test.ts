import { describe, it, expect } from "vitest";
import {
  normalizeColorString,
  extractColorsFromCss,
  aggregateColors,
  resolveNamedColor,
} from "@/lib/colorExtractor";

describe("resolveNamedColor", () => {
  it("resolves common named colors", () => {
    expect(resolveNamedColor("black")).toBe("#000000");
    expect(resolveNamedColor("white")).toBe("#ffffff");
    expect(resolveNamedColor("red")).toBe("#ff0000");
    expect(resolveNamedColor("blue")).toBe("#0000ff");
  });

  it("is case-insensitive", () => {
    expect(resolveNamedColor("Black")).toBe("#000000");
    expect(resolveNamedColor("WHITE")).toBe("#ffffff");
  });

  it("returns null for unknown names", () => {
    expect(resolveNamedColor("notacolor")).toBeNull();
    expect(resolveNamedColor("")).toBeNull();
  });
});

describe("normalizeColorString", () => {
  it("normalizes hex colors", () => {
    const result = normalizeColorString("#FF0000");
    expect(result).toBe("#ff0000");
  });

  it("normalizes 3-digit hex to 6-digit", () => {
    const result = normalizeColorString("#f00");
    expect(result).toBe("#ff0000");
  });

  it("normalizes rgb to hex", () => {
    const result = normalizeColorString("rgb(255, 0, 0)");
    expect(result).toBe("#ff0000");
  });

  it("normalizes rgba to hex (ignores alpha)", () => {
    const result = normalizeColorString("rgba(0, 0, 255, 1)");
    expect(result).toBe("#0000ff");
  });

  it("returns null for transparent", () => {
    expect(normalizeColorString("transparent")).toBeNull();
    expect(normalizeColorString("rgba(0, 0, 0, 0)")).toBeNull();
  });

  it("returns null for inherit and currentcolor", () => {
    expect(normalizeColorString("inherit")).toBeNull();
    expect(normalizeColorString("currentcolor")).toBeNull();
    expect(normalizeColorString("none")).toBeNull();
  });
});

describe("extractColorsFromCss", () => {
  it("extracts hex colors from CSS text", () => {
    const css = `
      body { background-color: #ffffff; color: #333333; }
      .btn { background: #ff6b6b; border-color: #e55353; }
    `;
    const colors = extractColorsFromCss(css);
    expect(colors).toContain("#ffffff");
    expect(colors).toContain("#333333");
    expect(colors).toContain("#ff6b6b");
  });

  it("extracts rgb colors from CSS", () => {
    const css = `p { color: rgb(100, 150, 200); }`;
    const colors = extractColorsFromCss(css);
    expect(colors.some((c) => c.includes("rgb(100, 150, 200)"))).toBe(true);
  });

  it("extracts hsl colors from CSS", () => {
    const css = `h1 { color: hsl(200, 50%, 60%); }`;
    const colors = extractColorsFromCss(css);
    expect(colors.some((c) => c.includes("hsl(200"))).toBe(true);
  });

  it("extracts named colors in property context", () => {
    const css = `body { background-color: white; color: black; }`;
    const colors = extractColorsFromCss(css);
    expect(colors).toContain("white");
    expect(colors).toContain("black");
  });

  it("returns empty array for CSS with no colors", () => {
    const css = `body { font-size: 16px; margin: 0; padding: 0; }`;
    const colors = extractColorsFromCss(css);
    expect(colors.length).toBe(0);
  });
});

describe("aggregateColors", () => {
  it("returns sorted array of ExtractedColor objects", () => {
    const rawColors = [
      "#ff0000",
      "#ff0000",
      "#ff0000",
      "#00ff00",
      "#00ff00",
      "#0000ff",
    ];
    const result = aggregateColors(rawColors);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].frequency).toBeGreaterThanOrEqual(result[1]?.frequency ?? 0);
  });

  it("normalizes and deduplicates colors", () => {
    const rawColors = ["#FF0000", "rgb(255, 0, 0)", "#ff0000"];
    const result = aggregateColors(rawColors);
    // All three should be merged into one
    expect(result.length).toBe(1);
    expect(result[0].frequency).toBe(3);
  });

  it("returns percentage that sums to ~100", () => {
    const rawColors = ["#ff0000", "#00ff00", "#0000ff"];
    const result = aggregateColors(rawColors);
    const total = result.reduce((sum, c) => sum + c.percentage, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  it("includes correct color data structure", () => {
    const result = aggregateColors(["#1a2b3c"]);
    expect(result[0]).toHaveProperty("hex");
    expect(result[0]).toHaveProperty("rgb");
    expect(result[0]).toHaveProperty("hsl");
    expect(result[0]).toHaveProperty("frequency");
    expect(result[0]).toHaveProperty("percentage");
    expect(result[0]).toHaveProperty("category");
  });

  it("filters out invalid and transparent colors", () => {
    const rawColors = ["transparent", "inherit", "none", "#ff0000"];
    const result = aggregateColors(rawColors);
    expect(result.length).toBe(1);
    expect(result[0].hex).toBe("#ff0000");
  });

  it("returns empty array for all-invalid input", () => {
    const result = aggregateColors(["transparent", "inherit", "notacolor"]);
    expect(result).toEqual([]);
  });
});
