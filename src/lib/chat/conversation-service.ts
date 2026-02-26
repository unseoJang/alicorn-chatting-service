/**
 * 대화 시작: 기존 방 조회 또는 새 방 생성
 */
import { chatApi } from '$lib/api/client';
import type { Room, User } from '$lib/types/chat';

export async function findOrCreateRoom(partner: User): Promise<Room> {
	const rooms = await chatApi.getRooms();
	const existing = rooms.find((r) => r.partner.id === partner.id);
	if (existing) return existing;
	return chatApi.createRoom(partner.id);
}
