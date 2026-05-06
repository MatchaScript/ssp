<script lang="ts">
	import type { SegmentedControlProps } from './types.js';
	import { RadioGroup } from 'bits-ui';

	let {
		defaultSelectedKey,
		selectedKey = $bindable(defaultSelectedKey),
		onSelectionChange,
		isDisabled = false,
		isJustified = false,
		children,
		class: className,
		...restProps
	}: SegmentedControlProps = $props();
</script>

<RadioGroup.Root
	bind:value={selectedKey}
	onValueChange={onSelectionChange}
	disabled={isDisabled}
	{...restProps}
>
	{#snippet child({ props })}
		<div
			{...props}
			class={className}
			data-spectrum-segmented-control
			data-justified={isJustified || undefined}
			data-disabled={isDisabled || undefined}
		>
			{@render children()}
		</div>
	{/snippet}
</RadioGroup.Root>

<style>
	[data-spectrum-segmented-control] {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		font-weight: 500;
		border-radius: var(--corner-radius-300);
		background-color: var(--gray-100);
		gap: var(--space-1);
		width: max-content;
		position: relative;
		font-family: inherit;
		box-sizing: border-box;
		margin: 0;
	}

	[data-spectrum-segmented-control][data-justified] {
		display: grid;
		grid-auto-columns: 1fr;
		width: 100%;
	}

	[data-spectrum-segmented-control][data-disabled] {
		opacity: var(--opacity-disabled);
		/* Individual items are disabled via context and get native pointer-events: none, so no need here, but helps visually dim the wrapper if design requests */
	}
</style>
