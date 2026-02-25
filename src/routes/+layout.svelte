<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate, goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { count } from '$lib/stores/ui';

	let { data, children } = $props();
	const { supabase, session } = $derived(data);

	// count가 200 감소하면 채팅 화면으로 이동
	let previousCount = $state($count);
	$effect(() => {
		const current = $count;
		if (previousCount - current >= 200) {
			goto('/chat');
		}
		previousCount = current;
	});

	onMount(() => {
		if (!supabase) return;
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			if (nextSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
</svelte:head>

<div class="app">
	{@render children()}
</div>

<style>
	.app {
		min-height: 100vh;
	}
</style>
