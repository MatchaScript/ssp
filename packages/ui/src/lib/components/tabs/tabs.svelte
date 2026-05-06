<script lang="ts">
	import type { TabsProps } from './types.js';
	import { setTabsContext } from './tabs.svelte.js';
	import { Tabs } from 'bits-ui';

	let {
		defaultSelectedKey,
		selectedKey = $bindable(defaultSelectedKey),
		onSelectionChange,
		isDisabled = false,
		density = 'regular',
		children,
		class: className,
		...restProps
	}: TabsProps = $props();

	// Provide density to children
	setTabsContext({
		get density() {
			return density;
		}
	});

	let stringValue = $derived(selectedKey !== undefined ? String(selectedKey) : undefined);
</script>

<Tabs.Root
	value={stringValue}
	onValueChange={(v) => {
		const newKey =
			typeof selectedKey === 'number' || typeof defaultSelectedKey === 'number' ? Number(v) : v;
		selectedKey = newKey;
		onSelectionChange?.(newKey);
	}}
	disabled={isDisabled}
>
	{#snippet child({ props })}
		<div
			{...props}
			{...restProps}
			class={className}
			data-spectrum-tabs
			data-disabled={isDisabled || undefined}
		>
			{@render children?.()}
		</div>
	{/snippet}
</Tabs.Root>

<style>
	[data-spectrum-tabs] {
		display: grid;
		grid-auto-rows: min-content 1fr;
		width: 100%;
		font-family: inherit;
		box-sizing: border-box;
		position: relative;
	}

	[data-spectrum-tabs][data-disabled] {
		opacity: var(--opacity-disabled);
	}
</style>
