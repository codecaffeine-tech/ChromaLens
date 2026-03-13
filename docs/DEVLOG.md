# ChromaLens — Development Log

## 2026-03-13 — Day 1 (Full Sprint)

---

### Phase 1: 프로젝트 초기화

**목표**: Next.js 14 + TypeScript + Tailwind 프로젝트 셋업

**문제**: `create-next-app`이 "ChromaLens" 폴더명을 패키지명으로 사용 불가(대문자 불허)
**해결**: 모든 설정 파일(package.json, tsconfig.json, next.config.mjs, tailwind.config.ts) 수동 생성. package.json의 `name` 필드는 소문자 `"chromalens"` 사용.

**문제**: `next.config.ts`가 Next.js 14.2.x에서 지원되지 않음
**해결**: `next.config.mjs`로 변경.

**문제**: Google Fonts(Inter) 로드 실패 — 사내 네트워크 SSL 인증서 문제
**해결**: Google Fonts import 제거, 시스템 `font-sans` 사용.

**완료**:
- [x] `CLAUDE.md` — AI 컨텍스트 파일 (아키텍처, 컨벤션, 색상 시스템, 결정 근거)
- [x] `README.md` — 문제 정의, 기능 명세, API 문서, 프로젝트 구조
- [x] GitHub 리포지토리 생성 및 초기 커밋 푸시

---

### Phase 2: 핵심 로직 구현

**색상 추출 엔진** (`lib/colorExtractor.ts`, `lib/colorUtils.ts`):
- Puppeteer로 실제 브라우저 렌더링 → 모든 DOM 요소의 `getComputedStyle`에서 색상 수집
- CSS 스타일시트에서 HEX/RGB/HSL/명칭 색상 정규표현식 추출 (정적 CSS 보완)
- 가중 유클리드 거리(인간 시각 모델)로 유사 색상 병합 (임계값 25)

**문제**: `isNearlyTransparent` 함수에서 `rgba?` 정규식이 `rgb(r, g, b)` 형식의 blue 채널 0값을 투명도로 오인
**해결**: 정규식을 `rgba` (? 제거) 로 수정하여 `rgba(...)` 형식만 매칭.

**문제**: TypeScript strict 모드에서 `Map`, `StyleSheetList`, `CSSRuleList` 이터레이션 오류
**해결**: 모든 이터러블에 `Array.from()` 적용.

**완료**:
- [x] `types/index.ts` — ExtractedColor, ColorExtractionResult, PresetPalette 타입
- [x] `lib/colorUtils.ts` — HEX↔RGB↔HSL 변환, 지각적 거리, 대비색, 정규화
- [x] `lib/colorExtractor.ts` — Puppeteer 추출, CSS 파싱, 색상 집계
- [x] `lib/palettes.ts` — 10가지 프리셋 팔레트 (Nord, Dracula, Catppuccin, Gruvbox 등)
- [x] 단위 테스트 50개 작성 및 통과 확인

---

### Phase 3: UI 구현

**완료**:
- [x] `app/page.tsx` — 상태 기계 (idle/loading/success/error) + 탭 네비게이션
- [x] `components/UrlInput.tsx` — URL 입력 폼, 예시 사이트 바로가기
- [x] `components/ColorPalette.tsx` — 카테고리별 스워치 그리드, 비율 바, HEX/RGB/HSL 복사
- [x] `components/ColorWheel.tsx` — Canvas API 기반 HSL 색상환 (점 크기 = 사용 빈도)
- [x] `components/PaletteSelector.tsx` — 10가지 테마 카드 선택 UI
- [x] `components/SitePreview.tsx` — 테마 적용 UI 목업 렌더러

---

### Phase 4: 기능 고도화

**Puppeteer 스크린샷 추가**:
- 분석 완료 후 사이트 스크린샷(1280×720)을 JPEG base64로 반환 → PNG 무손실로 변경

**문제**: Puppeteer가 내장 Chromium 대신 시스템 Chrome 경로를 필요로 함 (SSL 환경)
**해결**: `executablePath`를 `C:\Program Files\Google\Chrome\Application\chrome.exe`로 하드코딩, 환경변수 `PUPPETEER_EXECUTABLE_PATH` 오버라이드 지원.

**Canvas 기반 스크린샷 색상 교체**:
- `SitePreview` 컴포넌트에 Canvas `getImageData`/`putImageData` 기반 픽셀 치환 엔진 구현
- `Int32Array` 플랫 배열 + 제곱 거리 비교(sqrt 제거)로 ~92만 픽셀 처리 최적화
- 임계값 40px 이내 픽셀만 치환하여 사진·그라디언트 보존

**카테고리별 체크박스 색상 선택**:
- 색상 매핑 항목별 체크박스 추가 — 체크된 카테고리만 Canvas 치환에 포함
- 체크 해제 즉시 재처리, 상단 스크린샷까지 실시간 반영

**완료**:
- [x] PNG 무손실 스크린샷 캡처
- [x] Canvas 픽셀 색상 교체 (테마 미리보기 탭 ↔ 원본 탭 전환 연동)
- [x] 카테고리별 체크박스 선택적 색상 적용
- [x] 팔레트 카테고리 계층 순서 확정: 주요색 > 강조색 > 보조색 > 배경색 > 텍스트

---

### Phase 5: 검증 및 마무리

**문제**: 개발 서버 좀비 프로세스 누적으로 포트 3000~3004가 모두 점유됨
**원인**: 각 세션마다 `npm run dev` 백그라운드 실행 후 미종료
**해결**: `taskkill`로 해당 PID 전부 종료 후 포트 3000에서 재시작.

**문제**: API가 `text/html` 응답을 JSON으로 파싱 시도하여 "Unexpected token '<'" 오류
**해결**: 클라이언트에서 `Content-Type` 헤더 사전 검사 후 JSON 파싱. API 라우트의 JSON 파싱 오류를 별도 try/catch로 분리.

**완료**:
- [x] E2E 검증: naver.com 분석 → 20색 추출 → 스크린샷 캡처 → 카테고리 계층 표시
- [x] `npm run build` 프로덕션 빌드 성공 확인
- [x] GitHub Actions CI/CD 파이프라인 구축 및 브랜치 연결
- [x] 커버리지 측정 설정 (`@vitest/coverage-v8`, lcov 리포트)

---

## 아키텍처 결정

| 결정 | 대안 | 선택 이유 |
|---|---|---|
| Puppeteer | fetch + CSS 파싱 | JS 렌더링 후 computed style 캡처 필요 |
| Canvas API | D3.js | 단순 색상환에 80KB 라이브러리 불필요 |
| Mock UI → Canvas 픽셀 교체 | iframe | CSP 헤더로 iframe 차단되는 사이트 대부분 |
| PNG 스크린샷 | JPEG | 무손실이어야 정확한 픽셀 색상 매칭 가능 |
| 색상 그룹핑 임계값 25 | 15 또는 40 | 15: 유사 변형 과잉 보존 / 40: 구별되는 브랜드 색 합병 |
