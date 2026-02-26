/**
 * 메시지 전송 유스케이스: API 저장 + 로컬 이벤트 + Socket 브로드캐스트
 */
import { chatApi } from '$lib/api/client';
import { broadcastMessage } from '$lib/socket/index';
import { dispatchNewMessage } from './events';
import type { Message } from '$lib/types/chat';

export async function sendMessage(roomId: string, content: string): Promise<Message> {
	const message = await chatApi.sendMessage({ roomId, content });
	dispatchNewMessage(message);
	broadcastMessage(roomId, message);
	return message;
}
