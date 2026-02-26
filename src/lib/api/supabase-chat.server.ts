/**
 * 채팅 API - Supabase 백엔드
 * API 라우트에서만 사용. 목 데이터(mock)는 사용하지 않음.
 *
 * 지원 스키마:
 * - room_members(room_id, user_id) 또는 rooms(user_a, user_b) / rooms(user1, user2)
 * - profiles.name 또는 profiles.display_name
 * - messages.content 또는 messages.body
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Message, Room, User } from '$lib/types/chat';

type ProfileRow = {
	id: string;
	name?: string | null;
	display_name?: string | null;
	avatar_url?: string | null;
};

function toUser(row: ProfileRow): User {
	const name = row.name ?? row.display_name ?? '알 수 없음';
	return {
		id: row.id,
		name: typeof name === 'string' ? name : '알 수 없음',
		avatarUrl: row.avatar_url ?? undefined
	};
}

type MessageRow = {
	id: string;
	room_id: string;
	sender_id: string;
	content?: string | null;
	body?: string | null;
	created_at: string;
	read?: boolean | null;
};

function toMessage(row: MessageRow): Message {
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

/** room_members 기반으로 내 방 id 목록 + 파트너 id 반환. 없으면 rooms.user_a/user_b(또는 user1/user2) 폴백 */
async function getMyRoomPartnerPairs(
	supabase: SupabaseClient,
	userId: string
): Promise<{ roomId: string; partnerId: string }[]> {
	const { data: myMemberships, error: memErr } = await supabase
		.from('room_members')
		.select('room_id')
		.eq('user_id', userId);

	if (!memErr && myMemberships?.length) {
		const pairs: { roomId: string; partnerId: string }[] = [];
		for (const m of myMemberships) {
			const { data: members } = await supabase
				.from('room_members')
				.select('user_id')
				.eq('room_id', m.room_id)
				.neq('user_id', userId);
			if (members?.[0]) pairs.push({ roomId: m.room_id, partnerId: members[0].user_id });
		}
		return pairs;
	}

	// 폴백: rooms에 user_a/user_b 또는 user1/user2 있는 스키마
	const { data: roomsUA } = await supabase
		.from('rooms')
		.select('id, user_a, user_b')
		.or(`user_a.eq.${userId},user_b.eq.${userId}`);
	if (roomsUA?.length) {
		return roomsUA.map((r) => ({
			roomId: r.id,
			partnerId: (r as { user_a: string; user_b: string }).user_a === userId
				? (r as { user_b: string }).user_b
				: (r as { user_a: string }).user_a
		}));
	}
	const { data: roomsU1 } = await supabase
		.from('rooms')
		.select('id, user1, user2')
		.or(`user1.eq.${userId},user2.eq.${userId}`);
	if (roomsU1?.length) {
		return roomsU1.map((r) => ({
			roomId: r.id,
			partnerId: (r as { user1: string; user2: string }).user1 === userId
				? (r as { user2: string }).user2
				: (r as { user1: string }).user1
		}));
	}
	return [];
}

/** 대화방 목록 (본인 참여 방만, 상대·마지막 메시지·읽지 않음 개수 포함) */
export async function getRooms(supabase: SupabaseClient, userId: string): Promise<Room[]> {
	const pairs = await getMyRoomPartnerPairs(supabase, userId);
	const rooms: Room[] = [];

	for (const { roomId: rid, partnerId } of pairs) {
		const { data: profile } = await supabase
			.from('profiles')
			.select('id, name, display_name, avatar_url')
			.eq('id', partnerId)
			.single();
		const partner = profile ? toUser(profile as ProfileRow) : { id: partnerId, name: '알 수 없음' };

		const { data: lastMsg } = await supabase
			.from('messages')
			.select('content, body, created_at')
			.eq('room_id', rid)
			.order('created_at', { ascending: false })
			.limit(1)
			.single();
		const lastContent = lastMsg
			? (lastMsg as { content?: string; body?: string }).content ??
				(lastMsg as { body?: string }).body
			: undefined;

		let unreadCount = 0;
		const countRes = await supabase
			.from('messages')
			.select('*', { count: 'exact', head: true })
			.eq('room_id', rid)
			.eq('read', false)
			.neq('sender_id', userId);
		if (!countRes.error) unreadCount = countRes.count ?? 0;

		rooms.push({
			id: rid,
			partner,
			lastMessage: lastContent,
			lastMessageAt: lastMsg?.created_at,
			unreadCount
		});
	}

	rooms.sort((a, b) => {
		const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
		const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
		return tb - ta;
	});
	return rooms;
}

/** 방 메시지 목록 (content 또는 body 컬럼 지원) */
export async function getMessages(
	supabase: SupabaseClient,
	roomId: string,
	_userId: string
): Promise<Message[]> {
	const { data, error } = await supabase
		.from('messages')
		.select('id, room_id, sender_id, content, body, created_at, read')
		.eq('room_id', roomId)
		.order('created_at', { ascending: true });
	if (error) return [];
	return (data ?? []).map((row) => toMessage(row as MessageRow));
}

