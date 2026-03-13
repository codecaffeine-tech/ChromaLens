# ChromaLens — Product Requirements Document

## 1. 제품 개요

**제품명**: ChromaLens
**버전**: 1.0.0
**작성일**: 2026-03-13
**목적**: AI 해커톤 출품작 — 웹사이트 URL에서 색상 팔레트를 추출·시각화하고 테마 교체 미리보기를 제공하는 웹 애플리케이션

---

## 2. 사용자 스토리 (User Stories)

### Epic 1: 색상 추출

| ID | 스토리 | 우선순위 |
|---|---|---|
| US-01 | 디자이너로서, URL을 입력하면 해당 웹사이트에서 실제 사용 중인 색상을 자동으로 추출받고 싶다. 매번 DevTools를 열지 않아도 되도록. | P0 |
| US-02 | 개발자로서, JS 렌더링 이후의 computed style 기준으로 색상이 추출되길 원한다. SPA 사이트의 색상도 빠짐없이 포함하기 위해. | P0 |
| US-03 | 사용자로서, 분석 중에 현재 어느 단계인지(브라우저 실행 → 페이지 로딩 → 색상 추출 → 스크린샷 캡처 → 마무리) 진행 상황을 알고 싶다. 응답을 기다리는 동안 막막하지 않도록. | P1 |
| US-04 | 사용자로서, 분석이 실패했을 때 명확한 오류 메시지를 보고 싶다. 무엇이 잘못됐는지 알고 다시 시도할 수 있도록. | P1 |

### Epic 2: 색상 시각화

| ID | 스토리 | 우선순위 |
|---|---|---|
| US-05 | 디자이너로서, 추출된 색상이 primary / accent / secondary / background / text 카테고리로 분류되어 표시되길 원한다. 사이트의 색상 계층을 한눈에 파악하기 위해. | P0 |
| US-06 | 개발자로서, 각 색상의 HEX, RGB, HSL 값을 클릭 한 번으로 클립보드에 복사하고 싶다. CSS 코드에 바로 붙여넣기 위해. | P1 |
| US-07 | 디자이너로서, 색상들이 색상환(Color Wheel) 위에 배치된 모습을 보고 싶다. 색조(Hue) 분포와 채도 관계를 직관적으로 이해하기 위해. | P1 |
| US-08 | 사용자로서, 각 색상이 전체 팔레트에서 차지하는 비율(%)을 바 차트로 보고 싶다. 어떤 색이 지배적인지 파악하기 위해. | P1 |

### Epic 3: 테마 미리보기

| ID | 스토리 | 우선순위 |
|---|---|---|
| US-09 | 프론트엔드 개발자로서, 분석한 웹사이트에 다른 색상 테마(예: Nord, Dracula)를 적용했을 때의 모습을 실제 스크린샷으로 미리 보고 싶다. CSS를 직접 수정하지 않고. | P0 |
| US-10 | 디자이너로서, 원본과 테마 적용본을 슬라이더로 나란히 비교하고 싶다. 변화 전후를 정확히 확인하기 위해. | P1 |
| US-11 | 사용자로서, Linear, Vercel, Nord, Dracula 등 트렌디한 프리셋 팔레트 중에서 선택할 수 있길 원한다. 직접 색상값을 입력하지 않아도 되도록. | P1 |

### Epic 4: 접근성 & UX

| ID | 스토리 | 우선순위 |
|---|---|---|
| US-12 | 사용자로서, 다크 모드와 라이트 모드를 수동으로 전환할 수 있길 원한다. 작업 환경에 맞게 UI를 조정하기 위해. | P1 |
| US-13 | 사용자로서, 예시 URL 버튼(naver.com, kakao.com, toss.im)을 클릭해 바로 분석을 시작할 수 있길 원한다. 처음 사용 시 진입 장벽을 낮추기 위해. | P2 |

---

## 3. 기능 요구사항

### 3.1 색상 추출 API (`POST /api/extract`)

