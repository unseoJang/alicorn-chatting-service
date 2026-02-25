/**
 * 백엔드 미구현 시 사용하는 Mock 데이터 및 API
 * 실제 API 연동 시 client.ts의 fetch 경로만 사용하면 됨
 */

import type { Message, Room, User } from '$lib/types/chat';

export const mockCurrentUser: User = {
	id: 'me',
	name: '나'
};

const mockPartners: User[] = [
	{ id: 'u1', name: '김철수' },
	{ id: 'u2', name: '이영희' },
	{ id: 'u3', name: '박민수' },
	{ id: 'u4', name: '정지훈' }
];

const mockRooms: Room[] = [
	{
		id: 'r1',
		partner: mockPartners[0]!,
		lastMessage: '네, 그렇게 진행할게요.',
		lastMessageAt: '2026-02-25T10:30:00Z',
		unreadCount: 0
	},
	{
		id: 'r2',
		partner: mockPartners[1]!,
		lastMessage: '회의 시간 조정 가능할까요?',
		lastMessageAt: '2026-02-25T09:15:00Z',
		unreadCount: 2
	},
	{
		id: 'r3',
		partner: mockPartners[2]!,
		lastMessage: 'https://example.com 문서 확인해 주세요.',
		lastMessageAt: '2026-02-24T16:00:00Z',
		unreadCount: 0
	},
	{
		id: 'r4',
		partner: mockPartners[3]!,
		lastMessage: '3일 전에 보낸 메시지예요.',
		lastMessageAt: '2026-02-22T14:20:00Z',
		unreadCount: 0
	}
];

const mockMessagesByRoom: Record<string, Message[]> = {
	r1: [
		{ id: 'm1', roomId: 'r1', senderId: 'u1', content: '안녕하세요, 다음 주 미팅 일정 조율 부탁드립니다.', createdAt: '2026-02-25T09:00:00Z', read: true },
		{ id: 'm2', roomId: 'r1', senderId: 'me', content: '네, 화요일 오후 2시는 어떠실까요?', createdAt: '2026-02-25T09:05:00Z', read: true },
		{ id: 'm3', roomId: 'r1', senderId: 'u1', content: '네, 그렇게 진행할게요.', createdAt: '2026-02-25T10:30:00Z', read: true }
	],
	r2: [
		{ id: 'm4', roomId: 'r2', senderId: 'u2', content: '회의 시간 조정 가능할까요?', createdAt: '2026-02-25T09:15:00Z', read: false },
		{ id: 'm5', roomId: 'r2', senderId: 'me', content: '네, 언제가 좋으실까요?', createdAt: '2026-02-25T09:20:00Z', read: false }
	],
	r3: [
		{ id: 'm6', roomId: 'r3', senderId: 'u3', content: 'https://example.com 문서 확인해 주세요.', createdAt: '2026-02-24T16:00:00Z', read: true }
	],
	r4: [
		{ id: 'm7', roomId: 'r4', senderId: 'u4', content: '안녕하세요, 지난주 논의했던 건 어떻게 되었나요?', createdAt: '2026-02-22T10:00:00Z', read: true },
		{ id: 'm8', roomId: 'r4', senderId: 'me', content: '네, 내부 검토 중이에요. 금요일까지 연락드릴게요.', createdAt: '2026-02-22T10:15:00Z', read: true },
		{ id: 'm9', roomId: 'r4', senderId: 'u4', content: '3일 전에 보낸 메시지예요.', createdAt: '2026-02-22T14:20:00Z', read: true }
	]
};

function nextId(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const mockApi = {
	async getRooms(): Promise<Room[]> {
		return [...mockRooms].sort(
			(a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
		);
	},

	async getMessages(roomId: string): Promise<Message[]> {
		const room = mockRooms.find((r) => r.id === roomId);
		if (room) room.unreadCount = 0;
		const list = mockMessagesByRoom[roomId] ?? [];
		return [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
	},

	/** 채팅방 확인 시 읽음 처리 (리스트 숫자 제거) */
	markRoomAsRead(roomId: string): void {
		const room = mockRooms.find((r) => r.id === roomId);
		if (room) room.unreadCount = 0;
	},

	async sendMessage(roomId: string, content: string): Promise<Message> {
		const msg: Message = {
			id: nextId('m'),
			roomId,
			senderId: mockCurrentUser.id,
			content,
			createdAt: new Date().toISOString(),
			read: false
		};
		if (!mockMessagesByRoom[roomId]) mockMessagesByRoom[roomId] = [];
		mockMessagesByRoom[roomId].push(msg);
		const room = mockRooms.find((r) => r.id === roomId);
		if (room) {
			room.lastMessage = content;
			room.lastMessageAt = msg.createdAt;
		}
		return msg;
	},

	async searchUsers(_query: string): Promise<User[]> {
		return [...mockPartners];
	},

	async createRoom(partnerId: string): Promise<Room> {
		const partner = mockPartners.find((p) => p.id === partnerId) ?? { id: partnerId, name: '알 수 없음' };
		const room: Room = {
			id: nextId('r'),
			partner,
			lastMessageAt: new Date().toISOString(),
			unreadCount: 0
		};
		mockRooms.unshift(room);
		mockMessagesByRoom[room.id] = [];
		return room;
	}
};
