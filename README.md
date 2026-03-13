# ChromaLens

**웹사이트 색상 분석기 & 테마 리믹서**

URL만 입력하면 웹사이트의 색상 팔레트를 추출하고, 색상환으로 시각화하며, 다양한 색상 테마를 적용했을 때의 모습을 미리 볼 수 있는 웹 애플리케이션입니다.

![ChromaLens 스크린샷](docs/screenshot.png)

---

## 문제 정의

신규 홈페이지를 개발할 때 "어떤 색상 팔레트를 적용해야 하지?"라는 고민은 생각보다 오래 걸린다. 레퍼런스 사이트의 색상이 마음에 들어도 실제로 어떤 값인지 파악하려면 DevTools를 열고 요소를 하나씩 검사해야 하고, 다른 팔레트를 적용해보려면 CSS를 직접 수정하거나 디자인 툴에서 다시 작업해야 한다. 이 과정을 색상 후보마다 반복하면 수십 분, 길게는 수 시간이 소요된다.

기존 컬러 도구들(Coolors, ColorHunt, Adobe Color)은 팔레트 영감을 주지만, **실제 서비스 중인 사이트에서 색상을 뽑아** 내 사이트에 바로 적용해볼 수 있는 기능은 없다. 또한 JS 렌더링 이후의 Computed Style을 반영하지 못해 SPA 기반 사이트에서는 결과가 부정확하다.

**ChromaLens는 이 전체 과정을 수 초 안에 자동화합니다.**

## 시장 맥락

| | 기존 도구 | ChromaLens |
|---|---|---|
| 색상 소스 | 수동 입력, 큐레이션 팔레트 | 실제 웹사이트 URL |
| 추출 방식 | 정적 CSS 파싱 | Puppeteer Computed Style (JS 렌더링 반영) |
| 테마 미리보기 | 없음 | 실제 스크린샷에 픽셀 단위 색상 교체 |
| 주요 타깃 | 일반 디자이너 | 프론트엔드 개발자, UI/UX 디자이너, 디자인 시스템 담당자 |

## 목표

| 목표 | 성공 기준 |
|---|---|
| 정확한 색상 추출 | JS 렌더링 완료 후 Computed Style 기준으로 색상 수집 |
| 빠른 분석 | 대부분의 사이트에서 30초 이내 결과 반환 |
| 실용적 시각화 | 추출된 색상을 카테고리(주요/강조/보조/배경/텍스트)로 분류 |
| 테마 미리보기 | 10가지 프리셋 팔레트를 실제 스크린샷에 픽셀 수준으로 적용 |
| 접근성 | 다크/라이트 테마 전환 지원 |

## 대상 사용자

- **UI/UX 디자이너**: 경쟁사 사이트의 색상 구성을 빠르게 파악하고 팔레트 영감을 얻고 싶은 사람
- **프론트엔드 개발자**: 기존 사이트에 다른 색상 테마를 적용했을 때의 결과를 확인하고 싶은 사람
- **디자인 시스템 담당자**: 웹사이트에서 실제로 사용 중인 색상 인벤토리를 추출해야 하는 사람

---

## 해결 방법

1. **추출**: Puppeteer가 실제 브라우저로 URL을 방문해 모든 DOM 요소의 Computed Style에서 색상을 수집하고 정규화·중복 제거합니다.
2. **시각화**: 색상을 HSL 색상환(색조 × 채도 기준)에 배치하고, 카테고리별 비율 바로도 표시합니다.
3. **리믹스**: Linear, Vercel, Nord, Dracula, Catppuccin 등 10가지 프리셋 팔레트를 선택해 새 색상이 실제 스크린샷에 적용된 결과를 즉시 확인합니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| URL 색상 추출 | Puppeteer 기반 Computed Style + CSS 스타일시트 파싱 |
| 색상 정규화 | HEX, RGB, HSL, RGBA, 명칭 색상 → 표준 HEX로 통일 |
| 지각적 색상 그룹핑 | 1차: 가중 유클리드 거리(임계값 25)로 유사 색상 병합 |
| 카테고리 인식 2차 병합 | 카테고리별 다른 임계값(background 60 / accent 25)으로 정밀 정제 |
| 카테고리별 색상 제한 | 카테고리당 최대 5개, 전체 최대 12개로 노이즈 제거 |
| 색상환 시각화 | Canvas API로 렌더링, 점 크기 = 사용 빈도 |
| 비율 바 | 색상별 사용 비율을 한눈에 표시 |
| 클립보드 복사 | 스워치 클릭으로 HEX / RGB / HSL 값 복사 |
| 프리셋 팔레트 | 10가지 트렌드 테마 (Linear, Vercel, Midnight, Nord, Dracula 등) |
| 스크린샷 기반 테마 미리보기 | Canvas 픽셀 치환으로 실제 스크린샷에 테마 색상 적용 |
| Before/After 슬라이더 | 원본과 테마 적용본을 드래그로 비교 |
| 다크/라이트 테마 | 다크 테마 기본, localStorage 기반 영속 저장 |

---

## 비기능 요구사항

