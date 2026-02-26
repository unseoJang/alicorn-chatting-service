<script lang="ts">
	import { sendMessage } from '$lib/chat';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	let text = $state('');
	let sending = $state(false);

	async function handleSend() {
		const trimmed = text.trim();
		if (!trimmed || sending) return;
		text = '';
		sending = true;
		try {
			await sendMessage(roomId, trimmed);
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
			handleSend();
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
	<button class="send-btn" onclick={handleSend} disabled={sending || !text.trim()} type="button">
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
