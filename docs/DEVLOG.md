# ChromaLens — Development Log

## 2026-03-13 — Project Bootstrap

### Completed
- [x] Project directory structure created
- [x] `package.json` with all dependencies (Next.js 14, Puppeteer, Vitest, Playwright)
- [x] TypeScript + Tailwind CSS configuration
- [x] `CLAUDE.md` AI context file
- [x] `README.md` with full PRD, API docs, project structure

### Core Implementation
- [x] `types/index.ts` — shared type definitions
- [x] `lib/colorUtils.ts` — HEX/RGB/HSL conversions, perceptual distance, contrast
- [x] `lib/colorExtractor.ts` — CSS parsing, normalization, aggregation, Puppeteer extraction
- [x] `lib/palettes.ts` — 10 preset palettes
- [x] `app/api/extract/route.ts` — POST endpoint with URL validation
- [x] `app/layout.tsx` + `app/globals.css`
- [x] `app/page.tsx` — main page with state machine
- [x] `components/UrlInput.tsx` — URL form with examples
- [x] `components/ColorPalette.tsx` — swatches, proportion bar, copy to clipboard
- [x] `components/ColorWheel.tsx` — Canvas HSL wheel
- [x] `components/PaletteSelector.tsx` — 10 preset theme cards
- [x] `components/SitePreview.tsx` — mock UI with palette applied

### Tests
- [x] `tests/unit/colorUtils.test.ts` — 25+ unit tests for color math
- [x] `tests/unit/colorExtractor.test.ts` — tests for normalization, extraction, aggregation
- [x] `tests/e2e/main.spec.ts` — 8 E2E test scenarios with mocked API

### CI/CD
- [x] `.github/workflows/ci.yml` — lint, type check, unit tests, E2E, build

---

## Next Steps (TODO)

### High Priority
- [ ] `npm install` — install all dependencies
- [ ] Fix any TypeScript errors from `npx tsc --noEmit`
- [ ] `npm run dev` — verify app runs locally
- [ ] `npm test` — verify unit tests pass
- [ ] Git init + first commit

### Enhancements
- [ ] Add color accessibility audit (WCAG contrast ratio)
- [ ] Export palette as CSS variables / Figma tokens / JSON
- [ ] Persistent history (localStorage) of analyzed URLs
- [ ] Actual screenshot-based preview (Puppeteer render with CSS override injection)
- [ ] Color harmony analysis (complementary, triadic, analogous)

---

## Architecture Notes

### Why Puppeteer over CSS-only parsing?
Static CSS parsing misses JS-rendered components (React, Vue, etc.). Puppeteer captures the final computed state.

### Why Canvas API over D3.js?
The color wheel is a custom visualization. D3.js adds 80KB for features we don't need. Canvas API is sufficient and faster.

### Color grouping threshold = 25
- Too low (< 15): keeps too many near-identical variants
- Too high (> 40): merges visually distinct colors
- 25 is empirically good for web color palettes

---

## Issues & Resolutions

### Issue: `create-next-app` rejects "ChromaLens" as package name
- **Root cause**: npm naming rules disallow uppercase letters in package names
- **Resolution**: Manually created all config files. `package.json` uses lowercase `"chromalens"` as name.
