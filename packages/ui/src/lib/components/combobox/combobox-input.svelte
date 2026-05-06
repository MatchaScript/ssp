<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getComboboxContext } from './combobox.svelte.js';
	import { Combobox } from 'bits-ui';
	import { ChevronDown, AlertTriangle } from '$lib/components/icon';
	import Icon from '$lib/components/icon/icon.svelte';

	let {
		placeholder = '',
		class: className = '',
		style: styleProp = '',
		...rest
	}: Omit<HTMLInputAttributes, 'class' | 'style' | 'disabled' | 'placeholder'> & {
		placeholder?: string;
		class?: string;
		style?: string;
	} = $props();

	const state = getComboboxContext();
</script>

<div
	class={className}
	data-spectrum-combobox-field
	data-size={state.size}
	data-quiet={state.isQuiet || undefined}
	data-invalid={state.isInvalid || undefined}
	data-disabled={state.isDisabled || undefined}
	style="anchor-name: {state.anchorId}; {styleProp}"
>
	<Combobox.Input {placeholder} disabled={state.isDisabled}>
		{#snippet child({ props })}
			<input {...props} {...rest} data-spectrum-combobox-input />
		{/snippet}
	</Combobox.Input>

	{#if state.isInvalid}
		<div data-spectrum-combobox-invalid-icon>
			<Icon icon={AlertTriangle} color="negative" size={state.size} bold />
		</div>
	{/if}

	<Combobox.Trigger disabled={state.isDisabled}>
		{#snippet child({ props })}
			<button
				{...props}
				tabindex="-1"
				data-spectrum-combobox-trigger-button
				data-disabled={state.isDisabled || undefined}
				data-quiet={state.isQuiet || undefined}
				data-invalid={state.isInvalid || undefined}
			>
				<Icon icon={ChevronDown} size={state.size} />
			</button>
		{/snippet}
	</Combobox.Trigger>
</div>

<style>
	[data-spectrum-combobox-field] {
		position: relative;
		display: inline-grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		box-sizing: border-box;
		width: 100%;
		background-color: var(--background-base-color);
		border: var(--border-width-200) solid var(--gray-300);
		border-radius: var(--corner-radius-medium-default);
		transition:
			background-color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default),
			box-shadow var(--duration-fast) var(--ease-default),
			outline-color var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-combobox-field][data-quiet] {
		background-color: transparent;
		border-color: transparent;
		border-bottom-color: var(--neutral-visual-color);
		border-radius: 0;
	}

	/* Hover & Focus styling on wrapper */
	[data-spectrum-combobox-field]:hover {
		border-color: var(--gray-400);
	}
	[data-spectrum-combobox-field][data-quiet]:hover {
		background-color: var(--gray-200);
		border-bottom-color: var(--neutral-content-color-hover);
	}
	[data-spectrum-combobox-field]:focus-within {
		border-color: var(--neutral-content-color-hover);
	}
	[data-spectrum-combobox-field][data-quiet]:focus-within {
		background-color: transparent;
		border-bottom-color: var(--focus-indicator-color);
		box-shadow: 0 calc(var(--focus-indicator-thickness) - var(--border-width-200)) 0
			var(--focus-indicator-color);
	}
	[data-spectrum-combobox-field]:has([data-spectrum-combobox-input]:focus-visible),
	[data-spectrum-combobox-field]:has([data-spectrum-combobox-trigger-button]:focus-visible) {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	/* Invalid state */
	[data-spectrum-combobox-field][data-invalid]:not([data-quiet]) {
		border-color: var(--negative-background-color-default);
	}
	[data-spectrum-combobox-field][data-invalid]:not([data-quiet]):hover {
		border-color: var(--negative-background-color-hover);
	}
	[data-spectrum-combobox-field][data-invalid]:not([data-quiet]):focus-within {
		border-color: var(--negative-background-color-down);
	}
	[data-spectrum-combobox-field][data-quiet][data-invalid] {
		border-bottom-color: var(--negative-background-color-default);
	}

	/* Disabled Component Wrapper */
	[data-spectrum-combobox-field][data-disabled] {
		background-color: var(--disabled-background-color);
		border-color: transparent;
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}
	[data-spectrum-combobox-field][data-quiet][data-disabled] {
		background-color: transparent;
		border-bottom-color: var(--disabled-border-color);
	}

	/* Input Element */
	[data-spectrum-combobox-field] [data-spectrum-combobox-input] {
		grid-column: 1;
		appearance: none;
		background: transparent;
		border: none;
		color: var(--neutral-content-color-default);
		font-family: var(--font-sans);
		font-size: var(--text-100);
		width: 100%;
		padding: 0;
		outline: none;
		margin: 0;
		box-sizing: border-box;
	}
	[data-spectrum-combobox-field] [data-spectrum-combobox-input]::placeholder {
		color: var(--neutral-subdued-content-color-default);
		font-weight: 400;
		opacity: 1;
	}
	[data-spectrum-combobox-field][data-disabled] [data-spectrum-combobox-input] {
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}
	[data-spectrum-combobox-field][data-disabled] [data-spectrum-combobox-input]::placeholder {
		color: var(--disabled-content-color);
	}

	/* Trigger Button Segment */
	[data-spectrum-combobox-trigger-button] {
		grid-column: 3;
		appearance: none;
		background-color: var(--gray-100);
		border: none;
		color: var(--neutral-content-color-default);
		display: grid;
		place-items: center;
		padding: 0;
		margin: 0;
		height: var(--trigger-size, 20px);
		width: var(--trigger-size, 20px);
		border-radius: var(--corner-radius-small-default);
		outline: none;
		transition:
			background-color var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default);
	}
	[data-spectrum-combobox-trigger-button]:hover {
		background-color: var(--gray-200);
		color: var(--neutral-content-color-hover);
	}
	[data-spectrum-combobox-trigger-button][aria-expanded='true'] {
		background-color: var(--gray-300);
	}
	[data-spectrum-combobox-trigger-button]:active:not([data-disabled]) {
		background-color: var(--gray-300);
		transform: perspective(var(--trigger-size, 20px)) translate3d(0, 0, -2px);
	}
	[data-spectrum-combobox-trigger-button]:focus-visible {
		outline: none;
	}
	[data-spectrum-combobox-trigger-button][data-disabled] {
		background-color: transparent;
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}

	/* Invalid Icon */
	[data-spectrum-combobox-invalid-icon] {
		grid-column: 2;
		display: grid;
		place-items: center;
		padding-inline: var(--spacing-50);
	}

	/* Sizes */
	[data-spectrum-combobox-field][data-size='s'] {
		min-height: 24px;
		--trigger-size: 16px;
	}
	[data-spectrum-combobox-field][data-size='s'] [data-spectrum-combobox-input] {
		font-size: var(--text-75);
		padding: var(--space-1) var(--spacing-75);
	}
	[data-spectrum-combobox-field][data-size='s'] [data-spectrum-combobox-trigger-button] {
		margin-inline-end: var(--spacing-75);
	}

	[data-spectrum-combobox-field][data-size='m'] {
		min-height: 32px;
		--trigger-size: 20px;
	}
	[data-spectrum-combobox-field][data-size='m'] [data-spectrum-combobox-input] {
		font-size: var(--text-100);
		padding: calc(var(--space-1) + var(--border-width-100)) var(--spacing-100);
	}
	[data-spectrum-combobox-field][data-size='m'] [data-spectrum-combobox-trigger-button] {
		margin-inline-end: var(--spacing-100);
	}

	[data-spectrum-combobox-field][data-size='l'] {
		min-height: 40px;
		--trigger-size: 24px;
	}
	[data-spectrum-combobox-field][data-size='l'] [data-spectrum-combobox-input] {
		font-size: var(--text-200);
		padding: var(--space-2) var(--spacing-200);
	}
	[data-spectrum-combobox-field][data-size='l'] [data-spectrum-combobox-trigger-button] {
		margin-inline-end: var(--spacing-200);
	}

	[data-spectrum-combobox-field][data-size='xl'] {
		min-height: 48px;
		--trigger-size: 32px;
	}
	[data-spectrum-combobox-field][data-size='xl'] [data-spectrum-combobox-input] {
		font-size: var(--text-300);
		padding: var(--space-3) var(--spacing-300);
	}
	[data-spectrum-combobox-field][data-size='xl'] [data-spectrum-combobox-trigger-button] {
		margin-inline-end: var(--spacing-300);
	}

	/* Quiet: squelch padding on left */
	[data-spectrum-combobox-field][data-quiet] [data-spectrum-combobox-input] {
		padding-inline-start: 0;
	}
</style>
