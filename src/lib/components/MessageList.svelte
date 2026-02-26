<script lang="ts">
	import { tick } from 'svelte';
	import { chatApi } from '$lib/api/client';
	import type { Message } from '$lib/types/chat';

	interface Props {
		roomId: string;
		/** 로그인 사용자 id. 내 메시지 구분용 (비어 있으면 모두 상대 메시지로 표시) */
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
		const handler = (e: CustomEvent<Message>) => {
			if (e.detail.roomId === id) loadMessages();
		};
		window.addEventListener('chat:new-message', handler as EventListener);
		return () => window.removeEventListener('chat:new-message', handler as EventListener);
	});

	/** 메시지 로드/추가 시 맨 아래로 스크롤 */
	$effect(() => {
		const _ = messages.length;
		if (loading || !listEl) return;
		tick().then(() => {
			listEl.scrollTop = listEl.scrollHeight;
		});
	});

	/** URL을 링크로 감싸서 반환 (Optional: clickable URL) */
	function linkify(text: string): string {
		const urlPattern = /(https?:\/\/[^\s<]+)/g;
		return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
	}
</script>

<div class="message-list" bind:this={listEl}>
	{#if loading}
		<div class="message-loading">메시지 불러오는 중...</div>
	{:else}
		{#each messages as msg (msg.id)}
			<div class="message-row" class:mine={Boolean(currentUserId && (msg.senderId === currentUserId || msg.senderId === 'me'))}>
				<div class="chat-message" class:mine={Boolean(currentUserId && (msg.senderId === currentUserId || msg.senderId === 'me'))}>
					{@html linkify(msg.content)}
				</div>
				<span class="message-time">{new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
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
