# Alicorn 1:1 채팅 서비스

1:1 대화 웹 애플리케이션 (SvelteKit). Supabase 인증 + Mock/Supabase 채팅 API.

## 📚 문서

- **[API 명세](docs/API.md)** — 클라이언트 API·서버 라우트·요청/응답 타입
- **[Supabase 연동 가이드](docs/SUPABASE.md)** — 테이블·RLS·API 전환 방법, 실시간 메시지(Realtime) 설정

---

## 요구사항

- Node.js 18+
- pnpm (권장)

## 설치 및 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 http://localhost:5173 접속 시 `/chat`으로 리다이렉트됩니다.

### 실시간 채팅 (Socket.io)

메시지를 **실시간**으로 받으려면 Socket.io 서버를 함께 띄우세요.

**개발 시 (두 터미널):**

```bash
# 터미널 1: SvelteKit
pnpm dev

# 터미널 2: Socket.io (포트 3001)
pnpm run dev:socket
```

`.env`에 `PUBLIC_SOCKET_URL=http://localhost:3001` 을 넣으면 앱이 해당 주소로 소켓을 연결합니다.

**프로덕션 (한 서버):**

```bash
pnpm build
pnpm start    # SvelteKit + Socket.io 한 포트 (기본 3000)
```

## 빌드

```bash
pnpm build
pnpm preview   # Vite 프리뷰 (Socket 없음)
pnpm start     # 빌드 결과물 + Socket.io로 실행
```

## 구조

- **인증**: Supabase Auth (이메일/비밀번호 로그인·회원가입). 비로그인 시 `/login` 리다이렉트.
- **채팅 API**: SvelteKit API 라우트(`/api/*`)에서 **Mock 데이터**를 사용합니다. Supabase DB로 전환하려면 [docs/SUPABASE.md](docs/SUPABASE.md)를 참고하세요.
- **라우트**
  - `/` → `/chat` 리다이렉트
  - `/login` — 로그인·회원가입
  - `/chat` — 대화방 선택 없음 시 빈 메인 + **새 대화 상대 검색**
  - `/chat/[roomId]` — 해당 대화방 채팅 화면
- **코드 구조 (책임 분리)**
  - `$lib/chat` — 채팅 도메인: 이벤트(발행/구독), 메시지 전송 유스케이스, 방 조회·읽음, 대화 시작(찾기/생성), 목록 필터, 상수
  - `$lib/socket` — Socket.io 연결·채팅방 join/broadcast/subscribe
  - `$lib/realtime` — Supabase Realtime 메시지 구독 (상대방 메시지 실시간 수신)
  - `$lib/utils/format` — 표시용 포맷(linkify, 시간)
  - 컴포넌트는 UI·상태만 담당, 비즈니스 로직은 위 모듈 사용

## 구현된 기능

- [x] **로그인/로그아웃**: Supabase 이메일·비밀번호, 쿠키 기반 세션
- [x] **대화 목록**: 사이드바에서 대화 상대별 방 목록, 클릭 시 해당 채팅방 진입
- [x] **대화 검색**: 사이드바 검색창으로 대화 상대 이름·마지막 메시지 기준 필터
- [x] **새 메시지**: 버튼 클릭 후 이름으로 대화 상대 검색 → 선택 시 새 대화방 생성 (이미 있으면 기존 방 열기)
- [x] **메시지 전송·표시**: 전송 시 맨 아래로 자동 스크롤, URL 링크화
- [x] **실시간 메시지**: Socket.io 또는 Supabase Realtime으로 상대방 메시지 즉시 표시 ([docs/SUPABASE.md §5](docs/SUPABASE.md) 참고)
- [x] **읽지 않은 메시지 수** 표시, 채팅방 진입 시 읽음 처리로 숫자 제거
- [x] **채팅/이벤트 책임 분리**: `$lib/chat`(이벤트·메시지·방·대화)·`$lib/socket`·`$lib/utils` 모듈화, 컴포넌트는 UI 위주
- [x] Mock 기반 방/메시지/사용자 검색 API ([docs/API.md](docs/API.md) 참고)
- [x] **데모 환경 안내**: Socket 서버 미연결 시 상단 배너로 「실시간 알림 비활성」 안내, 메시지 전송·저장은 정상 동작

## 환경 변수

`.env` 또는 `.env.local`에 다음을 설정하세요.

| 변수 | 설명 |
|------|------|
| `PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (필수, 로그인용) |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (필수) |
| `PUBLIC_SOCKET_URL` | Socket.io 서버 URL. 개발 시 `http://localhost:3001`, 미설정 시 현재 origin 사용 |
| `PUBLIC_API_BASE` | 백엔드 API 기본 URL (미설정 시 같은 origin의 `/api` 사용) |

### Supabase URL 설정 (로그인 리다이렉트)

Supabase 대시보드 **Authentication → URL Configuration**에서:

- **Site URL**: 로컬 개발 시 `http://localhost:5173`, 배포 시 실제 도메인
- **Redirect URLs**: `http://localhost:5173/**`, 배포 도메인 (예: `https://your-app.com/**`)

