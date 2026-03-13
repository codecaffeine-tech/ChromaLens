# ChromaLens — AI Context File

## Project Summary

ChromaLens is a Next.js 14 web app that extracts color palettes from any website URL using Puppeteer, visualizes them on a color wheel, and previews the site with remixed color themes.

Built for an AI hackathon (1-2 day sprint). Prioritize working features over polish.

---

## Core Architecture

### Data Flow

```
User enters URL
  → POST /api/extract  (Next.js API route)
  → Puppeteer visits URL headlessly
  → Collects computed CSS colors from all DOM elements
  → Extracts colors from CSS stylesheets
  → Normalizes: HEX/RGB/HSL/named → canonical lowercase hex
  → Groups perceptually similar colors (weighted Euclidean distance < 25)
  → Sorts by frequency → returns ExtractedColor[]
  → Client renders ColorPalette + ColorWheel + PaletteSelector/SitePreview
```

### Key Files

| File | Purpose |
|---|---|
| `app/page.tsx` | Main page: state machine (idle/loading/success/error), tab navigation |
| `app/api/extract/route.ts` | POST handler, URL validation, calls `extractColorsFromUrl` |
| `lib/colorExtractor.ts` | Puppeteer logic, CSS parsing, color normalization, aggregation |
| `lib/colorUtils.ts` | Pure color math: hex↔rgb↔hsl conversions, distance, contrast |
| `lib/palettes.ts` | 10 preset palettes (Nord, Dracula, Catppuccin, etc.) |
| `components/ColorWheel.tsx` | Canvas API — plots colors by hue+saturation |
| `components/SitePreview.tsx` | Mock UI wireframe with palette colors applied |
| `types/index.ts` | Shared types: ExtractedColor, ColorExtractionResult, PresetPalette |

---

## Conventions

### TypeScript
- Strict mode enabled
- No `any` types — use proper generics or `unknown`
- All API responses typed via `types/index.ts`
- Path alias `@/` maps to project root

### React / Next.js
- App Router only (no pages directory)
- Server Components by default; add `"use client"` only for interactive components
- API routes in `app/api/`
- Puppeteer is server-side only — never import in client components

### Styling
- Tailwind CSS utility classes only
- Dark theme first (`bg-gray-950`, `text-gray-100`)
- Accent color: violet (`violet-500`, `violet-600`)
- No inline styles except for dynamic color values from extracted data

### Testing
- Unit tests: Vitest, file pattern `tests/unit/*.test.ts`
- E2E tests: Playwright, file pattern `tests/e2e/*.spec.ts`
- Mock `/api/extract` in E2E tests using `page.route()`
- No snapshot tests — prefer explicit assertions

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

### Color categorization logic (in `colorUtils.ts`)
- `l > 90 || (s < 10 && l > 80)` → `background`
- `l < 15 || (s < 10 && l < 20)` → `text`
- `s > 60 && l in 40–70` → `accent`
- `s < 20` → `secondary`
- else → `primary`

### Perceptual grouping
Uses weighted Euclidean distance with human vision model (R/G/B weights based on average R value). Threshold: 25 units.

---

## Key Decisions

1. **Puppeteer over fetch+parse**: Captures computed styles including JS-rendered elements, not just static HTML/CSS.
2. **Canvas API over D3.js**: Simpler for custom color wheel; no additional dependency weight.
3. **Mock UI preview over iframe**: iframes are blocked by CSP headers on most sites; a mock wireframe avoids that entirely.
4. **Perceptual grouping at 25 threshold**: Merges color variants (#1a1a1b vs #1a1b1c) without over-merging distinct brand colors.

---

## Running the App

```bash
npm run dev        # dev server on :3000
npm test           # Vitest unit tests
npm run test:e2e   # Playwright E2E
npm run build      # production build
```

---

## Known Limitations

- Puppeteer requires Chromium (~170MB). In CI, use `--with-deps` for Playwright.
- Cross-origin stylesheets may not be parsed (CORS). CSS text extracted is best-effort.
- `maxDuration: 60` on the API route — heavy sites may time out.
- The theme preview is a mock wireframe, not the actual rendered site.
