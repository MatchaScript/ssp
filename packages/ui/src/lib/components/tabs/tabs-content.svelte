<script lang="ts">
	import type { TabsContentProps } from './types.js';
	import { Tabs } from 'bits-ui';

	let { value, children, class: className, ...restProps }: TabsContentProps = $props();
</script>

<Tabs.Content value={String(value)}>
	{#snippet child({ props })}
		<div {...props} {...restProps} class={className} data-spectrum-tabs-content>
			{@render children?.()}
		</div>
	{/snippet}
</Tabs.Content>

<style>
	[data-spectrum-tabs-content] {
		display: block;
		padding-block-start: var(--spacing-200);
		font-family: inherit;
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-tabs-content]:focus-visible {
		outline: 2px solid var(--focus-indicator-color);
		outline-offset: -2px;
	}
</style>
