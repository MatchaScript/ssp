<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getPickerContext } from './picker.svelte.js';
	import { Select } from 'bits-ui';
	import { Check } from '$lib/components/icon';
	import Icon from '$lib/components/icon/icon.svelte';

	let {
		value,
		label,
		isDisabled = false,
		children: childrenProp,
		class: className = '',
		...rest
	}: {
		value: string;
		label?: string;
		isDisabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const state = getPickerContext();

	const resolvedLabel = $derived(label ?? value);
</script>

<Select.Item {...rest} {value} label={resolvedLabel} disabled={isDisabled}>
	{#snippet child({ props, selected, highlighted })}
		<div
			{...props}
			class={className}
			data-spectrum-picker-item
			data-value={value}
			data-label={resolvedLabel}
			data-selected={selected || undefined}
			data-highlighted={highlighted || undefined}
			data-disabled={isDisabled || undefined}
			data-size={state.size}
		>
			<!-- Checkmark -->
			<div data-spectrum-picker-item-checkmark data-visible={selected || undefined}>
				<Icon icon={Check} size={state.size} bold />
			</div>

			<!-- Text -->
			<div data-spectrum-picker-item-text>
				{#if childrenProp}
					{@render childrenProp()}
				{:else}
					{resolvedLabel}
				{/if}
			</div>
		</div>
	{/snippet}
</Select.Item>

<style>
	[data-spectrum-picker-item] {
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: subgrid;
		align-items: center;
		cursor: pointer;
		font-family: inherit;
		font-size: var(--text-100);
		font-weight: 500;
		color: var(--neutral-content-color-default);
		box-sizing: border-box;
		text-decoration: none;
	}

	[data-spectrum-picker-item][data-size='s'] {
		font-size: var(--text-50);
		border-radius: var(--corner-radius-small-default);
		padding: var(--spacing-100);
		gap: var(--spacing-100);
	}

	[data-spectrum-picker-item][data-size='m'] {
		border-radius: var(--corner-radius-medium-default);
		padding: var(--spacing-75);
		font-size: var(--text-100);
		gap: var(--spacing-100);
	}

	[data-spectrum-picker-item][data-size='l'] {
		font-size: var(--text-200);
		border-radius: var(--corner-radius-medium-default);
		padding: var(--spacing-200);
		gap: var(--spacing-200);
	}

	[data-spectrum-picker-item][data-size='xl'] {
		font-size: var(--text-300);
		border-radius: var(--corner-radius-large-default);
		padding: var(--spacing-300);
		gap: var(--spacing-300);
	}

	[data-spectrum-picker-item]:not([data-disabled]):hover,
	[data-spectrum-picker-item]:not([data-disabled])[data-highlighted] {
		background-color: var(--neutral-subtle-background-color-default);
	}

	[data-spectrum-picker-item][data-disabled] {
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}

	[data-spectrum-picker-item-checkmark] {
		grid-column: 1;
		display: grid;
		place-items: center;
		opacity: 0;
	}

	[data-spectrum-picker-item-checkmark][data-visible] {
		opacity: 1;
	}

	[data-spectrum-picker-item][data-selected] [data-spectrum-picker-item-checkmark] {
		color: var(--accent-visual-color);
	}

	[data-spectrum-picker-item][data-disabled][data-selected] [data-spectrum-picker-item-checkmark] {
		color: var(--disabled-content-color);
	}

	[data-spectrum-picker-item-text] {
		grid-column: 2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
