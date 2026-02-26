/**
 * 채팅 도메인 이벤트 (컴포넌트 간 메시지 신호)
 * 발행/구독만 담당. Socket·API와 분리.
 */
import type { Message } from '$lib/types/chat';

export const CHAT_NEW_MESSAGE = 'chat:new-message' as const;

export function dispatchNewMessage(message: Message): void {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent(CHAT_NEW_MESSAGE, { detail: message }));
}

export function subscribeToNewMessage(
	roomId: string,
	handler: (message: Message) => void
): () => void {
	const listener = (e: Event) => {
		const msg = (e as CustomEvent<Message>).detail;
		if (msg?.roomId === roomId) handler(msg);
	};
	window.addEventListener(CHAT_NEW_MESSAGE, listener);
	return () => window.removeEventListener(CHAT_NEW_MESSAGE, listener);
}
