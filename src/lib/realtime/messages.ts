/**
 * Supabase Realtime: messages 테이블 INSERT 구독
 * 상대방이 메시지를 보내면 실시간으로 콜백 호출.
 *
 * Supabase 대시보드에서 messages 테이블을 Realtime publication에 추가해야 합니다:
 * Database → Publications → supabase_realtime → Add table "messages"
 * 또는 SQL: alter publication supabase_realtime add table messages;
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Message } from '$lib/types/chat';

type MessageRow = {
	id: string;
	room_id: string;
	sender_id: string;
	content?: string | null;
	body?: string | null;
	created_at: string;
	read?: boolean | null;
};

function rowToMessage(row: MessageRow): Message {
	const content = row.content ?? row.body ?? '';
	return {
		id: row.id,
		roomId: row.room_id,
		senderId: row.sender_id,
		content,
		createdAt: row.created_at,
		read: row.read ?? false
	};
}

/**
 * 해당 방의 messages INSERT를 구독. 반환된 함수 호출 시 구독 해제.
 */
export function subscribeToRoomMessages(
	supabase: SupabaseClient,
	roomId: string,
	onMessage: (message: Message) => void
): () => void {
	if (!roomId || !supabase?.channel) return () => {};

	const channelName = `messages:room:${roomId}`;
	let channel: RealtimeChannel | null = null;

	channel = supabase
		.channel(channelName)
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'messages',
				filter: `room_id=eq.${roomId}`
			},
			(payload) => {
				const row = payload.new as MessageRow;
				if (row?.id != null) onMessage(rowToMessage(row));
			}
		)
		.subscribe();

	return () => {
		if (channel) {
			supabase.removeChannel(channel);
			channel = null;
		}
	};
}