| 요구사항 ID | 요구사항 | 수용 기준 |
|---|---|---|
| FR-01 | URL 유효성 검사 | `http://` 또는 `https://`로 시작하지 않는 URL은 400 에러 반환 |
| FR-02 | Puppeteer Computed Style 수집 | DOM의 모든 요소에서 `color`, `background-color`, `border-color` 등 11개 CSS 프로퍼티 수집 |
| FR-03 | CSS 스타일시트 파싱 | 페이지에 로드된 스타일시트에서 HEX/RGB/HSL/명칭 색상을 정규식으로 추가 수집 |
| FR-04 | 색상 정규화 | HEX(대소문자), 3자리 HEX, RGB, RGBA, HSL, HSLA, CSS 명칭 → 소문자 6자리 HEX로 통일 |
| FR-05 | 무효 색상 제거 | `transparent`, `inherit`, `currentColor`, 완전 투명(alpha=0) 제거 |
| FR-06 | 1차 유사 색상 그룹핑 | 가중 유클리드 거리(인간 시각 모델) < 25인 색상을 빈도 기준 대표색으로 병합 |
| FR-07 | 2차 카테고리별 병합 | 카테고리별 임계값(background/text: 60, secondary: 50, primary: 35, accent: 25)으로 추가 병합 |
| FR-08 | 색상 카테고리 분류 | HSL 값 기준으로 primary / accent / secondary / background / text 5종 분류 |
| FR-09 | 결과 수 제한 | 최종 결과 최대 12개 (카테고리당 최대 5개) |
| FR-10 | 스크린샷 캡처 | 1280×720 PNG 무손실 스크린샷을 base64로 응답에 포함 |
| FR-11 | 타임아웃 | 60초 초과 시 504 에러 반환 |

### 3.2 색상 팔레트 UI

| 요구사항 ID | 요구사항 | 수용 기준 |
|---|---|---|
| FR-12 | 카테고리별 스워치 표시 | `primary → accent → secondary → background → text` 순서로 색상 카드 렌더링 |
| FR-13 | 색상 값 표시 | 각 스워치에 HEX, RGB, HSL 값 표시 |
| FR-14 | 클립보드 복사 | 스워치 클릭 → 포맷 선택 모달 → HEX/RGB/HSL 복사 → "복사됨" 피드백 |
| FR-15 | 비율 바 | 각 색상의 `percentage`를 시각적 바로 표시 |

### 3.3 색상환

| 요구사항 ID | 요구사항 | 수용 기준 |
|---|---|---|
| FR-16 | HSL 색상환 렌더링 | Canvas API로 원형 HSL 색상환 렌더링, 추출된 색상을 극좌표(hue, saturation)로 배치 |
| FR-17 | 빈도 기반 점 크기 | 사용 빈도가 높을수록 큰 원으로 표시 |
| FR-18 | 반응형 크기 조정 | ResizeObserver로 컨테이너 너비 감지 → canvas 크기 동적 조정 (최대 360px) |

### 3.4 테마 미리보기

| 요구사항 ID | 요구사항 | 수용 기준 |
|---|---|---|
| FR-19 | 프리셋 팔레트 10종 | Linear, Vercel, Midnight, Bento, Crème, Nord, Catppuccin Mocha, Rosé Pine, Dracula, Everforest |
| FR-20 | Canvas 픽셀 색상 교체 | 원본 스크린샷에서 추출 색상과 유사한(거리 < 40) 픽셀을 프리셋 색상으로 치환 |
| FR-21 | Before/After 슬라이더 | 드래그로 원본(오른쪽)과 테마 적용본(왼쪽) 비교 |
| FR-22 | 팔레트 미선택 상태 | 프리셋 미선택 시 "팔레트를 선택해주세요" 안내 표시 |

---

## 4. 비기능 요구사항 (NFR)

