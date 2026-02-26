<script lang="ts">
	import { goto } from '$app/navigation';
	import { chatApi } from '$lib/api/client';
	import { filterRoomsByQuery } from '$lib/chat';
	import type { Room } from '$lib/types/chat';
	import type { AuthUser } from '$lib/auth';

	interface Props {
		currentRoomId?: string;
		user: AuthUser;
	}

	let { currentRoomId, user }: Props = $props();

	let rooms = $state<Room[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');

	const filteredRooms = $derived(filterRoomsByQuery(rooms, searchQuery));

	async function loadRooms() {
		loading = true;
		error = null;
		try {
			rooms = await chatApi.getRooms();
		} catch (e) {
			error = e instanceof Error ? e.message : '대화방 목록을 불러올 수 없습니다.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		currentRoomId;
		loadRooms();
	});

	function selectRoom(room: Room) {
		goto(`/chat/${room.id}`);
	}
</script>

<aside class="sidebar">
	<!-- 사용자 영역: 참고 이미지 스타일 상단 프로필 -->
	<header class="sidebar-header">
		<div class="user-area">
			<span class="user-avatar">{user.name.charAt(0)}</span>
			<span class="user-name">{user.name}</span>
		</div>
		<a href="/logout" class="logout-btn" title="로그아웃">로그아웃</a>
	</header>

	<div class="sidebar-toolbar">
		<h2 class="sidebar-title">대화</h2>
		<a href="/chat" class="new-msg-btn" title="새 메시지">새 메시지</a>
	</div>

	<div class="sidebar-search">
		<svg class="search-icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
		</svg>
		<input
			type="search"
			class="search-input"
			placeholder="대화 검색하기"
			aria-label="대화 검색"
			bind:value={searchQuery}
		/>
	</div>

	{#if loading}
		<div class="sidebar-loading">불러오는 중...</div>
	{:else if error}
		<div class="sidebar-error">{error}</div>
	{:else}
		<nav class="room-list">
			{#if filteredRooms.length === 0}
				<div class="search-empty">
					{searchQuery.trim() ? '검색 결과가 없습니다.' : '대화가 없습니다.'}
				</div>
			{:else}
			{#each filteredRooms as room (room.id)}
				<button
					class="room-item"
					class:active={room.id === currentRoomId}
					class:unread={(room.unreadCount ?? 0) > 0}
					onclick={() => selectRoom(room)}
					type="button"
				>
					<span class="room-avatar">{room.partner.name.charAt(0)}</span>
					<div class="room-info">
						<span class="room-name">{room.partner.name}</span>
						{#if room.lastMessage}
							<span class="room-preview">{room.lastMessage}</span>
						{/if}
					</div>
					{#if (room.unreadCount ?? 0) > 0}
						<span class="room-unread">{room.unreadCount}</span>
					{/if}
				</button>
			{/each}
			{/if}
		</nav>
	{/if}
</aside>

<style>
	.sidebar {
		width: var(--sidebar-width);
		min-width: 260px;
		background: var(--bg-sidebar);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		flex-shrink: 0;
	}
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--bg-sidebar);
	}
	.user-area {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}
	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
		flex-shrink: 0;
	}
	.user-name {
		font-weight: 500;
		font-size: 0.9375rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.logout-btn {
		font-size: 0.8125rem;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.375rem 0.5rem;
		border-radius: 6px;
		transition: color 0.15s, background 0.15s;
	}
	.logout-btn:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
		text-decoration: none;
	}
	.sidebar-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
	}
	.sidebar-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-muted);
	}
	.new-msg-btn {
		font-size: 0.8125rem;
		color: var(--accent);
		text-decoration: none;
		padding: 0.375rem 0.625rem;
		border-radius: 6px;
		transition: background 0.15s;
	}
	.new-msg-btn:hover {
		background: var(--unread-bg);
		text-decoration: none;
	}
	.sidebar-search {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--bg-sidebar);
	}
	.search-icon {
		flex-shrink: 0;
		color: var(--text-muted);
	}
	.search-input {
		flex: 1;
		min-width: 0;
		padding: 0.5rem 0;
		border: none;
		background: none;
		color: var(--text);
		font-size: 0.875rem;
		outline: none;
	}
	.search-input::placeholder {
		color: var(--text-muted);
	}
	.search-empty {
		padding: 1.5rem 1rem;
		text-align: center;
		color: var(--text-muted);
		font-size: 0.875rem;
	}
	.sidebar-loading,
	.sidebar-error {
		padding: 1.5rem;
		text-align: center;
		color: var(--text-muted);
	}
	.sidebar-error {
		color: #f87171;
	}
	.room-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}
	.room-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.875rem 1.25rem;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		border-bottom: 1px solid var(--border);
		transition: background 0.15s;
	}
	.room-item:hover {
		background: rgba(255, 255, 255, 0.04);
	}
	.room-item.active {
		background: var(--unread-bg);
	}
	.room-item.unread .room-name {
		font-weight: 600;
	}
	.room-avatar {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		flex-shrink: 0;
	}
	.room-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	.room-name {
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.room-preview {
		font-size: 0.8125rem;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.room-unread {
		background: var(--accent);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		min-width: 1.25rem;
		height: 1.25rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
</style>
