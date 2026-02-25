/**
 * 채팅 API 클라이언트
 * 백엔드 미구현 시 mock 사용, 구축 후 BASE_URL만 변경하면 됨
 */

import type { Message, Room, SendMessagePayload, User } from '$lib/types/chat';

/** 백엔드가 다른 origin이면 환경 변수 PUBLIC_API_BASE 설정 */
const BASE_URL = typeof import.meta.env !== 'undefined' && import.meta.env?.PUBLIC_API_BASE
	? (import.meta.env.PUBLIC_API_BASE as string)
	: '';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE_URL}/api${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		}
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error((err as { message?: string }).message ?? `API Error ${res.status}`);
	}
	return res.json() as Promise<T>;
}

export const chatApi = {
	/** 대화방 목록 */
	async getRooms(): Promise<Room[]> {
		return fetchApi<Room[]>('/rooms');
	},

	/** 특정 대화방 메시지 목록 */
	async getMessages(roomId: string): Promise<Message[]> {
		return fetchApi<Message[]>(`/rooms/${roomId}/messages`);
	},

	/** 채팅방 확인 시 읽음 처리 (리스트 숫자 제거) */
	async markRoomAsRead(roomId: string): Promise<void> {
		await fetch(`${BASE_URL}/api/rooms/${roomId}/read`, { method: 'POST' });
	},

	/** 메시지 전송 */
	async sendMessage(payload: SendMessagePayload): Promise<Message> {
		return fetchApi<Message>('/messages', {
			method: 'POST',
			body: JSON.stringify(payload)
		});
	},

	/** (Optional) 대화 상대 검색 */
	async searchUsers(query: string): Promise<User[]> {
		return fetchApi<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
	},

	/** (Optional) 새 대화방 생성 */
	async createRoom(partnerId: string): Promise<Room> {
		return fetchApi<Room>('/rooms', {
			method: 'POST',
			body: JSON.stringify({ partnerId })
		});
	}
};
