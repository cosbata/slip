# slip UI/Design Review — LLM Chat UI 레퍼런스 기반 개선 제안

> 작성 기준: 로컬 워크스페이스 `/Users/bata/bata/slip`을 현재 “우리 앱”으로 가정하고 리뷰했습니다. 앱은 Next.js 16 / React 19 기반이며, 현재 홈 피드 중심의 익명 rejection retrospective 커뮤니티 제품입니다. 로컬 실행은 `next dev --port 3004`까지 성공했지만, 홈 렌더링은 DB 쿼리 실패로 브라우저에서 서버 에러가 발생했습니다. 따라서 실제 화면 캡처 기반 + 코드 구조 기반 리뷰를 병행했습니다.

## 0. 한 줄 결론

현재 slip은 “Reddit 다크모드 클론에 가까운 정보 피드”로는 방향이 명확하지만, LLM/AI 채팅 UI 관점에서 보면 **대화형 탐색, guided input, 요약/패턴 분석, 근거/출처, 후속 질문 UX가 거의 없다**는 점이 가장 큰 기회입니다.  
단순히 채팅창을 하나 붙이는 것보다, 제품의 핵심 가치인 “거절 경험을 데이터 포인트로 만든다”를 살려 **피드 + AI insight panel + assisted submission + post-level coach** 구조로 확장하는 것이 좋습니다.

---

## 1. 현재 앱 구조 요약

### 확인한 주요 파일

- `src/app/layout.tsx`
  - 전체 shell, sticky top nav, 좌측 사이드바, 검색, 인증 영역
- `src/app/page.tsx`
  - 홈 피드, total rejection count, TrustExplainer, HomeFeed, 우측 Communities/NewsWidget
- `src/components/HomeFeed.tsx`
  - SortDropdown + All/Companies/Investors 탭 + PostCard 목록
- `src/components/PostCard.tsx`
  - feed card, vote/comment/share/reaction, body preview, stage/outcome badge
- `src/components/SearchBar.tsx`
  - 커뮤니티 검색 combobox
- `src/components/LeftSidebar.tsx`
  - HomeUserCard + NewsWidget
- `src/app/submit/SubmitForm.tsx`
  - 글 작성 플로우로 추정되는 핵심 입력 화면
- `src/app/globals.css`
  - Tailwind/shadcn 토큰 + Reddit-like dark tokens + responsive shell CSS

### 현재 UX의 성격

현재 구현은 다음 세 앱의 혼합에 가깝습니다.

1. **Reddit / Hacker News형 피드**
   - 커뮤니티, 포스트, 투표, 댓글, 공유, 정렬
2. **Blind / 익명 커리어 커뮤니티**
   - 회사/투자자 커뮤니티, 익명 경험담, rejection outcome
3. **뉴스/링크 aggregation**
   - `NewsWidget`, `EmbedCard`, link domain, category badge

반대로 현재는 ChatGPT/Claude/Perplexity 같은 **대화형 AI 제품의 핵심 구조**는 없습니다.

- 대화 thread 없음
- assistant/system/user message 구조 없음
- prompt composer 없음
- AI 상태 표시 없음: thinking, streaming, citations, retry, regenerate
- 후속 질문 추천 없음
- 대화 결과를 저장/공유/포스트로 전환하는 flow 없음

---

## 2. 현재 디자인에서 잘하고 있는 점

### 2.1 제품 톤은 명확함

`layout.tsx`와 `globals.css`를 보면 전체적으로 `#0D0D0D`, `#1A1A1B`, `#272729`, `#D7DADC`, `#818384` 중심의 어두운 monochrome palette를 쓰고 있습니다. rejection이라는 민감한 주제에는 과하게 밝거나 gamified한 UI보다 현재처럼 restrained한 톤이 더 적합합니다.

### 2.2 정보 밀도가 제품 성격과 맞음

`PostCard.tsx`는 한 카드 안에 다음 정보를 잘 압축합니다.

- community slug
- timestamp
- anonymous/user
- title
- body preview
- stage/outcome badge
- vote/comment/share/reaction

이는 Reddit/HN류의 discovery 피드로는 유효합니다.

### 2.3 검색 combobox의 기본 접근성은 신경 썼음

