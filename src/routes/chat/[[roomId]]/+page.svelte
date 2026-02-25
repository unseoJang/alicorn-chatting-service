<script lang="ts">
	import { page } from '$app/stores';
	import ChatMain from '$lib/components/ChatMain.svelte';

	const roomId = $derived($page.params.roomId);
</script>

<ChatMain roomId={roomId} />
