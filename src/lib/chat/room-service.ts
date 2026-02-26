/**
 * 방 조회·읽음 처리
 */
import { chatApi } from '$lib/api/client';
import type { Room } from '$lib/types/chat';

export async function fetchRoomById(roomId: string): Promise<Room | null> {
	const rooms = await chatApi.getRooms();
	return rooms.find((r) => r.id === roomId) ?? null;
}

export async function markRoomAsRead(roomId: string): Promise<void> {
	await chatApi.markRoomAsRead(roomId);
}