`SearchBar.tsx`에 `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role="listbox"`, `role="option"`가 들어가 있습니다. LLM chat UI에서도 prompt suggestions, command palette, source picker를 만들 때 재사용하기 좋은 기반입니다.

### 2.4 모바일 대응을 일부 고려함

`globals.css`에 `@media (max-width: 900px)`에서 left sidebar를 숨기고 search를 100%로 내리는 처리가 있습니다. 다만 후술하듯 chat composer나 bottom nav가 들어오면 모바일 IA는 다시 설계해야 합니다.

---

## 3. 현재 디자인의 핵심 문제

## 3.1 “Reddit-exact”가 너무 강해서 slip 고유성이 약함

코드 주석에도 `Reddit-exact top nav`, `new Reddit` 같은 표현이 있습니다. 이 방향은 MVP 빠르게 만들기에는 좋지만, 제품이 “AI로 거절 경험을 데이터화한다”는 방향으로 가려면 Reddit보다 **Perplexity/Claude/ChatGPT의 지식 탐색 UI**를 더 많이 가져와야 합니다.

현재 문제:

- 로고/브랜드 presence가 약함: `slip` 텍스트만 있음
- 홈 첫 화면에서 “왜 이 앱을 써야 하는지”가 약함
- 포스트는 많아 보여도 어떤 insight를 얻을 수 있는지 모호함
- rejection count가 있지만 의미화가 약함

개선 방향:

- 상단에 “Ask slip about rejection patterns” 같은 AI-first hero/composer를 추가
- 피드 위에 insight cards: “Most common rejection stage this week”, “OpenAI interview rejections trending”, “Funding rejection reasons”
- slip을 단순 커뮤니티가 아니라 “anonymous rejection intelligence layer”로 포지셔닝

---

## 3.2 Header 높이와 sticky 기준이 불일치

`layout.tsx`:

```tsx
<header style={{ height: '100px', ... }}>
```

`LeftSidebar.tsx`:

```tsx
top: '48px',
height: 'calc(100vh - 48px)',
```

문제:

- header는 100px인데 left sidebar sticky 기준은 48px입니다.
- 스크롤 시 사이드바가 헤더와 시각적으로 충돌하거나 어색한 gap/overlap을 만들 수 있습니다.
- Reddit-like shell을 의도했더라도 현재 높이는 일반적인 desktop nav보다 큽니다. 검색 중심 AI 앱이라면 64px 전후가 적합하고, composer를 넣을 경우 header를 더 줄여야 합니다.

권장:

- CSS 변수화: `--header-height: 64px` 또는 `72px`
- `layout.tsx`, `LeftSidebar.tsx`, right sidebar sticky top을 동일 변수로 맞춤
- AI composer가 홈 상단에 들어간다면 header는 더 작고 조용해야 함

---

## 3.3 Inline style이 너무 많아 디자인 시스템 확장이 어렵다

대부분 컴포넌트가 inline style에 강하게 의존합니다.

예:

- `layout.tsx`: header, inner, auth width 등
- `page.tsx`: two-column layout, right sidebar, typography
- `PostCard.tsx`: article/card/header/title/body/action bar 거의 전부 inline
- `SearchBar.tsx`: input/dropdown 전부 inline

문제:

- LLM chat UI 컴포넌트를 추가하면 스타일 중복이 급격히 늘어납니다.
- hover/focus/active/reduced-motion/dark-light theme 관리가 어렵습니다.
- shadcn/ui, assistant-ui 같은 라이브러리를 붙일 때 token alignment가 어려워집니다.

권장:

1. `globals.css`에 최소한의 semantic component class를 도입
   - `.app-header`
   - `.app-sidebar`
   - `.feed-card`
   - `.chat-composer`
   - `.ai-panel`
   - `.source-chip`
2. 색상은 CSS variable로 통일
   - `--surface-0`, `--surface-1`, `--surface-2`
   - `--text-primary`, `--text-secondary`, `--text-muted`
   - `--border-subtle`, `--border-strong`
   - `--accent`, `--accent-muted`
3. shadcn Button/Input/Card primitive를 쓰되, 브랜드 토큰으로 override

