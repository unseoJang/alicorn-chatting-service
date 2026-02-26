/**
 * 대화방 목록 필터 (검색)
 */
import type { Room } from '$lib/types/chat';

export function filterRoomsByQuery(rooms: Room[], query: string): Room[] {
	const q = query.trim().toLowerCase();
	if (!q) return rooms;
	return rooms.filter(
		(room) =>
			room.partner.name.toLowerCase().includes(q) ||
			(room.lastMessage?.toLowerCase().includes(q) ?? false)
	);
}
