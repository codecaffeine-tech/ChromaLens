import { test, expect } from "@playwright/test";

test.describe("ChromaLens E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("homepage renders correctly", async ({ page }) => {
    await expect(page.getByText("ChromaLens")).toBeVisible();
    await expect(page.getByText("Analyze any website")).toBeVisible();
    await expect(page.getByPlaceholder(/Enter website URL/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Analyze/i })).toBeVisible();
  });

  test("shows feature cards on idle state", async ({ page }) => {
    await expect(page.getByText("Extract Colors")).toBeVisible();
    await expect(page.getByText("Color Wheel")).toBeVisible();
    await expect(page.getByText("Theme Preview")).toBeVisible();
  });

  test("Analyze button is disabled when input is empty", async ({ page }) => {
    const button = page.getByRole("button", { name: /Analyze/i });
    await expect(button).toBeDisabled();
  });

  test("Analyze button enables when URL is typed", async ({ page }) => {
    const input = page.getByPlaceholder(/Enter website URL/i);
    await input.fill("github.com");
    const button = page.getByRole("button", { name: /Analyze/i });
    await expect(button).toBeEnabled();
  });

  test("example URL buttons fill input", async ({ page }) => {
    const githubBtn = page.getByRole("button", { name: "github.com" });
    await githubBtn.click();
    // After clicking, the button triggers both fill + submit
    // Loading state should appear
    await expect(page.getByText(/Analyzing/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows loading spinner when analyzing", async ({ page }) => {
    const input = page.getByPlaceholder(/Enter website URL/i);
    await input.fill("example.com");
    await page.getByRole("button", { name: /Analyze/i }).click();
    await expect(page.getByText(/Analyzing/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows error for invalid URL", async ({ page }) => {
    // Mock the API to return an error
    await page.route("/api/extract", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid URL format" }),
      })
    );

    const input = page.getByPlaceholder(/Enter website URL/i);
    await input.fill("not-a-valid-url");
    await page.getByRole("button", { name: /Analyze/i }).click();
    await expect(page.getByText("Invalid URL format")).toBeVisible({
      timeout: 10000,
    });
  });

  test("shows results after successful extraction", async ({ page }) => {
    // Mock successful API response
    const mockResult = {
      url: "https://example.com",
      dominantColor: "#0066cc",
      totalColors: 5,
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

    const input = page.getByPlaceholder(/Enter website URL/i);
    await input.fill("example.com");
    await page.getByRole("button", { name: /Analyze/i }).click();

    // Should show results
    await expect(page.getByText("5 colors extracted")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Extracted Colors")).toBeVisible();
  });

  test("tab navigation works in results view", async ({ page }) => {
    const mockResult = {
      url: "https://example.com",
      dominantColor: "#0066cc",
      totalColors: 3,
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

    await page.getByPlaceholder(/Enter website URL/i).fill("example.com");
    await page.getByRole("button", { name: /Analyze/i }).click();

    await expect(page.getByText("Extracted Colors")).toBeVisible({
      timeout: 10000,
    });

    // Switch to Color Wheel tab
    await page.getByRole("button", { name: "Color Wheel" }).click();
    await expect(page.getByText("Color Wheel")).toBeVisible();

    // Switch to Theme Preview tab
    await page.getByRole("button", { name: "Theme Preview" }).click();
    await expect(page.getByText("Apply a Color Theme")).toBeVisible();
  });
});
