<script lang="ts">
	import { chatApi } from '$lib/api/client';
	import type { Message } from '$lib/types/chat';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	let text = $state('');
	let sending = $state(false);

	/** 새 메시지가 추가되면 리스트 갱신을 위해 부모/형제가 구독할 수 있도록 이벤트 발송 */
	function dispatchNewMessage(message: Message) {
		window.dispatchEvent(new CustomEvent('chat:new-message', { detail: message }));
	}

	async function send() {
		const trimmed = text.trim();
		if (!trimmed || sending) return;
		text = '';
		sending = true;
		try {
			const message = await chatApi.sendMessage({ roomId, content: trimmed });
			dispatchNewMessage(message);
		} catch (e) {
			text = trimmed;
			console.error(e);
		} finally {
			sending = false;
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<div class="input-wrap">
	<textarea
		class="input"
		placeholder="메시지를 입력하세요..."
		bind:value={text}
		onkeydown={onKeydown}
		disabled={sending}
		rows="1"
	></textarea>
	<button class="send-btn" onclick={send} disabled={sending || !text.trim()} type="button">
		전송
	</button>
</div>

<style>
	.input-wrap {
		display: flex;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--border);
		background: var(--bg-sidebar);
		align-items: flex-end;
	}
	.input {
		flex: 1;
		min-height: 44px;
		max-height: 120px;
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--bg-input);
		color: var(--text);
		font: inherit;
		resize: none;
	}
	.input::placeholder {
		color: var(--text-muted);
	}
	.input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.send-btn {
		padding: 0.75rem 1.25rem;
		border-radius: var(--radius);
		border: none;
		background: var(--accent);
		color: white;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}
	.send-btn:hover:not(:disabled) {
		background: var(--accent-hover);
	}
	.send-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
