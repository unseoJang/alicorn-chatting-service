/**
 * 메시지 표시용 헬퍼
 */
import type { Message } from '$lib/types/chat';

export function isMessageMine(message: Message, currentUserId: string): boolean {
	if (!currentUserId) return false;
	return message.senderId === currentUserId || message.senderId === 'me';
}
