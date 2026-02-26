# Alicorn 1:1 채팅 서비스

1:1 대화 웹 애플리케이션 (SvelteKit). Supabase 인증 + Mock/Supabase 채팅 API.

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
  - `$lib/utils/format` — 표시용 포맷(linkify, 시간)
  - 컴포넌트는 UI·상태만 담당, 비즈니스 로직은 위 모듈 사용

## 구현된 기능

- [x] **로그인/로그아웃**: Supabase 이메일·비밀번호, 쿠키 기반 세션
- [x] **대화 목록**: 사이드바에서 대화 상대별 방 목록, 클릭 시 해당 채팅방 진입
- [x] **대화 검색**: 사이드바 검색창으로 대화 상대 이름·마지막 메시지 기준 필터
- [x] **새 메시지**: 버튼 클릭 후 이름으로 대화 상대 검색 → 선택 시 새 대화방 생성 (이미 있으면 기존 방 열기)
- [x] **메시지 전송·표시**: 전송 시 맨 아래로 자동 스크롤, URL 링크화
- [x] **실시간 메시지 (Socket.io)**: 같은 방의 다른 탭/기기에서 보낸 메시지 즉시 표시
- [x] **읽지 않은 메시지 수** 표시, 채팅방 진입 시 읽음 처리로 숫자 제거
- [x] **채팅/이벤트 책임 분리**: `$lib/chat`(이벤트·메시지·방·대화)·`$lib/socket`·`$lib/utils` 모듈화, 컴포넌트는 UI 위주
- [x] Mock 기반 방/메시지/사용자 검색 API (`/api/rooms`, `/api/messages`, `/api/users/search` 등)

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

현재는 **Mock 데이터**로 동작합니다. Supabase 테이블로 전환하려면:

1. [docs/SUPABASE.md](docs/SUPABASE.md)의 SQL로 테이블·RLS 생성
2. API 라우트에서 `mockApi` 대신 `supabase-chat.server` 사용하도록 변경

개발 중 **방이 안 나올 때** 등은 같은 문서의 "방이 안 나올 때 (RLS)" 절과 `GET /api/debug/rooms-check` 응답을 참고하면 됩니다. (배포 시 디버그 라우트 제거 권장)

## 테스트 시 유의사항

- **로그인 필수**: `/chat` 등 채팅 화면은 비로그인 시 `/login`으로 리다이렉트됩니다. 테스트 전 Supabase에서 이메일 계정을 만들고 로그인하세요.
- **채팅 데이터는 Mock**: 방/메시지/검색은 메모리 Mock입니다. 서버를 재시작하면 추가했던 방·메시지가 초기 상태로 돌아갑니다.
- **실시간 메시지**: Socket.io를 사용합니다. 개발 시 `pnpm run dev:socket`으로 소켓 서버를 띄우고 `PUBLIC_SOCKET_URL=http://localhost:3001`을 설정하면 같은 방의 다른 탭/기기에서 보낸 메시지가 실시간으로 표시됩니다.
- **환경 변수**: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`가 없으면 앱 기동 시 에러가 날 수 있습니다. `.env`를 반드시 설정한 뒤 실행하세요.
- **디버그 API**: `GET /api/debug/rooms-check`는 로그인한 사용자 확인·RLS 안내용입니다. 배포 환경에서는 제거하거나 비활성화하는 것이 좋습니다.
