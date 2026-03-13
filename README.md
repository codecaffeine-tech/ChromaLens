# ChromaLens

**Website Color Analyzer & Theme Remixer**

ChromaLens extracts color palettes from any live website, visualizes them on an interactive color wheel, and lets you preview the site with alternative color themes applied.

---

## Problem

Designers and developers often need to audit a website's color usage or explore "what if we changed the theme?" — but doing so manually (inspecting CSS, screenshotting, Photoshop overlays) is slow and tedious. ChromaLens automates the entire pipeline in seconds.

## Solution

1. **Extract**: Puppeteer visits the URL headlessly, collects computed CSS colors from every DOM element, and normalizes + deduplicates them.
2. **Visualize**: Colors are plotted on an HSL color wheel (by hue × saturation) and shown as a proportion bar.
3. **Remix**: Pick from 10 preset palettes (Nord, Dracula, Gruvbox, etc.) and see a live mock-up of the site with the new colors applied.

---

## Features

| Feature | Description |
|---|---|
| URL color extraction | Puppeteer-based extraction of computed styles + CSS stylesheets |
| Color normalization | Hex, RGB, HSL, RGBA, named colors → canonical hex |
| Perceptual grouping | Weighted Euclidean distance merges near-duplicate colors |
| Color wheel | Canvas-rendered HSL wheel with frequency-weighted dots |
| Proportion bar | Shows relative color usage at a glance |
| Copy to clipboard | Click any swatch to copy HEX / RGB / HSL |
| Preset palettes | 10 curated themes: Nord, Dracula, Catppuccin, Gruvbox, and more |
| Theme preview mock-up | Applies palette to a realistic UI wireframe |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Color extraction | Puppeteer 22 |
| Visualization | HTML5 Canvas API |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |
| CI/CD | GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone <repo-url>
cd ChromaLens
npm install
```

### Development

```bash
npm run dev
# → http://localhost:3000
```

### Testing

```bash
# Unit tests
npm test

# E2E tests (requires running dev server or build)
npm run build && npm run test:e2e
```

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
ChromaLens/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Main page (URL input + results)
│   ├── globals.css         # Tailwind + global styles
│   └── api/extract/
│       └── route.ts        # POST /api/extract — Puppeteer color extraction
├── components/
│   ├── UrlInput.tsx        # URL input form + example shortcuts
│   ├── ColorPalette.tsx    # Color swatches grid + proportion bar
│   ├── ColorWheel.tsx      # Canvas HSL wheel visualization
│   ├── PaletteSelector.tsx # Preset theme picker
│   └── SitePreview.tsx     # Theme mock-up renderer
├── lib/
│   ├── colorExtractor.ts   # Puppeteer extraction + CSS parsing + aggregation
│   ├── colorUtils.ts       # HEX/RGB/HSL conversions, distance, contrast
│   └── palettes.ts         # 10 preset palette definitions
├── types/index.ts          # Shared TypeScript types
├── tests/
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
└── .github/workflows/ci.yml
```

---

## API

### `POST /api/extract`

**Request body:**
```json
{ "url": "https://github.com" }
```

**Response:**
```json
{
  "url": "https://github.com",
  "colors": [
    {
      "hex": "#0d1117",
      "rgb": { "r": 13, "g": 17, "b": 23 },
      "hsl": { "h": 216, "s": 28, "l": 7 },
      "frequency": 142,
      "percentage": 22.3,
      "category": "background"
    }
  ],
  "totalColors": 15,
  "dominantColor": "#0d1117",
  "extractedAt": "2026-03-13T10:00:00.000Z"
}
```

---

## License

MIT — Built for AI Hackathon 2026.
