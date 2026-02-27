<script lang="ts">
	import { goto } from '$app/navigation';
	import { chatApi } from '$lib/api/client';
	import { findOrCreateRoom, PARTNER_SEARCH_DEBOUNCE_MS } from '$lib/chat';
	import type { User } from '$lib/types/chat';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	let searchQuery = $state('');
	let searchResults = $state<User[]>([]);
	let searchLoading = $state(false);
	let creatingUserId = $state<string | null>(null);
	let error = $state<string | null>(null);

	$effect(() => {
		if (!open) return;
		const q = searchQuery.trim();
		let timeoutId: ReturnType<typeof setTimeout>;
		if (!q) {
			searchResults = [];
			error = null;
			return () => {};
		}
		timeoutId = setTimeout(() => {
			searchLoading = true;
			error = null;
			chatApi
				.searchUsers(q)
				.then((users) => {
					searchResults = users;
				})
				.catch((e) => {
					error = e instanceof Error ? e.message : '검색에 실패했습니다.';
					searchResults = [];
				})
				.finally(() => {
					searchLoading = false;
				});
		}, PARTNER_SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timeoutId);
	});

	async function handleSelect(user: User) {
		if (creatingUserId) return;
		creatingUserId = user.id;
		error = null;
		try {
			const room = await findOrCreateRoom(user);
			onclose();
			searchQuery = '';
			searchResults = [];
			goto(`/chat/${room.id}`);
		} catch (e) {
			error = e instanceof Error ? e.message : '대화방을 만들 수 없습니다.';
		} finally {
			creatingUserId = null;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

{#if open}
	<div
		class="modal-backdrop"
		role="dialog"
		aria-modal="true"
		aria-labelledby="new-msg-title"
		tabindex="-1"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<div class="modal-box">
			<div class="modal-header">
				<h2 id="new-msg-title" class="modal-title">새 메시지</h2>
				<button type="button" class="modal-close" onclick={onclose} aria-label="닫기">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>
			<label for="new-msg-search" class="sr-only">대화 상대 검색</label>
			<input
				id="new-msg-search"
				type="search"
				class="modal-search"
				placeholder="이름으로 대화 상대 검색"
				bind:value={searchQuery}
				aria-label="대화 상대 검색"
			/>
			{#if error}
				<p class="modal-error" role="alert">{error}</p>
			{/if}
			<div class="modal-results">
				{#if searchQuery.trim() === ''}
					<p class="modal-hint">대화할 상대의 이름을 입력하세요.</p>
				{:else if searchLoading}
					<p class="modal-loading">검색 중...</p>
				{:else if searchResults.length === 0}
					<p class="modal-empty">검색 결과가 없습니다.</p>
				{:else}
					<ul class="result-list" role="list">
						{#each searchResults as user (user.id)}
							<li>
								<button
									type="button"
									class="result-item"
									onclick={() => handleSelect(user)}
									disabled={creatingUserId === user.id}
								>
									<span class="result-avatar">{user.name.charAt(0)}</span>
									<span class="result-name">{user.name}</span>
									{#if creatingUserId === user.id}
										<span class="result-badge">생성 중...</span>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 1rem;
	}
	.modal-box {
		width: 100%;
		max-width: 400px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-sidebar);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
		overflow: hidden;
	}
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border);
	}
	.modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text);
	}
	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.375rem;
		border: none;
		background: none;
		color: var(--text-muted);
		cursor: pointer;
		border-radius: 6px;
		transition: color 0.15s, background 0.15s;
	}
	.modal-close:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
	}
	.modal-search {
		width: 100%;
		margin: 0;
		padding: 0.75rem 1.25rem;
		border: none;
		border-bottom: 1px solid var(--border);
		background: var(--bg-input);
		color: var(--text);
		font-size: 0.9375rem;
		outline: none;
	}
	.modal-search::placeholder {
		color: var(--text-muted);
	}
	.modal-search:focus {
		background: var(--bg-main);
	}
	.modal-error {
		margin: 0;
		padding: 0.5rem 1.25rem;
		font-size: 0.8125rem;
		color: #f87171;
	}
	.modal-results {
		flex: 1;
		overflow-y: auto;
		min-height: 120px;
		padding: 0.5rem 0;
	}
	.modal-hint,
	.modal-loading,
	.modal-empty {
		margin: 0;
		padding: 1.5rem 1.25rem;
		text-align: center;
		font-size: 0.875rem;
		color: var(--text-muted);
	}
	.result-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.result-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1.25rem;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s;
	}
	.result-item:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
	}
	.result-item:disabled {
		opacity: 0.85;
		cursor: wait;
	}
	.result-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		flex-shrink: 0;
	}
	.result-name {
		flex: 1;
		font-weight: 500;
	}
	.result-badge {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
