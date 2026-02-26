# 기능 요구사항 체크리스트

출제 의도 및 기능 요구사항 기준 진행 상황입니다.

---

## 필수 요구사항

| # | 항목 | 상태 | 비고 |
|---|------|:----:|------|
| 1 | 1:1 대화를 주고받는 웹 애플리케이션 | ✅ | SvelteKit 기반 채팅 UI |
| 2 | 화면은 이미지를 참고로 작성 | ✅ | 좌측 대화 목록, 우측 메인 채팅 레이아웃 |
| 3 | 대화 상대별 대화방 구분, 대화방 간 이동 | ✅ | 사이드바에서 방 선택 시 `/chat/[roomId]` 이동 |
| 4 | 메시지 전송 및 상호 확인 | ✅ | 전송 버튼/Enter, 메시지 목록 조회 |
| 5 | 대화는 서버에 저장되어 언제든 확인 | ✅ | API mock + SvelteKit API 라우트로 저장·조회 |
| 6 | SvelteKit으로 작성 | ✅ | SvelteKit 2 + TypeScript |
| 7 | Git Remote Repository로 전달 | ✅ | GitHub 등 원격 저장소 푸시 가능 |

---

## Optional 요구사항

| # | 항목 | 상태 | 비고 |
|---|------|:----:|------|
| O1 | Responsive 지원 | ⚠️ | viewport 설정 있음, 미디어 쿼리 기반 모바일 레이아웃 미적용 |
| O2 | 로그인, 로그아웃 | ✅ | 이름 기반 로그인, 쿠키 세션, `/logout` |
| O3 | 비 로그인 사용자 접속 시 로그인 유도 | ✅ | `/chat` 등 인증 필요 경로는 미로그인 시 `/login` 리다이렉트 |
| O4 | 새 메시지 버튼 → 새 대화방 생성 시 대화 상대 검색 | ⚠️ | 「새 메시지」 버튼만 있음, 상대 검색·방 생성 UI 미구현 |
| O5 | 대화에 URL이 있으면 Clickable하게 출력 | ✅ | `MessageList`에서 `linkify()`로 `<a>` 변환 |
| O6 | 읽지 않은 메시지가 있으면 화면상 표기를 다르게 | ✅ | `unreadCount` 배지, 방 목록 강조, 채팅방 진입 시 읽음 처리 API 호출 |
| O7 | 대화를 검색할 수 있음 | ✅ | 사이드바 「대화 검색하기」로 방 목록 필터 (이름·마지막 메시지) |
| O8 | Production 환경 구축, 임의 URL로 접속 | ⚠️ | `adapter-auto` 사용 (Vercel 등 호환), 배포 절차·URL 문서화 미작성 |

---

## 진행 요약

- **필수**: 7/7 완료  
- **Optional**: 완료 5개, 부분/미적용 3개 (Responsive, 새 대화방+상대 검색, Production 문서)

---

## 추후 보완 시 참고

- **O1 Responsive**: `@media (max-width: 768px)` 등으로 사이드바 토글, 메인 전폭 표시
- **O4 새 대화방**: 「새 메시지」 클릭 시 모달/페이지에서 `chatApi.searchUsers()` 호출 후 선택 시 `createRoom(partnerId)` 호출
- **O8 Production**: `adapter-node` 또는 `adapter-vercel` 명시, `README`에 배포 및 접속 URL 안내 추가
