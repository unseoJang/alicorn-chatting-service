# Supabase 백엔드 연동 가이드

현재 프론트는 **그대로 두고**, SvelteKit API 라우트(`/api/*`) 안에서만 mock 대신 **Supabase**를 사용하면 됩니다.

---

## 1. 연동 가능 여부

- **가능합니다.**  
- `src/lib/api/client.ts`는 `/api/rooms`, `/api/messages` 등 **경로와 요청/응답 형식**만 맞추면 되고, 그 뒤가 mock이든 Supabase든 상관없습니다.
- Supabase로 바꿀 때는 **서버 쪽 API 라우트만 수정**하면 되고, 프론트 코드(`chatApi` 호출부)는 수정할 필요 없습니다.

---

## 2. Supabase에서 준비할 것

### 2.1 테이블 예시

| 테이블 | 컬럼 예시 | 비고 |
|--------|-----------|------|
| `users` | `id` (uuid, PK), `name`, `avatar_url?`, `created_at` | 로그인 사용자·대화 상대 |
| `rooms` | `id` (uuid, PK), `created_at` | 1:1 방 하나당 한 행 |
| `room_members` | `room_id`, `user_id`, `joined_at` | 한 방에 2명 (1:1). 또는 `rooms`에 `user_a`, `user_b`로 해도 됨 |
| `messages` | `id`, `room_id`, `sender_id`, `content`, `created_at`, `read?` | 메시지 내용·읽음 |

- “마지막 메시지 / 읽지 않은 개수”는  
  - Supabase에서 **뷰**나 **함수**로 만들거나,  
  - API 라우트에서 **메시지/읽음 테이블을 조인·집계**해서 `Room` 형태로 맞춰주면 됩니다.

### 2.2 RLS (Row Level Security)

- 채팅이므로 보통:
  - `rooms`: 본인이 참여한 방만
  - `messages`: 해당 방만
  - `room_members`: 해당 방만  
  읽기/쓰기 가능하도록 RLS 정책을 걸어두면 됩니다.

### 2.3 환경 변수

- Supabase 프로젝트의 **URL**과 **anon key** (또는 service role key)를 쓰면 됩니다.
- 예: `.env`에  
  `PUBLIC_SUPABASE_URL=...`,  
  `PUBLIC_SUPABASE_ANON_KEY=...`  
  또는 서버 전용이면 `SUPABASE_SERVICE_ROLE_KEY` 등으로 두고, **SvelteKit API 라우트에서만** 사용합니다.

---

## 3. 수정 위치 (프론트는 건드리지 않음)

- 다음 파일들 **안에서만** `mockApi` 대신 `createClient(@supabase/supabase-js)`로 DB 조회/추가하면 됩니다.
  - `src/routes/api/rooms/+server.ts` → `getRooms()` 대체
  - `src/routes/api/rooms/[roomId]/messages/+server.ts` → `getMessages(roomId)` 대체
  - `src/routes/api/rooms/[roomId]/read/+server.ts` → `markRoomAsRead` 대체
  - `src/routes/api/messages/+server.ts` → `sendMessage` 대체
- (Optional) `GET /api/users/search`, `POST /api/rooms` (새 대화방 생성) 라우트가 있다면, 그 안에서도 Supabase로 사용자 검색·방 생성하면 됩니다.

응답은 지금 **타입(`Room[]`, `Message` 등)과 같은 JSON 형태**로 맞춰주면, 현재 프론트는 그대로 사용 가능합니다.

---

## 4. 정리

- **백엔드만 Supabase로 바꾸면, 지금 프론트는 그대로 사용 가능합니다.**
- 해야 할 일:  
  - Supabase에 테이블(·뷰) 설계  
  - 위 API 라우트에서 mock 제거 후 Supabase 조회/삽입/갱신으로 교체  
  - 환경 변수로 URL/키 설정  

이렇게 하면 “백엔드 데이터를 Supabase로 넣으면 사용 가능한가?”에 대한 답은 **가능하다**입니다.

---

## 5. 실시간 메시지 수신 (Realtime)

상대가 메시지를 보낼 때 바로 화면에 뜨게 하려면 **Supabase Realtime**을 사용합니다.

### 5.1 Realtime 활성화

Supabase 대시보드에서 `messages` 테이블을 Realtime publication에 추가해야 합니다.

- **Database** → **Publications** → `supabase_realtime` → **Add table** → `messages` 선택  
또는 SQL Editor에서:

```sql
alter publication supabase_realtime add table messages;
```

### 5.2 동작 방식

- 프론트에서 `messages` 테이블의 `INSERT`를 구독합니다 (`room_id` 필터).
- 새 행이 들어오면 콜백으로 `Message`를 넘기고, `MessageList`에서 목록에 추가합니다.
- 로컬에서 보낸 메시지는 기존처럼 이벤트로 추가되며, Realtime으로도 동일 행이 오면 id 기준으로 중복 제거됩니다.