---

## 3.4 피드 카드의 hierarchy가 약함

`PostCard.tsx`의 타이틀은 18px/400입니다.

```tsx
<h3 style={{ fontSize: '18px', fontWeight: 400, color: '#D7DADC' }}>
```

문제:

- 타이틀, 본문, 메타, 액션의 대비가 모두 muted dark palette 안에서 비슷하게 보일 가능성이 큽니다.
- stage/outcome badge도 muted라 정보 필터링에 약합니다.
- AI 앱 관점에서 feed item은 “질문/답변 후보”처럼 더 scan-friendly해야 합니다.

권장:

- 타이틀: 16~17px, weight 500 또는 600. 피드 밀도 유지하려면 17/500 추천.
- body preview: 13.5~14px, line-height 1.55, max 3~4 lines로 줄임.
- metadata: 12px 유지하되 community는 더 명확히.
- outcome/stage badge는 category별 색상 약하게 분리.
  - Interview: blue-gray
  - Resume screen: amber
  - Final round: violet
  - Funding: green
  - Ghosted: red-muted
- card hover는 단순 `#0f0f0f`보다 border/left accent를 활용.

---

## 3.5 “입력”이 너무 숨겨져 있음

AI/LLM UI의 핵심은 사용자가 즉시 질문하거나 작성할 수 있는 **composer**입니다. 현재 홈에는 검색은 있지만 “내 rejection story를 작성”하거나 “패턴을 물어보기”가 바로 보이지 않습니다.

현재 예상 flow:

- 로그인/submit 경로를 찾아 들어감
- 커뮤니티 선택
- 글 작성

문제:

- 민감한 경험담을 공유하는 제품에서는 작성 시작 장벽을 낮춰야 합니다.
- LLM을 붙이면 “나의 경험을 구조화해주는 assistant”가 가장 큰 차별점이 됩니다.

권장 홈 상단 구조:

```text
[Ask slip anything about rejections…                         ↑]
Suggested: “Why do candidates get rejected after onsite?”
           “What patterns show up at OpenAI?”
           “Help me anonymize my rejection story”
```

그리고 composer mode를 3개로 나눕니다.

1. Ask: 피드/DB 기반 질의응답
2. Share: rejection story 작성 보조
3. Analyze: 내 rejection email/interview notes 붙여넣고 insight 받기

---

## 4. LLM Chat UI 레퍼런스별 적용점

## 4.1 ChatGPT에서 가져올 것

### 가져올 패턴

- 중앙 composer 중심의 empty/start state
- 대화 thread list / history
- 입력창 하단 tool row: attach, model/mode, send
- response actions: copy, retry, thumbs up/down

### slip 적용

홈 상단에 ChatGPT형 prompt composer를 추가합니다.

```tsx
// src/components/ai/SlipComposer.tsx
<Composer>
  <textarea placeholder="Ask about rejection patterns, or paste your story…" />
  <div className="composer-toolbar">
    <button>Ask</button>
    <button>Help me write</button>
    <button>Anonymize</button>
    <button>Send</button>
  </div>
</Composer>
```

구현 위치:

- `src/app/page.tsx`의 `TrustExplainer compact` 위 또는 아래
- 첫 단계는 서버 API 없이 mock suggestions로도 가능
- 이후 `/api/ai/chat` route 추가

---

## 4.2 Claude에서 가져올 것

### 가져올 패턴

- 차분한 card-based conversation
- 긴 문서/글 초안 작성에 강한 editor feel
- artifact panel: 답변과 산출물을 분리
- file/document context 강조

### slip 적용

submit flow에 Claude식 “작성 보조 + 미리보기”를 붙이는 것이 가장 잘 맞습니다.

추천 구조:

```text
Left: AI interview
- What company was this for?
- Which stage?
- What happened?
- What did you learn?

Right: Draft artifact
- Anonymous title
- Structured summary
- Lessons learned
- Tags/stage/outcome
```

구현 위치:

- `src/app/submit/SubmitForm.tsx`를 완전히 대체하기보다, 상단에 `Assisted mode` 토글 추가
- 새 컴포넌트: `src/components/ai/AssistedSubmitPanel.tsx`
- 생성 결과를 기존 form state에 주입

