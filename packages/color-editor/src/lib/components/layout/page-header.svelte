<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppActions from './app-actions.svelte';

	let { title, actions }: { title: string; actions?: Snippet } = $props();
</script>

<header class="page-header">
	<h1 class="page-title">{title}</h1>
	{#if actions}
		<div class="page-actions">{@render actions()}</div>
	{/if}
	<div class="app-actions"><AppActions /></div>
</header>

<style>
	/* The app's only header row. Fixed height so it does not jump between pages
	   that carry controls and pages that only carry a title:
	   8px + a 32px `size="s"` control + 8px. */
	.page-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-300);
		min-height: 3rem;
		padding: var(--spacing-100) var(--spacing-400);
		border-bottom: 1px solid var(--gray-200);
	}

	.page-title {
		flex: 1;
		font-size: var(--text-200);
		font-weight: 600;
		color: var(--neutral-content-color-default);
		margin: 0;
		white-space: nowrap;
	}

	.page-actions,
	.app-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-200);
	}

	.app-actions {
		gap: var(--space-1);
	}

	/* Leave room for the nav button the layout overlays at the start of the row. */
	@container app (max-width: 767px) {
		.page-header {
			padding-inline-start: calc(var(--space-2) + var(--space-10));
		}
	}
</style>
