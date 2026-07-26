# slip

> Rejection is a data point.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-4169E1?logo=postgresql)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**slip**은 취업과 투자 과정에서 사라지는 거절 경험을 익명의 회고 데이터로 바꾸는 커뮤니티입니다. 사용자는 회사·직무·면접 단계 또는 투자사·라운드별로 경험을 기록하고, 비슷한 사례와 이후 결과를 함께 확인할 수 있습니다.

![slip 커뮤니티 화면](public/readme/community.png)

성공 사례만 남기는 커리어 플랫폼과 달리, slip은 “어디서 떨어졌는가”보다 **어떤 과정이 있었고 그 뒤 무엇이 달라졌는가**를 축적합니다.

## 핵심 문제

거절 경험은 개인에게는 중요한 학습 데이터지만 대부분 비공개 메모나 일회성 커뮤니티 글로 흩어집니다.

- 같은 회사와 단계의 경험을 구조적으로 비교하기 어렵습니다.
- 익명성과 신뢰를 함께 지키기 어렵습니다.
- 거절 이후의 결과가 기록되지 않아 회고가 한 시점에서 멈춥니다.
- 유용한 글이 회사·직무·투자 단계의 맥락 없이 소비됩니다.

slip은 게시물을 커뮤니티와 단계별 데이터에 연결하고, 반응·댓글·후속 결과를 같은 기록 안에 남깁니다.

## 구현된 기능

| 영역 | 구현 내용 |
| --- | --- |
| 구조화된 회고 | 회사/투자사 커뮤니티, 직무·면접 단계, 펀딩 단계, 후속 결과 |
| 익명 커뮤니티 | 익명 게시, 댓글, 투표, 공감 반응, 신고 |
| 탐색 | 커뮤니티·태그·검색·팔로잉 피드 |
| 후속 기록 | 거절 이후 결과와 30일 리마인드 알림 |
| 신뢰와 운영 | 커뮤니티 규칙, 신고 상태, 관리자 요청 검토 |
| 콘텐츠 | Editor.js 기반 본문, 이미지 업로드, 외부 글 임베드 |
| 인증 | Supabase Auth 기반 세션과 사용자 프로필 |

## 제품 흐름

```text
경험 작성
  → 회사/투자사와 세부 단계 선택
  → 익명 또는 공개 게시
  → 댓글·투표·공감 반응
  → 후속 결과 기록
  → 같은 맥락의 회고 데이터로 축적
```

## 기술적 선택

### 계층형 커뮤니티

`companies/google/swe`처럼 상위 기관과 하위 직무를 한 구조로 표현합니다. 별도 제품 화면을 늘리지 않고 같은 피드와 URL 체계로 회사, 투자사, 세부 분야를 탐색할 수 있습니다.

### 결과까지 이어지는 데이터 모델

게시물에는 면접·투자 단계뿐 아니라 `outcomeCategory`, `outcomeStory`, `outcomeNudgeSentAt`이 포함됩니다. 거절 당시의 감상만 모으는 대신 이후의 변화까지 연결하기 위한 설계입니다.

### 서버리스 환경의 연결 관리

PostgreSQL 연결은 개발 중 hot reload에서 재사용하고, transaction pooler에 맞춰 prepared statement를 끄며 idle connection을 반환합니다. 서버리스 인스턴스가 연결을 계속 점유해 전체 페이지가 중단되던 문제를 DB 경계에서 해결했습니다.

### 홈 피드 비용 제어

홈 화면은 사용자별 인증 조회를 분리하고 캐시 가능한 서버 렌더링을 유지합니다. 데이터 수, 최신 글, 추천 커뮤니티를 병렬로 조회한 뒤 중복 콘텐츠를 제거합니다.

## 아키텍처

```text
Next.js App Router
├── Server Components ───── 피드·커뮤니티·게시물 조회
├── Route Handlers ──────── 게시·댓글·투표·반응·신고
├── Supabase SSR ────────── 인증과 세션
├── Drizzle ORM ─────────── 타입 안전 쿼리와 스키마
└── PostgreSQL ──────────── 사용자·커뮤니티·게시물·상호작용
```

## 데이터 모델

```text
users ─┬─ posts ─┬─ comments
       │         ├─ votes
       │         ├─ reactions
       │         ├─ reports
       │         └─ post_tags ─ tags
       ├─ community_members
       └─ notifications

communities ── self reference로 기관/직무 계층 구성
```

## 시작하기

### 요구 사항

- Node.js 20+
- PostgreSQL
- Supabase 프로젝트

### 설치

```bash
git clone https://github.com/suandhee12-commits/slip.git
cd slip
npm ci
cp .env.example .env.local
```

`.env.local`에 PostgreSQL과 Supabase 값을 입력합니다.

```bash
npx drizzle-kit migrate
npm run dev
```

개발 서버는 [http://localhost:3004](http://localhost:3004)에서 실행됩니다.

## 환경변수

| 변수 | 용도 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저/SSR용 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리자 작업용 서버 키 |
| `NEXT_PUBLIC_APP_URL` | canonical URL과 콜백 기준 URL |
| `FOUNDER_EMAIL` | 관리자 권한을 판별할 이메일 |
| `FOUNDER_PASSWORD` | 관리자 계정 생성 스크립트에만 사용하는 초기 비밀번호 |

## 주요 명령어

```bash
npm run dev      # localhost:3004
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
npm test         # 중복 게시물 회귀 테스트
```

## 현재 검증 상태

| 항목 | 상태 |
| --- | --- |
| TypeScript 컴파일 | 통과 |
| 프로덕션 번들 생성 | 통과 |
| 정적 페이지 데이터 수집 | PostgreSQL 마이그레이션 후 검증 |
| ESLint | 통과, 오류 0개 |
| 자동 회귀 테스트 | 통과, 중복 제목·URL의 첫 게시물 보존 검증 |
| GitHub Actions | PostgreSQL 16에서 migration, lint, test, build 실행 |

동일한 검증 과정은 [`.github/workflows/ci.yml`](.github/workflows/ci.yml)에서 자동 실행됩니다.

## 프로젝트 구조

```text
slip/
├── src/app/                 # 화면과 API route handlers
├── src/components/          # 피드, 에디터, 댓글, 커뮤니티 UI
├── src/lib/                 # Supabase, 타입, 중복 제거 로직
├── drizzle/
│   ├── schema.ts            # PostgreSQL 스키마
│   └── migrations/          # 버전 관리되는 마이그레이션
├── scripts/                 # 시드·운영·검증 도구
└── public/                  # 로고와 정적 자산
```

## 공개 전 체크

- 테스트용 데이터와 실제 사용자 데이터를 분리합니다.
- `SUPABASE_SERVICE_ROLE_KEY`와 DB 연결 문자열은 절대 커밋하지 않습니다.
- 실제 사용자 경험을 공개할 때는 개인·면접관·기밀 정보를 제거합니다.

## 라이선스

[MIT](LICENSE)

취약점은 공개 이슈 대신 [`SECURITY.md`](SECURITY.md)의 비공개 제보 절차를 이용해 주세요.
