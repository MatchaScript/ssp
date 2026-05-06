<script lang="ts">
	import type { TabsListProps } from './types.js';
	import { getTabsContext } from './tabs.svelte.js';
	import { Tabs } from 'bits-ui';

	let { children, class: className, ...restProps }: TabsListProps = $props();

	const state = getTabsContext();
</script>

<Tabs.List>
	{#snippet child({ props })}
		<div
			{...props}
			{...restProps}
			class={className}
			data-spectrum-tabs-list
			data-density={state.density}
		>
			{@render children?.()}
		</div>
	{/snippet}
</Tabs.List>

<style>
	[data-spectrum-tabs-list] {
		display: inline-flex;
	}

	[data-spectrum-tabs-list][data-density='regular'] {
		gap: 32px;
	}

	[data-spectrum-tabs-list][data-density='compact'] {
		gap: 24px;
	}
</style>