/** 방 읽음 처리 (상대가 보낸 메시지만 read=true). read 컬럼 없으면 no-op */
export async function markRoomAsRead(
	supabase: SupabaseClient,
	roomId: string,
	userId: string
): Promise<void> {
	const { error } = await supabase
		.from('messages')
		.update({ read: true })
		.eq('room_id', roomId)
		.neq('sender_id', userId);
	// read 컬럼이 없으면 무시 (다른 오류만 throw)
	if (error && !/column|read/i.test(String(error.message))) throw error;
}

/** 메시지 전송 (content 또는 body 컬럼 지원) */
export async function sendMessage(
	supabase: SupabaseClient,
	roomId: string,
	senderId: string,
	content: string
): Promise<Message> {
	let data: MessageRow | null = null;
	let err = await supabase
		.from('messages')
		.insert({
			room_id: roomId,
			sender_id: senderId,
			content,
			read: false
		})
		.select('id, room_id, sender_id, content, body, created_at, read')
		.single()
		.then((r) => {
			data = r.data as MessageRow | null;
			return r.error;
		});
	if (err) {
		// body 컬럼만 있는 스키마
		const res = await supabase
			.from('messages')
			.insert({ room_id: roomId, sender_id: senderId, body: content })
			.select('id, room_id, sender_id, content, body, created_at, read')
			.single();
		if (res.error) throw new Error(res.error.message);
		data = res.data as MessageRow;
	} else if (data) {
		// already set
	}
	if (!data) throw new Error('Failed to create message');
	return toMessage(data);
}

/** 사용자 검색 (본인 제외, name 또는 display_name 일치) */
export async function searchUsers(
	supabase: SupabaseClient,
	userId: string,
	query: string
): Promise<User[]> {
	const q = query.trim();
	if (!q) return [];
	const { data: byName, error: e1 } = await supabase
		.from('profiles')
		.select('id, name, display_name, avatar_url')
		.neq('id', userId)
		.ilike('name', `%${q}%`)
		.limit(20);
	if (!e1 && byName?.length) return byName.map((row) => toUser(row as ProfileRow));
	const { data: byDisplay, error: e2 } = await supabase
		.from('profiles')
		.select('id, name, display_name, avatar_url')
		.neq('id', userId)
		.ilike('display_name', `%${q}%`)
		.limit(20);
	if (e2 || !byDisplay?.length) return [];
	return byDisplay.map((row) => toUser(row as ProfileRow));
}

/** 새 대화방 생성 (이미 있으면 해당 방 반환). RPC 또는 rooms.user_a/user_b 폴백 */
export async function createRoom(
	supabase: SupabaseClient,
	userId: string,
	partnerId: string
): Promise<Room> {
	const { data: roomId, error: rpcErr } = await supabase.rpc('create_room_with_partner', {
		partner_id: partnerId
	});
	if (!rpcErr && roomId) {
		const { data: profile } = await supabase
			.from('profiles')
			.select('id, name, display_name, avatar_url')
			.eq('id', partnerId)
			.single();
		const partner = profile ? toUser(profile as ProfileRow) : { id: partnerId, name: '알 수 없음' };
		return { id: roomId as string, partner, unreadCount: 0 };
	}

	// 폴백: rooms에 user_a/user_b 있는 스키마 (기존 방 찾기)
	const existingPair = await supabase
		.from('rooms')
		.select('id')
		.or(`and(user_a.eq.${userId},user_b.eq.${partnerId}),and(user_a.eq.${partnerId},user_b.eq.${userId})`)
		.limit(1)
		.then((r) => r.data?.[0]);
	if (existingPair?.id) {
		const { data: profile } = await supabase
			.from('profiles')
			.select('id, name, display_name, avatar_url')
			.eq('id', partnerId)
			.single();
		const partner = profile ? toUser(profile as ProfileRow) : { id: partnerId, name: '알 수 없음' };
		return { id: existingPair.id, partner, unreadCount: 0 };
	}
	const { data: inserted, error: insertErr } = await supabase
		.from('rooms')
		.insert({ user_a: userId, user_b: partnerId } as Record<string, unknown>)
		.select('id')
		.single();
	if (insertErr) {
		// user1/user2 시도
		const { data: ins2, error: e2 } = await supabase
			.from('rooms')
			.insert({ user1: userId, user2: partnerId } as Record<string, unknown>)
			.select('id')
			.single();
		if (e2) throw new Error(insertErr.message || e2.message);
		const { data: profile } = await supabase
			.from('profiles')
			.select('id, name, display_name, avatar_url')
			.eq('id', partnerId)
			.single();
		const partner = profile ? toUser(profile as ProfileRow) : { id: partnerId, name: '알 수 없음' };
		return { id: (ins2 as { id: string }).id, partner, unreadCount: 0 };
	}
	const { data: profile } = await supabase
		.from('profiles')
		.select('id, name, display_name, avatar_url')
		.eq('id', partnerId)
		.single();
	const partner = profile ? toUser(profile as ProfileRow) : { id: partnerId, name: '알 수 없음' };
	return {
		id: (inserted as { id: string }).id,
		partner,
		unreadCount: 0
	};
}
