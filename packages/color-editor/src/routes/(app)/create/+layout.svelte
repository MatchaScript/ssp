<script lang="ts">
	import { ColorList } from '$lib/components/features/color-list';
	import { configState } from '$lib/stores/config.svelte';

	let { children } = $props();
</script>

<div class="create-layout">
	<aside class="create-sidebar">
		<ColorList colors={configState.colors} accentColor={configState.accentColor} />
	</aside>

	<div class="create-main">
		{@render children()}
	</div>
</div>

<style>
	.create-layout {
		display: grid;
		grid-template-columns: 15rem 1fr;
		height: 100%;
	}

	.create-sidebar {
		overflow-y: auto;
		border-right: 1px solid var(--gray-200);
		padding: var(--spacing-75);
	}

	.create-main {
		overflow-y: auto;
		min-height: 0;
	}
</style>
