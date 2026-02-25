# Alicorn 1:1 채팅 서비스 (프론트엔드)

1:1 대화 웹 애플리케이션 (SvelteKit).

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

- **백엔드**: 현재 SvelteKit API 라우트(`/api/rooms`, `/api/rooms/[roomId]/messages`, `/api/messages`)에서 mock 데이터를 반환합니다. 실제 백엔드 연동 시 `src/lib/api/client.ts`의 `BASE_URL`(환경 변수 `PUBLIC_API_BASE`)만 설정하면 됩니다.
- **라우트**
  - `/` → `/chat` 리다이렉트
  - `/chat` — 대화방 목록 + 빈 메인 영역
  - `/chat/[roomId]` — 해당 대화방 채팅 화면
- **구현된 기능**
  - **로그인/로그아웃**: 이름 입력 로그인, 쿠키 기반 세션, 비로그인 시 `/login` 리다이렉트
  - 대화 상대별 대화방 목록 및 이동 (참고 이미지 스타일 레이아웃)
  - 사이드바: 사용자 영역(아바타·이름), 로그아웃, 새 메시지 버튼, 대화 목록
  - 메시지 전송·수신 표시
  - 서버(mock) 저장 및 목록/메시지 조회
  - 메시지 내 URL 클릭 가능 (Optional)
  - 읽지 않은 메시지 수 표시 (Optional)
- **Optional 미구현**: 반응형 최적화, 새 대화방 생성·상대 검색, 대화 검색, 프로덕션 배포 설정

## 환경 변수

- `PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL (필수, 로그인용)
- `PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key (필수)
- `PUBLIC_API_BASE`: 백엔드 API 기본 URL (미설정 시 같은 origin의 `/api` 사용)

`.env.example`을 참고해 `.env` 또는 `.env.local`을 만들고 위 값을 채우세요.

### Supabase URL 설정 (로그인 리다이렉트)

[Auth URL Configuration](https://supabase.com/dashboard/project/espllccornzwtdtoqnon/auth/url-configuration)에서 다음을 설정하세요.

- **Site URL**: 로컬 개발 시 `http://localhost:5173`, 배포 시 실제 도메인
- **Redirect URLs**: `http://localhost:5173/**`, 배포 도메인 (예: `https://your-app.com/**`)

Supabase 대시보드 **Authentication > Providers**에서 **Email**을 켜면 이메일/비밀번호 로그인·회원가입을 사용할 수 있습니다.