| ID | 항목 | 요구사항 | 측정 기준 |
|---|---|---|---|
| NFR-01 | 응답 시간 | 일반적인 웹사이트 분석 30초 이내 완료 | Puppeteer 타임아웃 45초, API 최대 60초 |
| NFR-02 | 색상 처리 성능 | 100개 색상 집계 50ms 이내 | `performance.test.ts` 타이밍 단언 |
| NFR-03 | 색상 처리 성능 | 500개 색상 집계 200ms 이내 | `performance.test.ts` 타이밍 단언 |
| NFR-04 | 색상 처리 성능 | 1000개 CSS 규칙 파싱 100ms 이내 | `performance.test.ts` 타이밍 단언 |
| NFR-05 | 결과 정확도 | 유사 색상(ΔE < 25)은 반드시 하나로 병합 | `pipeline.integration.test.ts` 검증 |
| NFR-06 | 브라우저 지원 | Chrome/Edge (Canvas API 필수) | Chromium 기반 브라우저 |
| NFR-07 | 스크린샷 해상도 | 1280×720 PNG | `route.ts` viewport 설정 |
| NFR-08 | 번들 크기 | 불필요 대형 의존성 미포함 | chroma-js, D3.js 미포함, Canvas API 직접 사용 |
| NFR-09 | 테스트 커버리지 | Statements ≥ 80%, Branches ≥ 75%, Functions ≥ 80% | Vitest v8 coverage — 실제: Stmt 97%, Branch 95%, Func 95% |
| NFR-10 | CI/CD | master push 시 lint → typecheck → unit test → E2E → build → deploy-check 자동 실행 | GitHub Actions |
| NFR-11 | 보안 | SQL Injection, XSS 등 OWASP Top 10 방어 | URL 입력은 서버에서 `new URL()` 파싱 검증 |
| NFR-12 | 접근성 | 다크/라이트 테마 전환 지원, localStorage 기반 영속 저장 | `ThemeToggle.tsx` + layout 인라인 스크립트 |

---

## 5. 제약 사항 및 가정

| 항목 | 내용 |
|---|---|
| 크로스오리진 CSS | CORS 정책으로 외부 스타일시트 파싱이 차단될 수 있음 → Computed Style로 보완 |
| Canvas 픽셀 치환 | 그라디언트·이미지 영역은 정확도 낮음. 평면 색상 UI에서 최적 동작 |
| 인증 필요 페이지 | 로그인이 필요한 사이트의 인증 후 화면은 분석 불가 |
| Puppeteer 환경 | Docker 배포 환경에서 `chromium` 패키지 필요 (`node:20-slim` + `apt-get install chromium`) |
| API 타임아웃 | Vercel 등 서버리스 환경의 기본 타임아웃(10초)과 충돌 → Railway 사용 (maxDuration 60초) |

---

## 6. 우선순위 매트릭스 (MoSCoW)

| Must Have | Should Have | Could Have | Won't Have (v1) |
|---|---|---|---|
| URL → 색상 추출 (Puppeteer) | 로딩 단계 진행 표시 | 사용자 정의 팔레트 입력 | 색상 내보내기 (Figma/CSS 파일) |
| 색상 정규화 + 중복 제거 | 예시 URL 바로가기 | 색상 접근성 대비비율 표시 | 여러 URL 동시 비교 |
| 카테고리 분류 + 팔레트 UI | 색상환 반응형 | 분석 이력 저장 | 크롬 익스텐션 |
| 클립보드 복사 | 다크/라이트 테마 전환 | — | 팀 협업 기능 |
| Canvas 픽셀 테마 미리보기 | Before/After 슬라이더 | — | — |
| 10종 프리셋 팔레트 | — | — | — |

---

## 7. 성공 지표

| 지표 | 목표 |
|---|---|
| 분석 완료율 | 일반적인 공개 웹사이트에서 95% 이상 성공 |
| 응답 시간 | 30초 이내 결과 반환 (P95) |
| 팔레트 품질 | 추출된 색상이 실제 사이트의 지배적 색상과 육안으로 일치 |
| 테스트 신뢰성 | 단위 60개 + E2E 11개, CI 100% 통과 |
