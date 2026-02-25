<script lang="ts">
	import { page } from '$app/stores';
	import ChatSidebar from '$lib/components/ChatSidebar.svelte';
	import type { AuthUser } from '$lib/auth';

	let { data, children }: { data: { user: AuthUser }; children: any } = $props();

	const roomId = $derived($page.params.roomId);
</script>

<div class="chat-layout">
	<ChatSidebar currentRoomId={roomId} user={data.user} />
	{@render children()}
</div>

<style>
	.chat-layout {
		display: flex;
		height: 100vh;
		overflow: hidden;
		width: 100%;
	}
	.chat-layout :global(.main) {
		flex: 1;
		min-width: 0;
	}
</style>
