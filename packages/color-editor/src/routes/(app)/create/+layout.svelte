<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ColorList } from '$lib/components/features/color-list';
	import { configState } from '$lib/stores/config.svelte';
	import { ActionButton, Text } from '@matchalatte/ssp-ui';
	import { Icon, Plus } from '@matchalatte/ssp-ui/components/icon';
	import { PageHeader } from '$lib/components/layout';
	import { m } from '$lib/paraglide/messages';

	let { children } = $props();

	function addColor() {
		const name = configState.addColor();
		goto(resolve('/(app)/create/[color]', { color: name }));
	}
</script>

<div class="create-page">
	<PageHeader title={m.create_title()}>
		{#snippet actions()}
			<ActionButton size="s" onclick={addColor} aria-label={m.create_add_color()}>
				<Icon icon={Plus} />
				<Text>{m.create_add_color()}</Text>
			</ActionButton>
		{/snippet}
	</PageHeader>

	<div class="create-layout">
		<aside class="create-sidebar">
			<ColorList colors={configState.colors} accentColor={configState.accentColor} />
		</aside>

		<div class="create-main">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.create-page {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
		min-height: 0;
	}

	.create-layout {
		display: grid;
		grid-template-columns: 15rem 1fr;
		min-height: 0;
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