**Authentication → Providers**에서 **Email**을 켜면 이메일/비밀번호 로그인·회원가입을 사용할 수 있습니다.

## 채팅 백엔드 (Supabase 연동)

현재는 **Mock 데이터**로 동작합니다. Supabase 테이블로 전환하려면 [docs/SUPABASE.md](docs/SUPABASE.md)를 참고하세요.

1. 문서의 SQL로 테이블·RLS 생성
2. API 라우트에서 `mockApi` 대신 `supabase-chat.server` 사용하도록 변경

개발 중 **방이 안 나올 때** 등은 같은 문서의 "방이 안 나올 때 (RLS)" 절과 `GET /api/debug/rooms-check` 응답을 참고하면 됩니다. (배포 시 디버그 라우트 제거 권장)

## 테스트 시 유의사항

- **로그인 필수**: `/chat` 등 채팅 화면은 비로그인 시 `/login`으로 리다이렉트됩니다. 테스트 전 Supabase에서 이메일 계정을 만들고 로그인하세요.
- **채팅 데이터는 Mock**: 방/메시지/검색은 메모리 Mock입니다. 서버를 재시작하면 추가했던 방·메시지가 초기 상태로 돌아갑니다.
- **실시간 메시지**: Socket.io 또는 Supabase Realtime을 사용합니다. Realtime 설정은 [docs/SUPABASE.md §5](docs/SUPABASE.md) 참고.
- **환경 변수**: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`가 없으면 앱 기동 시 에러가 날 수 있습니다. `.env`를 반드시 설정한 뒤 실행하세요.
- **디버그 API**: `GET /api/debug/rooms-check`는 로그인한 사용자 확인·RLS 안내용입니다. 배포 환경에서는 제거하거나 비활성화하는 것이 좋습니다.

---

## 요구사항 체크리스트

출제 의도 및 기능 요구사항 기준 진행 상황입니다.

### 필수 요구사항

| # | 항목 | 상태 | 비고 |
|---|------|:----:|------|
| 1 | 1:1 대화를 주고받는 웹 애플리케이션 | ✅ | SvelteKit 기반 채팅 UI |
| 2 | 화면은 이미지를 참고로 작성 | ✅ | 좌측 대화 목록, 우측 메인 채팅 레이아웃 |
| 3 | 대화 상대별 대화방 구분, 대화방 간 이동 | ✅ | 사이드바에서 방 선택 시 `/chat/[roomId]` 이동 |
| 4 | 메시지 전송 및 상호 확인 | ✅ | 전송 버튼/Enter, 메시지 목록 조회 |
| 5 | 대화는 서버에 저장되어 언제든 확인 | ✅ | API mock + SvelteKit API 라우트로 저장·조회 |
| 6 | SvelteKit으로 작성 | ✅ | SvelteKit 2 + TypeScript |
| 7 | Git Remote Repository로 전달 | ✅ | GitHub 등 원격 저장소 푸시 가능 |

### Optional 요구사항

| # | 항목 | 상태 | 비고 |
|---|------|:----:|------|
| O1 | Responsive 지원 | ⚠️ | viewport 설정 있음, 미디어 쿼리 기반 모바일 레이아웃 미적용 |
| O2 | 로그인, 로그아웃 | ✅ | 이름 기반 로그인, 쿠키 세션, `/logout` |
| O3 | 비 로그인 사용자 접속 시 로그인 유도 | ✅ | `/chat` 등 인증 필요 경로는 미로그인 시 `/login` 리다이렉트 |
| O4 | 새 메시지 버튼 → 새 대화방 생성 시 대화 상대 검색 | ✅ | 「새 메시지」 클릭 시 모달에서 상대 검색·선택 시 방 생성/기존 방 열기 |
| O5 | 대화에 URL이 있으면 Clickable하게 출력 | ✅ | `MessageList`에서 `linkify()`로 `<a>` 변환 |
| O6 | 읽지 않은 메시지가 있으면 화면상 표기를 다르게 | ✅ | `unreadCount` 배지, 방 목록 강조, 채팅방 진입 시 읽음 처리 API 호출 |
| O7 | 대화를 검색할 수 있음 | ✅ | 사이드바 「대화 검색하기」로 방 목록 필터 (이름·마지막 메시지) |
| O8 | Production 환경 구축, 임의 URL로 접속 | ⚠️ | `adapter-auto` 사용 (Vercel 등 호환), 배포 절차·URL 문서화 미작성 |

### 진행 요약

- **필수**: 7/7 완료
- **Optional**: 완료 6개, 부분/미적용 2개 (Responsive, Production 문서)

### 추후 보완 시 참고

- **O1 Responsive**: `@media (max-width: 768px)` 등으로 사이드바 토글, 메인 전폭 표시
- **O8 Production**: `adapter-node` 또는 `adapter-vercel` 명시, README에 배포 및 접속 URL 안내 추가
