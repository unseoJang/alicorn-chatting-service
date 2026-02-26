<script lang="ts">
	import { page } from '$app/stores';
	import ChatMain from '$lib/components/ChatMain.svelte';

	let { data } = $props();
	const roomId = $derived($page.params.roomId);
	const currentUserId = $derived(data?.user?.id ?? '');
</script>

<ChatMain roomId={roomId} currentUserId={currentUserId} />
