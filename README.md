# ChromaLens

**웹사이트 색상 분석기 & 테마 리믹서**

URL만 입력하면 웹사이트의 색상 팔레트를 추출하고, 색상환으로 시각화하며, 다양한 색상 테마를 적용했을 때의 모습을 미리 볼 수 있는 웹 애플리케이션입니다.

---

## 문제 정의

디자이너와 개발자는 웹사이트의 색상 구성을 파악하거나 "테마를 바꾸면 어떻게 보일까?"를 확인하고 싶을 때, CSS 직접 검사·스크린샷·포토샵 작업 등 번거로운 수작업을 해야 합니다. ChromaLens는 이 전체 과정을 수 초 안에 자동화합니다.

## 해결 방법

1. **추출**: Puppeteer가 실제 브라우저로 URL을 방문해 모든 DOM 요소의 Computed Style에서 색상을 수집하고 정규화·중복 제거합니다.
2. **시각화**: 색상을 HSL 색상환(색조 × 채도 기준)에 배치하고, 비율 바로도 표시합니다.
3. **리믹스**: Nord, Dracula, Gruvbox 등 10가지 프리셋 팔레트를 선택해 새 색상이 적용된 사이트 목업을 즉시 확인합니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| URL 색상 추출 | Puppeteer 기반 Computed Style + CSS 스타일시트 파싱 |
| 색상 정규화 | HEX, RGB, HSL, RGBA, 명칭 색상 → 표준 HEX로 통일 |
| 지각적 색상 그룹핑 | 가중 유클리드 거리로 유사 색상 병합 |
| 색상환 시각화 | Canvas API로 렌더링, 점 크기 = 사용 빈도 |
| 비율 바 | 색상별 사용 비율을 한눈에 표시 |
| 클립보드 복사 | 스워치 클릭으로 HEX / RGB / HSL 값 복사 |
| 프리셋 팔레트 | 10가지 테마 (Nord, Dracula, Catppuccin, Gruvbox 등) |
| 테마 미리보기 | 선택한 팔레트가 적용된 UI 목업 즉시 렌더링 |

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript 5 |
| 스타일링 | Tailwind CSS 3 |
| 색상 추출 | Puppeteer 22 |
| 시각화 | HTML5 Canvas API |
| 단위 테스트 | Vitest + Testing Library |
| E2E 테스트 | Playwright |
| CI/CD | GitHub Actions |

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- npm 10+

### 설치

```bash
git clone https://github.com/codecaffeine-tech/ChromaLens.git
cd ChromaLens
npm install
```

### 개발 서버 실행

```bash
npm run dev
# → http://localhost:3000
```

### 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트 (빌드 후 실행)
npm run build && npm run test:e2e
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 프로젝트 구조

```
ChromaLens/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 + 메타데이터
│   ├── page.tsx                # 메인 페이지 (URL 입력 + 결과)
│   ├── globals.css             # Tailwind + 전역 스타일
│   └── api/extract/
│       └── route.ts            # POST /api/extract — 색상 추출 API
├── components/
│   ├── UrlInput.tsx            # URL 입력 폼 + 예시 바로가기
│   ├── ColorPalette.tsx        # 색상 스워치 그리드 + 비율 바
│   ├── ColorWheel.tsx          # Canvas HSL 색상환
│   ├── PaletteSelector.tsx     # 프리셋 테마 선택
│   └── SitePreview.tsx         # 테마 적용 목업 렌더러
├── lib/
│   ├── colorExtractor.ts       # Puppeteer 추출 + CSS 파싱 + 집계
│   ├── colorUtils.ts           # HEX/RGB/HSL 변환, 거리 계산, 대비색
│   └── palettes.ts             # 10가지 프리셋 팔레트 정의
├── types/index.ts              # 공유 TypeScript 타입
├── tests/
│   ├── unit/                   # Vitest 단위 테스트
│   └── e2e/                    # Playwright E2E 테스트
└── .github/workflows/ci.yml    # CI/CD 파이프라인
```

---

## API

### `POST /api/extract`

**요청 본문:**
```json
{ "url": "https://github.com" }
```

**응답:**
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

## 제작

- **제작자**: codecaffein@ubcare.co.kr
- **목적**: UBcare AI 해커톤 출품작
- **라이선스**: MIT
