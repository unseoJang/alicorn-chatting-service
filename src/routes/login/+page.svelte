<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: { form?: { message?: string } } } = $props();
</script>

<svelte:head>
	<title>로그인 - Alicorn 채팅</title>
</svelte:head>

<div class="login-page">
	<div class="login-card">
		<h1 class="login-title">Alicorn 채팅</h1>
		<p class="login-desc">로그인하여 대화를 시작하세요.</p>

		<form
			class="login-form"
			method="POST"
			action="?/login"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'redirect') await invalidateAll();
				};
			}}
		>
			<label for="name" class="label">이름</label>
			<input id="name" name="name" type="text" class="input" placeholder="이름을 입력하세요" required />
			{#if data.form?.message}
				<p class="form-error">{data.form.message}</p>
			{/if}
			<button type="submit" class="submit">로그인</button>
		</form>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-page);
		padding: 1.5rem;
	}
	.login-card {
		width: 100%;
		max-width: 380px;
		background: var(--bg-sidebar);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 2rem;
	}
	.login-title {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
		font-weight: 600;
		text-align: center;
	}
	.login-desc {
		margin: 0 0 1.5rem;
		color: var(--text-muted);
		font-size: 0.875rem;
		text-align: center;
	}
	.login-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-muted);
	}
	.input {
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--bg-input);
		color: var(--text);
		font: inherit;
	}
	.input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.form-error {
		margin: 0;
		font-size: 0.8125rem;
		color: #f87171;
	}
	.submit {
		margin-top: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		border: none;
		background: var(--accent);
		color: white;
		font-weight: 500;
		font: inherit;
		cursor: pointer;
		transition: background 0.15s;
	}
	.submit:hover {
		background: var(--accent-hover);
	}
</style>
