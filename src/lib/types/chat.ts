/**
 * 채팅 도메인 타입
 * 백엔드 API 스펙에 맞춰 추후 수정 가능
 */

export interface User {
	id: string;
	name: string;
	avatarUrl?: string;
}

export interface Room {
	id: string;
	/** 대화 상대 (1:1이므로 한 명) */
	partner: User;
	/** 마지막 메시지 미리보기 */
	lastMessage?: string;
	/** 마지막 메시지 시각 (정렬용) */
	lastMessageAt?: string;
	/** 읽지 않은 메시지 수 (Optional 요구사항) */
	unreadCount?: number;
}

export interface Message {
	id: string;
	roomId: string;
	senderId: string;
	content: string;
	createdAt: string;
	/** 읽음 여부 (Optional) */
	read?: boolean;
}

export interface SendMessagePayload {
	roomId: string;
	content: string;
}
