/**
 * 채팅방 소켓 API (join / broadcast / subscribe)
 * 서버 이벤트: join, message
 */
import { getSocket } from './client';
import type { Message } from '$lib/types/chat';

/** 방 입장 (해당 방 메시지 수신 가능) */
export function joinRoom(roomId: string): void {
	const socket = getSocket();
	if (socket && roomId) socket.emit('join', roomId);
}

/** 방 나가기 (구독 해제는 subscribeToRoom 반환 함수 사용) */
export function leaveRoom(_roomId: string): void {
	// 서버에서 별도 leave 처리 안 해도 됨. 클라이언트는 off('message')로 구독만 해제
}

/** 메시지를 해당 방에 브로드캐스트 (전송 후 서버가 같은 방 구독자에게 전달) */
export function broadcastMessage(roomId: string, message: Message): void {
	const socket = getSocket();
	if (socket && roomId && message) {
		socket.emit('message', { roomId, message });
	}
}

/** 방 메시지 구독. 반환된 함수 호출 시 구독 해제 */
export function subscribeToRoom(
	roomId: string,
	onMessage: (message: Message) => void
): () => void {
	const socket = getSocket();
	if (!socket || !roomId) return () => {};

	joinRoom(roomId);
	socket.on('message', onMessage);

	return () => {
		socket.off('message', onMessage);
	};
}