---

## 4.3 Perplexity에서 가져올 것

### 가져올 패턴

- 답변 상단의 concise answer
- source/citation chips
- related follow-up questions
- search 결과와 answer를 결합한 layout

### slip 적용

이 제품에는 Perplexity 패턴이 특히 중요합니다. 이유는 rejection 이야기가 단순 감정 공유가 아니라 “패턴 탐색”이기 때문입니다.

예:

사용자 질문: “Anthropic final round rejection patterns?”

응답 UI:

```text
Answer
Final-round Anthropic rejections in slip tend to mention three themes: ...

Sources
[Post: Staff SWE onsite rejected after system design] [Post: ML role final loop] [Community: companies/anthropic]

Patterns
- Feedback gap
- Scope mismatch
- Bar raiser uncertainty

Follow-ups
- Show only ML roles
- Compare with OpenAI
- Help me prepare a follow-up email
```

구현 위치:

- `/search?q=` 결과 페이지를 “AI answer + source-backed results”로 재설계
- `SearchBar.tsx`에서 Enter 시 기존 search page로 가되, search page 상단에 AI answer card 추가
- 검색 결과 데이터는 `posts`, `communities`에서 가져오고, source chips는 `PostCard` mini version으로 표시

---

## 4.4 v0 / Bolt / Lovable에서 가져올 것

### 가져올 패턴

- chat + preview split pane
- 작업 로그 / step progress
- 결과물을 바로 수정/적용

### slip 적용

개발자 도구형 UI를 그대로 가져오면 안 되지만, “AI가 내 글을 어떻게 익명화했는지”를 보여주는 데 매우 좋습니다.

예: rejection story anonymizer

```text
Chat panel:
User: Here is my rejection email...
AI: I removed names, dates, exact team names, and recruiter identifiers.

Preview panel:
Original risk highlights
- exact date
- recruiter name
- team name

Safe post draft
- title
- body
- tags
```

이 방식은 신뢰를 만듭니다. 민감한 데이터를 다루는 제품에서 “AI가 무엇을 제거했는지”를 보여주는 것은 큰 UX 차별점입니다.

---

## 4.5 assistant-ui / Vercel AI Chatbot Template / shadcn 적용

### 빠른 구현 방향

현재 이미 Next.js, React, Tailwind v4, shadcn 관련 의존성이 있습니다. 다음 두 경로 중 하나를 추천합니다.

#### 옵션 A: assistant-ui 도입

장점:

- AI chat primitive가 잘 정리됨
- ChatGPT/Claude/Perplexity 스타일 구현 속도가 빠름
- message, composer, thread, action components를 가져오기 쉬움

적용:

```bash
npx assistant-ui init
```

이후 slip 브랜드에 맞게 CSS/token override.

#### 옵션 B: Vercel AI SDK + 직접 UI

장점:

- 현재 구조에 더 가볍게 붙일 수 있음
- streaming API 구현 명확
- shadcn primitive와 잘 맞음

추천 구조:

```text
src/app/api/ai/chat/route.ts
src/components/ai/SlipChat.tsx
src/components/ai/ChatMessage.tsx
src/components/ai/Composer.tsx
src/components/ai/SourceChips.tsx
src/components/ai/FollowUpQuestions.tsx
src/lib/ai/retrievePosts.ts
```

MVP는 옵션 B가 낫습니다. 이유는 slip은 범용 chatbot이 아니라 DB-backed insight UI가 핵심이기 때문입니다.

---

## 5. 화면별 개선 제안

## 5.1 홈 화면

현재:

```tsx
<p>{totalPostCount} rejections shared here</p>
<TrustExplainer compact />
<HomeFeed posts={allPosts} />
```

문제:

- “rejections shared here”는 숫자 이상의 의미가 약함
- TrustExplainer가 어떤 내용을 담는지 몰라도, AI-first action보다 먼저 오면 CTA가 약함
- 피드 필터는 있지만 질문/탐색 UX가 없음

추천 구조:

