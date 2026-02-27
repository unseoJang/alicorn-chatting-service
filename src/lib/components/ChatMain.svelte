<script lang="ts">
	import { goto } from '$app/navigation';
	import { chatApi } from '$lib/api/client';
	import { subscribeToRoom } from '$lib/socket/index';
	import {
		dispatchNewMessage,
		fetchRoomById,
		markRoomAsRead,
		findOrCreateRoom,
		PARTNER_SEARCH_DEBOUNCE_MS
	} from '$lib/chat';
	import type { Message, Room, User } from '$lib/types/chat';
	import MessageList from '$lib/components/MessageList.svelte';
	import MessageInput from '$lib/components/MessageInput.svelte';

	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		roomId?: string;
		currentUserId?: string;
		/** 브라우저 Supabase 클라이언트 (Realtime 구독용). 없으면 실시간 수신 미동작 */
		supabase?: SupabaseClient | null;
	}

	let { roomId, currentUserId = '', supabase = null }: Props = $props();

	let room = $state<Room | null>(null);
	let loading = $state(false);

	let partnerSearchQuery = $state('');
	let searchResults = $state<User[]>([]);
	let searchLoading = $state(false);
	let creatingRoomId = $state<string | null>(null);

	$effect(() => {
		const id = roomId;
		if (!id) {
			room = null;
			return;
		}
		let cancelled = false;
		loading = true;
		markRoomAsRead(id)
			.then(() => fetchRoomById(id))
			.then((r) => {
				if (cancelled) return;
				room = r;
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		const id = roomId;
		if (!id) return;
		const unsubscribe = subscribeToRoom(id, (message: Message) => {
			dispatchNewMessage(message);
		});
		return unsubscribe;
	});

	$effect(() => {
		const q = partnerSearchQuery.trim();
		let timeoutId: ReturnType<typeof setTimeout>;
		if (!q) {
			searchResults = [];
			return () => {};
		}
		timeoutId = setTimeout(() => {
			searchLoading = true;
			chatApi.searchUsers(q).then((users) => {
				searchResults = users;
			}).finally(() => {
				searchLoading = false;
			});
		}, PARTNER_SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timeoutId);
	});

	async function handleStartConversation(user: User) {
		if (creatingRoomId) return;
		creatingRoomId = user.id;
		try {
			const targetRoom = await findOrCreateRoom(user);
			goto(`/chat/${targetRoom.id}`);
		} finally {
			creatingRoomId = null;
		}
	}
</script>

<div class="main">
	{#if !roomId}
		<div class="empty-state new-conversation">
			<p>대화방을 선택하세요</p>
			<span class="empty-hint">왼쪽 목록에서 대화 상대를 선택하거나, 아래에서 새 대화를 시작하세요.</span>
			<div class="partner-search-box">
				<label for="partner-search" class="sr-only">대화 상대 검색</label>
				<input
					id="partner-search"
					type="search"
					class="partner-search-input"
					placeholder="이름으로 대화 상대 검색"
					bind:value={partnerSearchQuery}
					aria-label="대화 상대 검색"
				/>
				{#if partnerSearchQuery.trim()}
					<div class="search-results-wrap">
						{#if searchLoading}
							<p class="search-loading">검색 중...</p>
						{:else}
							<ul class="search-results" role="list">
								{#if searchResults.length === 0}
									<li class="search-result-item empty">검색 결과가 없습니다.</li>
								{:else}
									{#each searchResults as user (user.id)}
										<li class="search-result-item">
											<button
												type="button"
												class="user-option"
												onclick={() => handleStartConversation(user)}
												disabled={creatingRoomId === user.id}
											>
												<span class="user-option-avatar">{user.name.charAt(0)}</span>
												<span class="user-option-name">{user.name}</span>
												{#if creatingRoomId === user.id}
													<span class="user-option-loading">생성 중...</span>
												{/if}
											</button>
										</li>
									{/each}
								{/if}
							</ul>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{:else if loading && !room}
		<div class="empty-state">불러오는 중...</div>
	{:else if room}
		<header class="main-header">
			<span class="header-avatar">{room.partner.name.charAt(0)}</span>
			<h2 class="header-name">{room.partner.name}</h2>
		</header>
		<MessageList roomId={room.id} currentUserId={currentUserId} supabase={supabase} />
		<MessageInput roomId={room.id} />
	{:else}
		<div class="empty-state">대화방을 찾을 수 없습니다.</div>
	{/if}
</div>

<style>
	.main {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--bg-main);
		min-width: 0;
	}
	.main-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		border-bottom: 1px solid var(--border);
		background: var(--bg-sidebar);
	}
	.header-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}
	.header-name {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: var(--text-muted);
		text-align: center;
		padding: 2rem;
	}
	.empty-state p {
		margin: 0;
		font-size: 1.125rem;
		color: var(--text);
	}
	.empty-hint {
		font-size: 0.875rem;
		max-width: 280px;
	}
	.new-conversation {
		gap: 1.25rem;
	}
	.partner-search-box {
		width: 100%;
		max-width: 320px;
		margin-top: 0.5rem;
	}
	.partner-search-input {
		width: 100%;
		padding: 0.625rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-input);
		color: var(--text);
		font-size: 0.9375rem;
		outline: none;
	}
	.partner-search-input:focus {
		border-color: var(--accent);
	}
	.search-results-wrap {
		margin-top: 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-sidebar);
		max-height: 240px;
		overflow-y: auto;
	}
	.search-loading {
		margin: 0;
		padding: 1rem;
		text-align: center;
		font-size: 0.875rem;
		color: var(--text-muted);
	}
	.search-results {
		list-style: none;
		margin: 0;
		padding: 0.25rem 0;
	}
	.search-result-item {
		padding: 0;
	}
	.search-result-item.empty {
		padding: 1rem;
		text-align: center;
		font-size: 0.875rem;
		color: var(--text-muted);
	}
	.user-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s;
	}
	.user-option:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
	}
	.user-option:disabled {
		opacity: 0.8;
		cursor: wait;
	}
	.user-option-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		flex-shrink: 0;
	}
	.user-option-name {
		flex: 1;
		font-weight: 500;
	}
	.user-option-loading {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
