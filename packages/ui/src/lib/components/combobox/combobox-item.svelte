<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getComboboxContext } from './combobox.svelte.js';
	import { Combobox } from 'bits-ui';
	import { Check } from '$lib/components/icon';
	import Icon from '$lib/components/icon/icon.svelte';

	let {
		value,
		label,
		disabled = false,
		children: childrenProp,
		class: className = '',
		...rest
	}: {
		value: string;
		label?: string;
		disabled?: boolean;
		children?: Snippet;
		class?: string;
		[key: string]: unknown;
	} = $props();

	const state = getComboboxContext();
</script>

<Combobox.Item
	{value}
	label={label || (typeof childrenProp === 'undefined' ? value : undefined)}
	{disabled}
	{...rest}
>
	{#snippet child({ props, selected, highlighted })}
		<div
			{...props}
			class={className}
			data-spectrum-combobox-item
			data-value={value}
			data-label={label}
			data-selected={selected || undefined}
			data-highlighted={highlighted || undefined}
			data-disabled={disabled || undefined}
			data-size={state.size}
		>
			<!-- Column 1: Checkmark -->
			<div data-spectrum-combobox-item-checkmark data-visible={selected || undefined}>
				<Icon icon={Check} size={state.size} bold />
			</div>

			<!-- Column 2: Text -->
			<div data-spectrum-combobox-item-text>
				{#if childrenProp}
					{@render childrenProp()}
				{:else}
					{label || value}
				{/if}
			</div>
		</div>
	{/snippet}
</Combobox.Item>

<style>
	[data-spectrum-combobox-item] {
		display: grid;
		/* Span all 2 columns defined by Content */
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

	[data-spectrum-combobox-item][data-size='s'] {
		font-size: var(--text-75);
		border-radius: var(--corner-radius-small-default);
		padding: var(--spacing-100);
		gap: var(--spacing-100);
	}

	[data-spectrum-combobox-item][data-size='m'] {
		border-radius: var(--corner-radius-small-default);
		padding: var(--spacing-75);
		gap: var(--spacing-100);
	}

	[data-spectrum-combobox-item][data-size='l'] {
		font-size: var(--text-200);
		border-radius: var(--corner-radius-medium-default);
		padding: var(--spacing-200);
		gap: var(--spacing-200);
	}

	[data-spectrum-combobox-item][data-size='xl'] {
		font-size: var(--text-300);
		border-radius: var(--corner-radius-large-default);
		padding: var(--spacing-300);
		gap: var(--spacing-300);
	}

	[data-spectrum-combobox-item]:not([data-disabled]):hover,
	[data-spectrum-combobox-item]:not([data-disabled])[data-highlighted] {
		background-color: var(--neutral-subtle-background-color-default);
	}

	[data-spectrum-combobox-item][data-disabled] {
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}

	[data-spectrum-combobox-item-checkmark] {
		grid-column: 1;
		display: grid;
		place-items: center;
		opacity: 0;
	}

	[data-spectrum-combobox-item-checkmark][data-visible] {
		opacity: 1;
	}

	[data-spectrum-combobox-item][data-selected] [data-spectrum-combobox-item-checkmark] {
		color: var(--accent-visual-color);
	}

	[data-spectrum-combobox-item][data-disabled][data-selected]
		[data-spectrum-combobox-item-checkmark] {
		color: var(--disabled-content-color);
	}

	[data-spectrum-combobox-item-text] {
		grid-column: 2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
