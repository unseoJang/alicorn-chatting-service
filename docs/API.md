# 프로젝트에서 사용하는 API 정리

클라이언트가 호출하는 API와, 그에 대응하는 서버 라우트입니다.

---

## 1. 클라이언트에서 쓰는 API (`chatApi`)

**정의 위치:** `src/lib/api/client.ts`

| 메서드 | HTTP | 경로 | 용도 | 호출하는 곳 |
|--------|------|------|------|-------------|
| `getRooms()` | GET | `/api/rooms` | 대화방 목록 조회 | `ChatSidebar.svelte` |
| `getMessages(roomId)` | GET | `/api/rooms/{roomId}/messages` | 해당 방 메시지 목록 | `MessageList.svelte` |
| `markRoomAsRead(roomId)` | POST | `/api/rooms/{roomId}/read` | 채팅방 읽음 처리 | `ChatMain.svelte` |
| `sendMessage({ roomId, content })` | POST | `/api/messages` | 메시지 전송 | `MessageInput.svelte` |
| `searchUsers(query)` | GET | `/api/users/search?q={query}` | 대화 상대 검색 (Optional) | 현재 미사용 |
| `createRoom(partnerId)` | POST | `/api/rooms` | 새 대화방 생성 (Optional) | 현재 미사용 |

---

## 2. 서버 라우트 (실제 구현)

**기본 URL:** `http://localhost:5173` (개발) 또는 `PUBLIC_API_BASE` (환경 변수)

| HTTP | 경로 | 파일 | 응답/동작 |
|------|------|------|-----------|
| GET | `/api/rooms` | `src/routes/api/rooms/+server.ts` | `Room[]` (mock) |
| GET | `/api/rooms/[roomId]/messages` | `src/routes/api/rooms/[roomId]/messages/+server.ts` | `Message[]` (mock) |
| POST | `/api/rooms/[roomId]/read` | `src/routes/api/rooms/[roomId]/read/+server.ts` | 204 No Content (읽음 처리) |
| POST | `/api/messages` | `src/routes/api/messages/+server.ts` | Body: `{ roomId, content }` → `Message` (mock) |

**미구현 (클라이언트에만 정의):**

- `GET /api/users/search?q=...` → 라우트 없음 (호출 시 404)
- `POST /api/rooms` (body: `{ partnerId }`) → 라우트 없음 (호출 시 404)

---

## 3. 요청/응답 타입

- **Room, Message, User, SendMessagePayload** → `src/lib/types/chat.ts` 참고
