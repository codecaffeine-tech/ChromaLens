import { test, expect } from "@playwright/test";

test.describe("ChromaLens E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("homepage renders correctly", async ({ page }) => {
    await expect(page.getByText("ChromaLens")).toBeVisible();
    await expect(page.getByText("웹사이트 색상을 분석하세요")).toBeVisible();
    await expect(page.getByPlaceholder(/URL 입력/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "분석" })).toBeVisible();
  });

  test("shows feature cards on idle state", async ({ page }) => {
    await expect(page.getByText("색상 추출")).toBeVisible();
    await expect(page.getByText("색상환 시각화")).toBeVisible();
    await expect(page.getByText("테마 미리보기")).toBeVisible();
  });

  test("Analyze button is disabled when input is empty", async ({ page }) => {
    const button = page.getByRole("button", { name: "분석" });
    await expect(button).toBeDisabled();
  });

  test("Analyze button enables when URL is typed", async ({ page }) => {
    const input = page.getByPlaceholder(/URL 입력/i);
    await input.fill("github.com");
    const button = page.getByRole("button", { name: "분석" });
    await expect(button).toBeEnabled();
  });

  test("example URL buttons fill input", async ({ page }) => {
    const naver = page.getByRole("button", { name: "naver.com" });
    await naver.click();
    await expect(page.getByText(/분석 중/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows loading spinner when analyzing", async ({ page }) => {
    const input = page.getByPlaceholder(/URL 입력/i);
    await input.fill("example.com");
    await page.getByRole("button", { name: "분석" }).click();
    await expect(page.getByText(/분석 중/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows error for invalid URL", async ({ page }) => {
    await page.route("/api/extract", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "유효하지 않은 URL 형식입니다." }),
      })
    );

    const input = page.getByPlaceholder(/URL 입력/i);
    await input.fill("not-a-valid-url");
    await page.getByRole("button", { name: "분석" }).click();
    await expect(page.getByText("유효하지 않은 URL 형식입니다.")).toBeVisible({
      timeout: 10000,
    });
  });

  test("shows results after successful extraction", async ({ page }) => {
    const mockResult = {
      url: "https://example.com",
      dominantColor: "#0066cc",
      totalColors: 4,
      extractedAt: new Date().toISOString(),
      colors: [
        {
          hex: "#0066cc",
          rgb: { r: 0, g: 102, b: 204 },
          hsl: { h: 210, s: 100, l: 40 },
          frequency: 50,
          percentage: 40,
          category: "primary",
        },
        {
          hex: "#ffffff",
          rgb: { r: 255, g: 255, b: 255 },
          hsl: { h: 0, s: 0, l: 100 },
          frequency: 30,
          percentage: 30,
          category: "background",
        },
        {
          hex: "#333333",
          rgb: { r: 51, g: 51, b: 51 },
          hsl: { h: 0, s: 0, l: 20 },
          frequency: 20,
          percentage: 20,
          category: "text",
        },
        {
          hex: "#ff6600",
          rgb: { r: 255, g: 102, b: 0 },
          hsl: { h: 24, s: 100, l: 50 },
          frequency: 10,
          percentage: 10,
          category: "accent",
        },
      ],
    };

    await page.route("/api/extract", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      })
    );

    const input = page.getByPlaceholder(/URL 입력/i);
    await input.fill("example.com");
    await page.getByRole("button", { name: "분석" }).click();

    await expect(page.getByText(/4개 색상 추출됨/)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("추출된 색상")).toBeVisible();
  });

  test("tab navigation works in results view", async ({ page }) => {
    const mockResult = {
      url: "https://example.com",
      dominantColor: "#0066cc",
      totalColors: 2,
      extractedAt: new Date().toISOString(),
      colors: [
        {
          hex: "#0066cc",
          rgb: { r: 0, g: 102, b: 204 },
          hsl: { h: 210, s: 100, l: 40 },
          frequency: 50,
          percentage: 60,
          category: "primary",
        },
        {
          hex: "#ffffff",
          rgb: { r: 255, g: 255, b: 255 },
          hsl: { h: 0, s: 0, l: 100 },
          frequency: 30,
          percentage: 40,
          category: "background",
        },
      ],
    };

    await page.route("/api/extract", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResult),
      })
    );

    await page.getByPlaceholder(/URL 입력/i).fill("example.com");
    await page.getByRole("button", { name: "분석" }).click();

    await expect(page.getByText("추출된 색상")).toBeVisible({
      timeout: 10000,
    });

    // 색상환 탭
    await page.getByRole("button", { name: "색상환" }).click();
    await expect(page.getByText("색상환")).toBeVisible();

    // 테마 미리보기 탭
    await page.getByRole("button", { name: "테마 미리보기" }).click();
    await expect(page.getByText("색상 테마 적용")).toBeVisible();
  });
});
