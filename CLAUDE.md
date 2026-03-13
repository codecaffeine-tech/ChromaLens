# ChromaLens — AI Context File

## Project Summary

ChromaLens is a Next.js 14 web app that extracts color palettes from any website URL using Puppeteer, visualizes them on a color wheel and palette grid, and previews the site with remixed color themes applied at the pixel level via Canvas API.

Built for an AI hackathon (1-2 day sprint). Prioritize working features over polish.

---

## Core Architecture

### Data Flow

```
User enters URL
  → POST /api/extract  (Next.js API route)
  → Puppeteer visits URL headlessly (system Chrome)
  → Collects computed CSS colors from all DOM elements (11 CSS properties)
  → Extracts colors from CSS stylesheets (regex: HEX, RGB, HSL, named)
  → Normalizes: HEX/RGB/HSL/named → canonical lowercase hex
  → 1st pass: groups perceptually similar colors (weighted Euclidean distance < 25)
  → 2nd pass: category-aware merge with per-category thresholds
  → Caps at top 30 candidates → secondPassMerge → slice 12
  → Takes top 5 per category (CATEGORY_ORDER: primary, accent, secondary, background, text)
  → Returns ExtractedColor[] + PNG screenshot (1280×720, base64)
  → Client renders:
      - ColorPalette (swatches + ratio bars)
      - ColorWheel (Canvas, hue × saturation)
      - SitePreview (Canvas pixel substitution + BeforeAfterSlider)
```

### State Machine (`app/page.tsx`)

```
idle → loading → success
               → error → idle (retry)
```

### Key Files

| File | Purpose |
|---|---|
| `app/page.tsx` | Main page: state machine, tab navigation (palette/wheel/preview), displayColors |
| `app/layout.tsx` | Root layout: inline script for dark theme restore from localStorage |
| `app/api/extract/route.ts` | POST handler, URL validation, calls `extractColorsFromUrl` |
| `lib/colorExtractor.ts` | Puppeteer logic, CSS parsing, normalizeColorString, aggregateColors |
| `lib/colorUtils.ts` | Pure color math: hex↔rgb↔hsl, distance, contrast, groupSimilarColors, secondPassMerge |
| `lib/palettes.ts` | 10 preset palettes (Linear, Vercel, Midnight, Bento, Crème, Nord, Catppuccin, Rosé Pine, Dracula, Everforest) |
| `components/ColorPalette.tsx` | Category-sorted swatch grid, percentage bars, click-to-copy HEX/RGB/HSL |
| `components/ColorWheel.tsx` | Canvas API — plots colors by hue+saturation, dot size = frequency |
| `components/SitePreview.tsx` | Canvas pixel substitution: maps extracted→palette colors on screenshot |
| `components/BeforeAfterSlider.tsx` | Drag slider to compare original vs theme-applied screenshot |
| `components/ThemeToggle.tsx` | Manual localStorage-based dark/light toggle (no next-themes) |
| `components/PaletteSelector.tsx` | 10 preset theme cards with color previews |
| `types/index.ts` | Shared types: ExtractedColor, ColorExtractionResult, PresetPalette, ColorFormat |

---

## Color System

### `ExtractedColor` structure
```ts
{
  hex: string;           // "#0d1117" — canonical lowercase
  rgb: { r, g, b };     // 0–255 integers
  hsl: { h, s, l };     // h: 0–360, s/l: 0–100 integers
  frequency: number;    // raw occurrence count
  percentage: number;   // 0–100, one decimal place
  category: "primary" | "secondary" | "background" | "text" | "accent"
}
```

### Color categorization logic (`colorUtils.ts: categorizeColor`)
```
l > 90 || (s < 10 && l > 80)  → "background"
l < 15 || (s < 10 && l < 20)  → "text"
s > 60 && l in [40, 70]        → "accent"
s < 20                         → "secondary"
else                            → "primary"
```

### Color reduction pipeline
1. **Normalization**: All formats → canonical lowercase hex. Transparent/inherit/currentColor → null (excluded).
2. **1st pass grouping** (`groupSimilarColors`, threshold 25): Weighted Euclidean distance with human vision model (R/G/B weights based on average R value).
3. **2nd pass merge** (`secondPassMerge`): Category-specific thresholds — background/text: 60, secondary: 50, primary: 35, accent: 25. Colors only merge within same category.
4. **Cap**: Top 30 candidates → 2nd pass → slice 12. Then `getDisplayColors` in page.tsx takes top 5 per category.

