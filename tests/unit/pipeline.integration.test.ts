/**
 * 통합 테스트: CSS 텍스트 → 색상 추출 → 정규화 → 병합 → ExtractedColor[] 파이프라인
 *
 * 각 함수의 단위 테스트와 달리, 여러 모듈이 연결된 전체 흐름을 검증합니다.
 * extractColorsFromCss (colorExtractor) → aggregateColors (colorExtractor)
 * → groupSimilarColors + secondPassMerge (colorUtils) → 최종 결과
 */
import { describe, it, expect } from "vitest";
import { extractColorsFromCss, aggregateColors, normalizeColorString } from "@/lib/colorExtractor";

// 실제 웹사이트 CSS와 유사한 복합 입력
const REALISTIC_CSS = `
  :root {
    --color-primary: #0066cc;
    --color-bg: #ffffff;
    --color-text: #111111;
  }
  body {
    background-color: #ffffff;
    color: #111111;
    font-size: 16px;
  }
  .btn-primary {
    background-color: #0066cc;
    color: #ffffff;
    border-color: #0055aa;
  }
  .btn-primary:hover {
    background-color: #0055aa;
  }
  .card {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #333333;
  }
  .alert-error {
    background-color: rgb(220, 53, 69);
    color: white;
    border-color: rgb(185, 28, 48);
  }
  .tag {
    background-color: hsl(210, 100%, 56%);
    color: #ffffff;
  }
  nav {
    background-color: #1a1a2e;
    color: rgba(255, 255, 255, 0.9);
  }
  footer {
    background-color: #16213e;
    color: #cccccc;
  }
`;

describe("색상 추출 파이프라인 통합 테스트", () => {
  it("CSS 텍스트에서 색상을 추출하고 집계까지 완전한 파이프라인이 동작한다", () => {
    // Step 1: CSS에서 원시 색상 문자열 추출
    const rawColors = extractColorsFromCss(REALISTIC_CSS);
    expect(rawColors.length).toBeGreaterThan(0);

    // Step 2: 원시 색상 → 집계 (정규화 + 병합 + 분류 포함)
    const result = aggregateColors(rawColors);

    // 결과가 존재해야 함
    expect(result.length).toBeGreaterThan(0);

    // 카테고리당 최대 5개 제한 준수
    const categoryCounts: Record<string, number> = {};
    for (const color of result) {
      categoryCounts[color.category] = (categoryCounts[color.category] ?? 0) + 1;
    }
    for (const count of Object.values(categoryCounts)) {
      expect(count).toBeLessThanOrEqual(5);
    }

    // 전체 최대 12개 제한
    expect(result.length).toBeLessThanOrEqual(12);

    // 각 결과가 올바른 구조를 가져야 함
    for (const color of result) {
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(color.rgb.r).toBeGreaterThanOrEqual(0);
      expect(color.rgb.r).toBeLessThanOrEqual(255);
      expect(color.hsl.h).toBeGreaterThanOrEqual(0);
      expect(color.hsl.h).toBeLessThanOrEqual(360);
      expect(color.percentage).toBeGreaterThan(0);
      expect(["primary", "accent", "secondary", "background", "text"]).toContain(color.category);
    }

    // percentage 합계가 ~100이어야 함
    const totalPct = result.reduce((sum, c) => sum + c.percentage, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });

  it("유사한 색상들이 파이프라인을 거쳐 병합된다", () => {
    // 매우 유사한 파란색 변형들 - 병합되어야 함
    const similarBlues = `
      .a { color: #0066cc; }
      .b { color: #0065cb; }
      .c { color: #0067cd; }
      .d { color: #ff0000; }
    `;
    const rawColors = extractColorsFromCss(similarBlues);
    const result = aggregateColors(rawColors);

    // 파란색 3개가 병합되어 결과가 원래 색상 수보다 적어야 함
    expect(result.length).toBeLessThan(4);

    // 빨간색과 파란색은 구별되어야 함
    const hasRed = result.some((c) => c.hsl.h < 20 || c.hsl.h > 340);
    const hasBlue = result.some((c) => c.hsl.h > 200 && c.hsl.h < 250);
    expect(hasRed).toBe(true);
    expect(hasBlue).toBe(true);
  });

  it("투명/상속 색상이 파이프라인에서 완전히 제거된다", () => {
    const cssWithInvalid = `
      body { color: #333333; background: transparent; }
      .a { color: inherit; border-color: currentColor; }
      .b { background-color: rgba(0, 0, 0, 0); color: #ffffff; }
    `;
    const rawColors = extractColorsFromCss(cssWithInvalid);
    const result = aggregateColors(rawColors);

    // 유효한 색상만 남아야 함
    for (const color of result) {
      expect(color.hex).not.toBe("transparent");
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("대규모 CSS에서도 최대 12개 색상 제한이 유지된다", () => {
    // 50개 고유 색상을 포함한 CSS 생성
    const manyColors = Array.from({ length: 50 }, (_, i) => {
      const hue = (i * 7) % 360;
      return `.c${i} { color: hsl(${hue}, 70%, 50%); }`;
    }).join("\n");

    const rawColors = extractColorsFromCss(manyColors);
    const result = aggregateColors(rawColors);

    expect(result.length).toBeLessThanOrEqual(12);
    expect(result.length).toBeGreaterThan(0);
  });

  it("normalizeColorString → aggregateColors 체인이 다양한 포맷을 올바르게 처리한다", () => {
    // 동일한 색상의 다양한 표현 형식
    const formats = [
      "#FF0000",          // 대문자 HEX
      "#f00",             // 단축 HEX
      "rgb(255, 0, 0)",   // RGB
      "rgba(255, 0, 0, 1)", // RGBA (불투명)
      "red",              // 명칭
    ];

    // 각각 normalizeColorString을 거치면 같은 값이 나와야 함
    const normalized = formats.map(normalizeColorString);
    const unique = new Set(normalized.filter(Boolean));
    expect(unique.size).toBe(1);
    expect([...unique][0]).toBe("#ff0000");

    // aggregateColors도 이들을 하나로 합쳐야 함
    const result = aggregateColors(formats);
    expect(result.length).toBe(1);
    expect(result[0].frequency).toBe(5);
  });
});
