/**
 * 성능 테스트: 색상 처리 파이프라인의 응답 시간 검증
 *
 * 실제 웹사이트 분석 시 수백~수천 개의 색상이 처리되므로
 * 대용량 입력에서의 응답성을 확인합니다.
 */
import { describe, it, expect } from "vitest";
import { aggregateColors, extractColorsFromCss } from "@/lib/colorExtractor";
import { groupSimilarColors, secondPassMerge } from "@/lib/colorUtils";

// 테스트용 대용량 색상 데이터 생성
function generateColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (i * 37) % 256;
    const g = (i * 73) % 256;
    const b = (i * 113) % 256;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  });
}

// 테스트용 대용량 CSS 생성
function generateCss(ruleCount: number): string {
  return Array.from({ length: ruleCount }, (_, i) => {
    const hue = (i * 7) % 360;
    return `.rule-${i} { color: hsl(${hue}, ${50 + (i % 40)}%, ${30 + (i % 40)}%); background-color: #${((i * 997) % 0xffffff).toString(16).padStart(6, "0")}; }`;
  }).join("\n");
}

describe("색상 처리 성능 테스트", () => {
  it("100개 색상 집계가 50ms 이내에 완료된다", () => {
    const colors = generateColors(100);
    const start = performance.now();
    const result = aggregateColors(colors);
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(50);
  });

  it("500개 색상 집계가 200ms 이내에 완료된다", () => {
    const colors = generateColors(500);
    const start = performance.now();
    const result = aggregateColors(colors);
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(12);
    expect(elapsed).toBeLessThan(200);
  });

  it("1000개 CSS 규칙에서 색상 추출이 100ms 이내에 완료된다", () => {
    const css = generateCss(1000);
    const start = performance.now();
    const colors = extractColorsFromCss(css);
    const elapsed = performance.now() - start;

    expect(colors.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(100);
  });

  it("유사 색상 그룹핑 (500개)이 150ms 이내에 완료된다", () => {
    const colors = generateColors(500);
    const start = performance.now();
    const groups = groupSimilarColors(colors, 25);
    const elapsed = performance.now() - start;

    expect(groups.size).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(150);
  });

  it("2차 카테고리 병합 (30개 후보)이 10ms 이내에 완료된다", () => {
    const candidates = generateColors(30).map((color, i) => ({
      color,
      count: 100 - i,
    }));
    const uniqueColors = candidates.map((c) => c.color);

    const start = performance.now();
    const result = secondPassMerge(candidates, uniqueColors);
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(10);
  });
});