### Display color ordering (`app/page.tsx: CATEGORY_ORDER`)
```ts
["primary", "accent", "secondary", "background", "text"]
```
Max 5 per category, 25 total max displayed.

### Preset palette color mapping (`SitePreview.tsx`)
Extracted colors → preset palette using same CATEGORY_ORDER. Position 0 of each category maps to the corresponding preset role. Canvas pixel substitution threshold: 40px distance.

---

## Conventions

### TypeScript
- Strict mode enabled
- No `any` types — use proper generics or `unknown`
- All API responses typed via `types/index.ts`
- Path alias `@/` maps to project root
- `Array.from()` required for Map/StyleSheetList/CSSRuleList iteration (TS strict)

### React / Next.js
- App Router only (no pages directory)
- Server Components by default; add `"use client"` only for interactive components
- API routes in `app/api/`
- Puppeteer is server-side only — never import in client components

### Styling
- Tailwind CSS utility classes only
- Dark theme is the default; light theme applied via `document.documentElement.classList.remove("dark")`
- Theme persisted in `localStorage` key `"theme"`. Layout script restores on load (avoids flash).
- Accent color: violet (`violet-500`, `violet-600`)
- No inline styles except for dynamic color values from extracted data

### Theme Toggle
- **No `next-themes`** — replaced with manual DOM approach after persistent hydration failures
- `ThemeToggle.tsx` toggles `dark` class on `<html>`, writes to localStorage
- `app/layout.tsx` has inline `<script>` in `<head>` to restore theme before paint

### Testing
- Unit tests: Vitest, file pattern `tests/unit/*.test.ts` (50 tests)
- E2E tests: Playwright, file pattern `tests/e2e/*.spec.ts` (9 tests)
- Mock `/api/extract` in E2E tests using `page.route()`
- Use `getByRole()` not `getByText()` for elements that may have duplicate text (e.g., "ChromaLens" appears in h1 and footer)
- No snapshot tests — prefer explicit assertions

---

## Key Decisions

| Decision | Alternative | Reason |
|---|---|---|
| Puppeteer | fetch + CSS parse | Captures computed styles after JS rendering |
| System Chrome path | Bundled Chromium | SSL cert issues prevent Puppeteer's auto-download in corp network |
| Canvas API | D3.js | Avoids 80KB dependency for a simple color wheel |
| Canvas pixel substitution | iframe | CSP headers block iframe on most production sites |
| PNG screenshot | JPEG | Lossless required for accurate pixel color matching (< 40px threshold) |
| Manual theme toggle | next-themes | next-themes `useTheme()` returned `undefined` in App Router — hydration mismatch |
| 2-pass color merge | Single-pass | Reduces near-duplicate neutrals without over-merging distinct brand colors |
| Cap at 5 per category | No cap | Prevents 20–30 near-identical grays from flooding the palette |
| Grouping threshold 25 | 15 or 40 | 15 = too many near-duplicates; 40 = merges distinct brand colors |

---

## Running the App

```bash
# Install (skip Puppeteer Chrome download — use system Chrome)
PUPPETEER_SKIP_DOWNLOAD=true npm install

npm run dev        # dev server on :3000
npm test           # Vitest unit tests (50)
npm run test:e2e   # Playwright E2E (9)
npm run build      # production build
```

---

## Environment Notes

- **Windows 11**, bash shell, Node.js 20
- **SSL cert issues** on corp network: Google Fonts unavailable, Puppeteer Chrome download fails
  - Use system `font-sans` instead of Google Fonts
  - Use `PUPPETEER_SKIP_DOWNLOAD=true` and set `PUPPETEER_EXECUTABLE_PATH`
- **Chrome path**: `C:\Program Files\Google\Chrome\Application\chrome.exe` (hardcoded fallback)
- **Playwright**: Configured to use system Chrome (`launchOptions.executablePath`) — cannot download browsers via npm due to SSL

## Deployment

- Platform: **Railway** via Docker
- Base image: `node:20-slim` + `chromium` package
- `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` set in Railway env
- `maxDuration: 60` on the API route

---

## Known Limitations

- Cross-origin stylesheets may not be parsed (CORS). CSS text extraction is best-effort.
- Canvas pixel substitution works best on flat-color UIs; gradients and images are partially preserved.
- The theme preview shows the original screenshot with flat colors substituted — not a re-render of the actual site.
