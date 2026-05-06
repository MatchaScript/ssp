<script lang="ts">
	import { getPickerContext } from './picker.svelte.js';
	import { Select } from 'bits-ui';
	import { ChevronDown, AlertTriangle } from '$lib/components/icon';
	import Icon from '$lib/components/icon/icon.svelte';

	let {
		placeholder = 'Select an option',
		class: className = '',
		style: styleProp = '',
		...rest
	}: {
		placeholder?: string;
		class?: string;
		style?: string;
		[key: string]: unknown;
	} = $props();

	const state = getPickerContext();

	const displayValue = $derived(state.resolvedLabel);
</script>

<Select.Trigger>
	{#snippet child({ props })}
		<button
			{...props}
			{...rest}
			class={className}
			style="anchor-name: {state.anchorId}; {styleProp}"
			data-spectrum-picker-trigger
			data-disabled={state.isDisabled || undefined}
			data-size={state.size}
			data-quiet={state.isQuiet || undefined}
			data-invalid={state.isInvalid || undefined}
			disabled={state.isDisabled}
		>
			<!-- Value / Placeholder -->
			<span data-spectrum-picker-trigger-value data-is-placeholder={!displayValue || undefined}>
				{displayValue || placeholder}
			</span>

			<!-- Invalid Icon -->
			{#if state.isInvalid}
				<div data-spectrum-picker-trigger-invalid>
					<Icon icon={AlertTriangle} color="negative" size={state.size} bold />
				</div>
			{/if}

			<!-- Chevron -->
			<div data-spectrum-picker-trigger-chevron>
				<Icon icon={ChevronDown} size={state.size} />
			</div>
		</button>
	{/snippet}
</Select.Trigger>

<style>
	[data-spectrum-picker-trigger] {
		/* anchor-name is set via inline styles dynamically */

		display: inline-grid;
		/* 3 column grid: text | invalid | chevron */
		grid-template-columns: 1fr auto auto;
		align-items: center;
		padding-block: var(--space-1);
		/* standard spectrum button-like styles */
		appearance: none;
		background-color: var(--gray-100);
		border: var(--border-width-200) solid transparent;
		border-radius: var(--corner-radius-medium-default);
		color: var(--neutral-content-color-default);
		font-family: inherit;
		font-size: var(--text-100);
		margin: 0;
		font-weight: 500;
		min-height: var(--space-8);
		cursor: pointer;
		box-sizing: border-box;
		text-align: left;
		width: 100%;
		transition:
			background-color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default),
			box-shadow var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-picker-trigger]:hover {
		background-color: var(--gray-200);
	}

	[data-spectrum-picker-trigger][data-state='open'] {
		background-color: var(--gray-200);
	}

	[data-spectrum-picker-trigger]:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--focus-indicator-thickness) var(--focus-indicator-color);
	}

	[data-spectrum-picker-trigger][disabled] {
		background-color: var(--disabled-background-color);
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}

	/* Sizes */
	[data-spectrum-picker-trigger][data-size='s'] {
		min-height: 24px;
		font-size: var(--text-75);
		padding-inline: var(--spacing-75);
		gap: var(--spacing-50);
	}
	[data-spectrum-picker-trigger][data-size='m'] {
		min-height: 32px;
		padding-inline: var(--spacing-100);
		gap: var(--spacing-75);
	}
	[data-spectrum-picker-trigger][data-size='l'] {
		min-height: 40px;
		font-size: var(--text-200);
		padding-inline: var(--spacing-200);
		gap: var(--spacing-100);
	}
	[data-spectrum-picker-trigger][data-size='xl'] {
		min-height: 48px;
		font-size: var(--text-300);
		padding-inline: var(--spacing-300);
		gap: var(--spacing-200);
	}

	/* Quiet */
	[data-spectrum-picker-trigger][data-quiet] {
		background-color: transparent;
		border-color: transparent;
	}
	[data-spectrum-picker-trigger][data-quiet]:hover {
		background-color: var(--gray-200);
	}
	[data-spectrum-picker-trigger][data-quiet][data-state='open'] {
		background-color: var(--gray-200);
	}
	[data-spectrum-picker-trigger][data-quiet]:focus-visible {
		box-shadow: 0 var(--focus-indicator-thickness) 0 var(--focus-indicator-color);
	}
	[data-spectrum-picker-trigger][data-quiet][disabled] {
		background-color: transparent;
	}

	/* Invalid */
	[data-spectrum-picker-trigger][data-invalid]:not([data-quiet]) {
		border-color: var(--negative-background-color-default);
	}
	[data-spectrum-picker-trigger][data-invalid]:not([data-quiet]):hover,
	[data-spectrum-picker-trigger][data-invalid]:not([data-quiet])[data-state='open'] {
		border-color: var(--negative-background-color-hover);
	}

	/* Value / Placeholder */
	[data-spectrum-picker-trigger-value] {
		grid-column: 1;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
		padding-inline-start: var(--space-2);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: inherit;
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-picker-trigger-value][data-is-placeholder] {
		color: var(--neutral-subdued-content-color-default);
	}

	[data-spectrum-picker-trigger-chevron] {
		grid-column: 3;
		display: grid;
		place-items: center;
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-picker-trigger-invalid] {
		grid-column: 2;
		display: grid;
		place-items: center;
	}

	[data-spectrum-picker-trigger][disabled] [data-spectrum-picker-trigger-chevron] {
		color: var(--disabled-content-color);
	}
</style>
