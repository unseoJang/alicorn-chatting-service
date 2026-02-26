<script lang="ts">
	import { tick } from 'svelte';
	import { chatApi } from '$lib/api/client';
	import { subscribeToNewMessage, isMessageMine } from '$lib/chat';
	import { linkify, formatMessageTime } from '$lib/utils/format';
	import type { Message } from '$lib/types/chat';

	interface Props {
		roomId: string;
		currentUserId?: string;
	}

	let { roomId, currentUserId = '' }: Props = $props();

	let messages = $state<Message[]>([]);
	let loading = $state(true);
	let listEl: HTMLDivElement;

	async function loadMessages() {
		loading = true;
		try {
			messages = await chatApi.getMessages(roomId);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadMessages();
	});

	$effect(() => {
		const id = roomId;
		const unsubscribe = subscribeToNewMessage(id, () => loadMessages());
		return unsubscribe;
	});

	$effect(() => {
		const _ = messages.length;
		if (loading || !listEl) return;
		tick().then(() => {
			listEl.scrollTop = listEl.scrollHeight;
		});
	});
</script>

<div class="message-list" bind:this={listEl}>
	{#if loading}
		<div class="message-loading">메시지 불러오는 중...</div>
	{:else}
		{#each messages as msg (msg.id)}
			<div class="message-row" class:mine={isMessageMine(msg, currentUserId)}>
				<div class="chat-message" class:mine={isMessageMine(msg, currentUserId)}>
					{@html linkify(msg.content)}
				</div>
				<span class="message-time">{formatMessageTime(msg.createdAt)}</span>
			</div>
		{/each}
	{/if}
</div>

<style>
	.message-list {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.message-loading {
		text-align: center;
		color: var(--text-muted);
		padding: 2rem;
	}
	.message-row {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		max-width: 75%;
	}
	.message-row.mine {
		align-self: flex-end;
		align-items: flex-end;
	}
	.chat-message {
		padding: 0.625rem 1rem;
		border-radius: var(--radius);
		background: var(--bg-input);
		line-height: 1.5;
		word-break: break-word;
	}
	.chat-message.mine {
		background: var(--accent);
		color: white;
	}
	.message-time {
		font-size: 0.6875rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
	}
</style>