```text
[Header]

[Hero insight]
Rejection is a data point.
Ask what patterns show up across 12,482 anonymous stories.

[AI Composer]
Ask slip…
[Companies] [Investors] [Interview stages] [Anonymize my story]

[Insight cards]
- Trending companies
- Most discussed rejection stage
- New funding rejection stories

[Feed controls]
Best | New | Top | All | Companies | Investors

[Feed]
```

구현 파일:

- `src/app/page.tsx`
  - `SlipHeroComposer` 추가
  - `InsightStrip` 추가
- `src/components/HomeFeed.tsx`
  - 탭 styling 개선
- `src/components/PostCard.tsx`
  - card hierarchy 정리

---

## 5.2 검색 화면

현재 `SearchBar.tsx`는 커뮤니티 autocomplete 중심입니다.

개선:

- 검색어 입력 시 `Search for “query”`는 좋음
- 추가로 AI mode 제안을 넣습니다.

예:

```text
Search for “openai final round”
Ask AI about “openai final round”
Communities
- companies/openai
Posts
- ...
```

추천 검색 dropdown 구조:

1. AI answer CTA
2. Community results
3. Recent/trending searches
4. Post title matches

구현:

- `SearchBar.tsx` results model을 community-only에서 union type으로 변경
- API: `/api/search/suggest?q=` 추가
- 초기 MVP는 community-only 유지 + “Ask AI” CTA만 추가

---

## 5.3 포스트 상세 화면

포스트 상세 파일은 아직 세부 확인하지 않았지만, `PostComments.tsx`, `CreateComment.tsx`, `CommentsSection.tsx`가 있습니다.

AI chat reference 적용:

- 포스트 본문 아래에 “Ask about this rejection” mini composer
- 댓글 위에 “AI summary” 접이식 카드
- “Similar stories” source chips

예:

```text
AI summary
- Stage: Final onsite
- Signal: strong technical, uncertain culture fit
- Pattern: common among late-stage AI company loops

Ask about this story…
[What could they have done differently?]
[Compare similar OpenAI stories]
[Draft a follow-up email]
```

주의:

- AI가 사용자를 평가하거나 단정하는 표현은 피해야 합니다.
- “likely”, “may”, “based on shared stories” 같은 calibrated language를 사용.

---

## 5.4 Submit flow

가장 큰 UX 기회입니다.

현재 작성 화면은 `SubmitForm.tsx`가 매우 큰 파일입니다. 이 흐름에 AI를 붙일 때는 기존 form을 복잡하게 만드는 대신 wizard/panel을 분리하는 것이 좋습니다.

추천 IA:

```text
Step 1: Choose mode
- Write manually
- Let AI structure my story
- Anonymize pasted text

Step 2: Guided questions
- Company / investor
- Role / stage
- What happened?
- What feedback was given?
- What would you tell others?

Step 3: Safe draft
- AI-generated title
- Redacted body
- Tags
- Risk warnings

Step 4: Preview + post
```

LLM UI 포인트:

- Claude처럼 “대화하면서 문서가 만들어지는” 패턴
- v0처럼 오른쪽에 preview artifact
- ChatGPT처럼 regenerate/copy/edit actions

구현 파일 제안:

```text
src/components/submit/SubmitModeSelector.tsx
src/components/ai/AssistedSubmitChat.tsx
src/components/ai/AnonymizationPreview.tsx
src/lib/ai/anonymizeStory.ts
src/app/api/ai/anonymize/route.ts
```

---

## 6. 디자인 시스템 구체 제안

## 6.1 색상 토큰 재정의

현재 `--reddit-*` 네이밍은 제품 정체성을 약하게 만듭니다. slip 네이밍으로 바꾸는 것을 추천합니다.

```css
:root {
  --slip-bg: #0D0D0D;
  --slip-surface: #151516;
  --slip-surface-2: #1D1D1F;
  --slip-surface-3: #272729;
  --slip-border: #2B2C2E;
  --slip-border-strong: #3A3B3D;
  --slip-text: #ECEDEE;
  --slip-text-secondary: #B8BBBF;
  --slip-text-muted: #818384;
  --slip-accent: #EDEDED;
  --slip-danger: #EF4444;
  --slip-success: #22C55E;
  --slip-info: #60A5FA;
}
```

AI UI에 필요한 추가 토큰:

```css
--ai-user-bubble: #202123;
--ai-assistant-bubble: transparent;
--ai-source-chip: #1D1D1F;
--ai-composer-bg: #1A1A1B;
--ai-composer-border-focus: #5A5C60;
```

---

## 6.2 Spacing scale

현재 spacing은 inline으로 `8`, `10`, `12`, `16`, `20`, `24`, `32`가 혼재합니다. 4px grid는 유지하되 컴포넌트별 규칙을 정하면 좋습니다.

- Header horizontal padding: 20/24
- Feed card padding: 14px 16px
- Composer padding: 12px
- Sidebar padding: 16px
- Section gap: 24px
- Page top padding: 20px 또는 24px

---

## 6.3 Radius

현재 Reddit-like라 radius가 적거나 pill 위주입니다. AI UI는 composer와 panels에 더 부드러운 radius가 필요합니다.

- Feed card: 0 또는 8px 중 하나로 통일
- Composer: 20~24px
- Insight card: 14~16px
- Source chip: 999px or 10px
- Dropdown: 12px

---

## 6.4 Typography

IBM Plex Sans 선택은 좋습니다. 다만 제품이 지식/분석형으로 가려면 다음 hierarchy를 추천합니다.

- Page hero: 28~36px / 700 / -0.03em
- Section title: 15px / 600
- Feed title: 16~17px / 500
- Body preview: 14px / 400 / 1.55
- Meta: 12px / 400
- AI answer body: 15px / 1.65
- Source chip: 12px / 500

---

## 7. 구체 구현 로드맵

## Phase 1 — 디자인 정리, AI 없이도 가능한 개선

1. Header/sidebar height token 정리
   - `--header-height`
   - `layout.tsx`, `LeftSidebar.tsx`, right sidebar sticky top 동기화
2. `--reddit-*` token을 `--slip-*`으로 alias 추가
3. 홈 상단에 static `SlipHeroComposer` 추가
   - 실제 AI 연결 전에도 CTA 역할
4. `PostCard` hierarchy 개선
   - title weight
   - body clamp 3~4 lines
   - badge color semantic
5. 검색 dropdown에 “Ask AI” placeholder CTA 추가

## Phase 2 — AI Ask MVP

1. `/api/ai/chat/route.ts` 추가
2. `src/components/ai/SlipChatPanel.tsx` 추가
3. 홈 composer에서 질문 입력 → AI answer card 표시
4. source chips는 우선 검색된 post IDs 기반 mock/DB retrieval
5. follow-up questions 생성

## Phase 3 — Assisted Submit

1. `SubmitForm.tsx`에 assisted/manual toggle
2. `AssistedSubmitChat` 추가
3. `/api/ai/anonymize/route.ts`
4. anonymization preview: removed entities, risk level, generated title/body
5. 기존 submit form state에 반영

## Phase 4 — Post-level AI

1. 포스트 상세 상단/댓글 전 AI summary
2. “Ask about this story” mini composer
3. similar stories source chips
4. response feedback/copy/regenerate

---

## 8. 레퍼런스 검색/리서치 매핑

### Mobbin

Mobbin은 로그인 장벽이 있어서 직접 상세 화면까지 확인하기 어렵지만, 아래 키워드로 레퍼런스 수집이 좋습니다.

- ChatGPT: `https://mobbin.com/discover?q=ChatGPT`
- Claude: `https://mobbin.com/discover?q=Claude`
- Perplexity: `https://mobbin.com/discover?q=Perplexity`
- Chat / Chatbot: `https://mobbin.com/discover?q=Chatbot`
- Prompt: `https://mobbin.com/discover?q=Prompt`
- Sidebar: `https://mobbin.com/discover?q=Sidebar`
- Empty State: `https://mobbin.com/discover?q=Empty%20State`
- Upload / Attachment: `https://mobbin.com/discover?q=Attachment`

### Page Flows

추천 관찰 포인트:

- Chat onboarding
- first prompt submission
- search-to-answer flow
- file upload/chat flow

### SaaSFrame

추천 관찰 포인트:

- AI landing hero composer
- chat product onboarding
- dashboard + assistant side panel

### Figma Community / Dribbble

검색어:

- “AI chat dashboard”
- “AI assistant sidebar”
- “chat with data UI”
- “Perplexity clone UI”
- “Claude artifacts UI”
- “AI search results interface”

실제 적용 시에는 미적 레퍼런스보다 interaction pattern만 가져오는 게 좋습니다. slip은 민감한 커리어 경험 제품이라 너무 glossy한 Dribbble 스타일은 맞지 않습니다.

---

## 9. 가장 먼저 바꾸면 좋은 10가지

1. `layout.tsx` header height 100px → 64/72px로 축소
2. `LeftSidebar.tsx` sticky top을 header height와 동기화
3. 홈 상단에 AI composer형 CTA 추가
4. `SearchBar.tsx`에 “Ask AI about …” option 추가
5. `PostCard.tsx` title weight를 500으로 올리고 body clamp를 줄임
6. stage/outcome badge에 semantic color 부여
7. `--reddit-*` token을 `--slip-*` alias로 교체 시작
8. inline style 많은 컴포넌트부터 className/CSS module 또는 utility class로 이동
9. submit flow에 assisted/anonymize mode 추가
10. post detail에 AI summary + similar stories 추가

---

## 10. 주의할 점

### 10.1 AI 답변은 “조언”보다 “패턴” 중심이어야 함

거절 경험은 개인에게 민감합니다. AI가 “당신이 떨어진 이유는 X입니다”라고 단정하면 위험합니다. 대신:

- “공유된 사례 기준으로는…”
- “비슷한 사례에서 자주 보이는 패턴은…”
- “확실한 원인이라기보다 가능한 신호는…”

처럼 표현해야 합니다.

### 10.2 익명화 UX가 제품 신뢰의 핵심

AI 기능 중 가장 중요한 것은 chat 자체가 아니라 **anonymization transparency**입니다.

좋은 UI:

- 제거한 정보 표시
- 위험도 표시
- 사용자가 직접 복원/삭제 선택 가능
- 게시 전 “identifiability check”

### 10.3 Reddit clone에서 벗어나야 함

커뮤니티 피드는 유지하되, 브랜드/AI/insight layer가 없으면 차별화가 약합니다. slip은 Reddit이 아니라 “rejection intelligence network”가 되어야 합니다.

---

## 11. 제안하는 최종 IA

```text
Desktop
┌────────────────────────────────────────────────────────────┐
│ Header: slip | Search/Ask | Submit | Auth                  │
├──────────────┬──────────────────────────────┬──────────────┤
│ Left rail    │ Main                         │ Right rail    │
│ - Me         │ Hero AI Composer             │ Communities   │
│ - Saved      │ Insight cards                │ Trends        │
│ - Ask history│ Feed controls                │ Sources       │
│              │ Feed cards                   │               │
└──────────────┴──────────────────────────────┴──────────────┘
```

```text
Mobile
┌────────────────────────────┐
│ slip        Search/Auth    │
├────────────────────────────┤
│ AI Composer                │
│ Suggestions                │
│ Feed tabs                  │
│ Feed cards                 │
├────────────────────────────┤
│ Bottom nav: Home Ask Post  │
└────────────────────────────┘
```

---

## 12. 결론

현재 slip은 피드형 커뮤니티 제품으로서 기본 골격은 있습니다. 하지만 LLM/AI 채팅 UI 레퍼런스를 제대로 적용하려면, 단순 chatbot widget 추가가 아니라 다음 세 가지로 제품 경험을 바꾸는 것이 핵심입니다.

1. **Ask layer**: 사용자가 rejection 패턴을 질문하고 source-backed answer를 받는 구조
2. **Assist layer**: 사용자가 자신의 경험을 안전하게 구조화/익명화해 게시하는 구조
3. **Insight layer**: 피드가 단순 목록이 아니라 패턴, 트렌드, 후속 질문으로 이어지는 구조

가장 추천하는 첫 구현은 `Home AI Composer + Search Ask AI CTA + Assisted Submit skeleton`입니다. 이 세 가지를 넣으면 ChatGPT/Claude/Perplexity/v0 계열 레퍼런스의 장점을 slip의 실제 제품 가치와 가장 자연스럽게 연결할 수 있습니다.