| 항목 | 기준 |
|---|---|
| 응답 시간 | API 최대 타임아웃 60초, 일반 사이트 30초 이내 |
| 색상 수 | 추출 색상 카테고리당 최대 5개, 전체 최대 12개 |
| 브라우저 지원 | Chrome/Edge (Canvas API 필수) |
| 테마 미리보기 해상도 | 1280×720 PNG 스크린샷 기준 |

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript 5 (strict mode) |
| 스타일링 | Tailwind CSS 3 |
| 색상 추출 | Puppeteer 22 |
| 시각화 | HTML5 Canvas API |
| 단위 테스트 | Vitest + Testing Library |
| E2E 테스트 | Playwright |
| CI/CD | GitHub Actions |
| 배포 | Railway (Docker, node:20-slim + chromium) |

---

## CI/CD 파이프라인

GitHub Actions로 자동화된 5단계 파이프라인이 구축되어 있습니다. master 브랜치 push 시 자동 실행되며, Railway가 GitHub와 연동되어 모든 job 성공 후 프로덕션에 자동 배포됩니다.

```
push to master
  │
  ├─ Lint & Type Check   — ESLint + TypeScript 컴파일 오류 검사
  ├─ Unit Tests          — Vitest 50개, 커버리지 임계값 검증 (stmt 80% / branch 75%)
  ├─ Production Build    — Next.js 프로덕션 빌드 성공 여부
  ├─ E2E Tests           — Playwright 11개 (실제 브라우저, API mock)
  └─ Deployment Check    — Railway 배포 완료 후 프로덕션 URL 헬스체크
```

- **배포 URL**: https://chromalens-production.up.railway.app
- **커버리지 리포트**: GitHub Actions Step Summary에 자동 출력
- **E2E 결과**: Playwright HTML 리포트 생성

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- npm 10+
- Google Chrome (Puppeteer가 시스템 Chrome을 사용)

### 설치

```bash
git clone https://github.com/codecaffeine-tech/ChromaLens.git
cd ChromaLens
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

### 개발 서버 실행

```bash
npm run dev
# → http://localhost:3000
```

### 테스트

```bash
# 단위 테스트 (50개)
npm test

# 커버리지 포함 단위 테스트
npm run test:coverage

# E2E 테스트 (11개)
npm run test:e2e
```

#### 테스트 커버리지 현황

| 항목 | 달성 | 임계값 |
|---|---|---|
| Statements | 93.4% | 80% |
| Branches | 81.9% | 75% |
| Functions | 95.2% | 80% |
| Lines | 93.4% | 80% |

- 단위 테스트: `lib/colorUtils.ts`, `lib/colorExtractor.ts` 핵심 로직 50개
- E2E 테스트: URL 입력 → 분석 → 결과 표시 → 탭 네비게이션 → 테마 토글 11개
- Puppeteer I/O(`extractColorsFromUrl`)는 `/* v8 ignore */` 명시적 제외

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 환경 변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `PUPPETEER_EXECUTABLE_PATH` | `C:\Program Files\Google\Chrome\Application\chrome.exe` | Chrome 실행 경로 (배포 환경에서 오버라이드) |
| `PUPPETEER_SKIP_DOWNLOAD` | — | `true`로 설정 시 Puppeteer 내장 Chrome 다운로드 스킵 |

---

## 프로젝트 구조

```
ChromaLens/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 + 메타데이터 + 다크테마 스크립트
│   ├── page.tsx                # 메인 페이지 (idle/loading/success/error 상태 기계)
│   ├── globals.css             # Tailwind + 전역 스타일
│   └── api/extract/
│       └── route.ts            # POST /api/extract — 색상 추출 API
├── components/
│   ├── UrlInput.tsx            # URL 입력 폼 + 예시 사이트 바로가기
│   ├── ColorPalette.tsx        # 카테고리별 스워치 그리드 + 비율 바
│   ├── ColorWheel.tsx          # Canvas HSL 색상환
│   ├── PaletteSelector.tsx     # 프리셋 테마 선택 UI
│   ├── SitePreview.tsx         # Canvas 픽셀 치환 테마 미리보기
│   ├── BeforeAfterSlider.tsx   # 드래그 슬라이더 (원본/테마 비교)
│   └── ThemeToggle.tsx         # 다크/라이트 테마 전환 버튼
├── lib/
│   ├── colorExtractor.ts       # Puppeteer 추출 + CSS 파싱 + 집계
│   ├── colorUtils.ts           # HEX/RGB/HSL 변환, 거리 계산, 2차 병합
│   └── palettes.ts             # 10가지 프리셋 팔레트 정의
├── types/index.ts              # 공유 TypeScript 타입
├── tests/
│   ├── unit/                   # Vitest 단위 테스트 (50개)
│   └── e2e/                    # Playwright E2E 테스트 (9개)
├── docs/
│   └── DEVLOG.md               # 개발 진행 기록
├── CLAUDE.md                   # AI 컨텍스트 파일
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
  "totalColors": 12,
  "dominantColor": "#0d1117",
  "screenshot": "data:image/png;base64,...",
  "extractedAt": "2026-03-13T10:00:00.000Z"
}
```

**에러 응답:**
```json
{ "error": "유효하지 않은 URL 형식입니다." }
```

| 상태 코드 | 설명 |
|---|---|
| 200 | 성공 |
| 400 | 유효하지 않은 URL |
| 500 | 서버 오류 (Puppeteer 실패 등) |

---

## 제작

- **제작자**: codecaffein@ubcare.co.kr
- **목적**: UBcare AI 해커톤 출품작
- **라이선스**: MIT
