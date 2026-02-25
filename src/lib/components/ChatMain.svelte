<script lang="ts">
	import { chatApi } from '$lib/api/client';
	import type { Room } from '$lib/types/chat';
	import MessageList from '$lib/components/MessageList.svelte';
	import MessageInput from '$lib/components/MessageInput.svelte';

	interface Props {
		roomId?: string;
	}

	let { roomId }: Props = $props();

	let room = $state<Room | null>(null);
	let loading = $state(false);

	$effect(() => {
		const id = roomId;
		if (!id) {
			room = null;
			return;
		}
		let cancelled = false;
		loading = true;
		chatApi.getRooms().then((rooms) => {
			if (cancelled) return;
			room = rooms.find((r) => r.id === id) ?? null;
			loading = false;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="main">
	{#if !roomId}
		<div class="empty-state">
			<p>대화방을 선택하세요</p>
			<span class="empty-hint">왼쪽 목록에서 대화 상대를 선택하면 대화를 이어갈 수 있습니다.</span>
		</div>
	{:else if loading && !room}
		<div class="empty-state">불러오는 중...</div>
	{:else if room}
		<header class="main-header">
			<span class="header-avatar">{room.partner.name.charAt(0)}</span>
			<h2 class="header-name">{room.partner.name}</h2>
		</header>
		<MessageList roomId={room.id} />
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
</style>
