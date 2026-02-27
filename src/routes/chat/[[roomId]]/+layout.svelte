<script lang="ts">
	import { page } from '$app/stores';
	import ChatSidebar from '$lib/components/ChatSidebar.svelte';
	import { socketUnavailable } from '$lib/socket/index';
	import type { AuthUser } from '$lib/auth';

	let { data, children }: { data: { user: AuthUser }; children: any } = $props();

	const roomId = $derived($page.params.roomId);
	let bannerDismissed = $state(false);
	const showBanner = $derived($socketUnavailable && !bannerDismissed);
</script>

<div class="chat-layout">
	{#if showBanner}
		<div class="demo-banner" role="status">
			<span class="demo-banner-text">
				실시간 알림은 데모 환경에서 비활성화되어 있습니다. 메시지 전송·저장은 정상 동작합니다.
			</span>
			<button
				type="button"
				class="demo-banner-close"
				onclick={() => (bannerDismissed = true)}
				aria-label="알림 닫기"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6 6 18" /><path d="m6 6 12 12" />
				</svg>
			</button>
		</div>
	{/if}
	<div class="chat-body">
		<ChatSidebar currentRoomId={roomId} user={data.user} />
		{@render children()}
	</div>
</div>

<style>
	.chat-layout {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
		width: 100%;
	}
	.demo-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		background: rgba(124, 58, 237, 0.2);
		border-bottom: 1px solid var(--border);
		color: var(--text);
		font-size: 0.8125rem;
		flex-shrink: 0;
	}
	.demo-banner-text {
		flex: 1;
		text-align: center;
		max-width: 560px;
	}
	.demo-banner-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		border: none;
		background: none;
		color: var(--text-muted);
		cursor: pointer;
		border-radius: 4px;
		transition: color 0.15s, background 0.15s;
	}
	.demo-banner-close:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.08);
	}
	.chat-body {
		display: flex;
		flex: 1;
		min-height: 0;
		width: 100%;
	}
	.chat-body :global(.main) {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
</style>
