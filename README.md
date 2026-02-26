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

## 빌드

```bash
pnpm build
pnpm preview   # 프로덕션 미리보기
```

## 구조

- **인증**: Supabase Auth (이메일/비밀번호 로그인·회원가입). 비로그인 시 `/login` 리다이렉트.
- **채팅 API**: SvelteKit API 라우트(`/api/*`)에서 **Mock 데이터**를 사용합니다. Supabase DB로 전환하려면 [docs/SUPABASE.md](docs/SUPABASE.md)를 참고하세요.
- **라우트**
  - `/` → `/chat` 리다이렉트
  - `/login` — 로그인·회원가입
  - `/chat` — 대화방 선택 없음 시 빈 메인 + **새 대화 상대 검색**
  - `/chat/[roomId]` — 해당 대화방 채팅 화면

## 구현된 기능

- **로그인/로그아웃**: Supabase 이메일·비밀번호, 쿠키 기반 세션
- **대화 목록**: 사이드바에서 대화 상대별 방 목록, 클릭 시 해당 채팅방 진입
- **대화 검색**: 사이드바 검색창으로 대화 상대 이름·마지막 메시지 기준 필터
- **새 메시지**: 버튼 클릭 후 이름으로 대화 상대 검색 → 선택 시 새 대화방 생성 (이미 있으면 기존 방 열기)
- **메시지 전송·표시**: 전송 시 맨 아래로 자동 스크롤, URL 링크화
- **읽지 않은 메시지 수** 표시 (Optional)
- Mock 기반 방/메시지/사용자 검색 API (`/api/rooms`, `/api/messages`, `/api/users/search` 등)

## 환경 변수

`.env` 또는 `.env.local`에 다음을 설정하세요.

| 변수 | 설명 |
|------|------|
| `PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (필수, 로그인용) |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (필수) |
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
