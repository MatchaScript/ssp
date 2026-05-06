<script lang="ts">
	import { Label } from '../label/index.js';
	import type { ColorPickerProps } from './types.js';

	let {
		value = $bindable('#000000'),
		label,
		size = 'm',
		rounding = 'default',
		isDisabled = false,
		id,
		onInput,
		...restProps
	}: ColorPickerProps = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? uid);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onInput?.(target.value);
	}
</script>

<div data-spectrum-color-picker data-size={size} data-disabled={isDisabled || undefined}>
	<div
		data-spectrum-color-picker-trigger
		data-size={size}
		data-rounding={rounding}
		data-disabled={isDisabled || undefined}
	>
		<input
			{...restProps}
			type="color"
			id={inputId}
			{value}
			disabled={isDisabled}
			data-spectrum-color-picker-input
			oninput={handleInput}
		/>
		<span
			data-spectrum-color-picker-swatch
			data-size={size}
			data-rounding={rounding}
			style:--swatch-color={value}
		></span>
	</div>

	{#if label}
		<Label for={inputId}>
			{#if typeof label === 'string'}
				{label}
			{:else}
				{@render label()}
			{/if}
		</Label>
	{/if}
</div>

<style>
	[data-spectrum-color-picker] {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-100);
	}

	/* Trigger — positions the invisible input over the swatch */
	[data-spectrum-color-picker-trigger] {
		position: relative;
		display: inline-grid;
		place-items: center;
		padding: 2px;
		cursor: pointer;
		border-radius: var(--corner-radius-100);
	}

	[data-spectrum-color-picker-trigger][data-disabled] {
		cursor: not-allowed;
		opacity: 0.4;
	}

	/* Rounding variants on trigger (for focus ring shape) */
	[data-spectrum-color-picker-trigger][data-rounding='none'] {
		border-radius: 0;
	}
	[data-spectrum-color-picker-trigger][data-rounding='full'] {
		border-radius: 50%;
	}

	/* Native input — stretched over the swatch, invisible but clickable.
	   The browser anchors its color popup to this element's position. */
	[data-spectrum-color-picker-input] {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
		border: none;
		padding: 0;
		margin: 0;
	}

	[data-spectrum-color-picker-input]:focus-visible + [data-spectrum-color-picker-swatch] {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	[data-spectrum-color-picker-input]:disabled {
		cursor: not-allowed;
	}

	/* Swatch — the color preview */
	[data-spectrum-color-picker-swatch] {
		display: block;
		border: var(--border-width-100) solid color-mix(in srgb, var(--gray-1000), transparent 58%);
		box-sizing: border-box;
		background-color: var(--swatch-color);
	}

	/* Swatch rounding */
	[data-spectrum-color-picker-swatch][data-rounding='default'] {
		border-radius: var(--corner-radius-75);
	}
	[data-spectrum-color-picker-swatch][data-rounding='none'] {
		border-radius: 0;
	}
	[data-spectrum-color-picker-swatch][data-rounding='full'] {
		border-radius: 50%;
	}

	/* Swatch sizes */
	[data-spectrum-color-picker-swatch][data-size='s'] {
		width: 16px;
		height: 16px;
	}
	[data-spectrum-color-picker-swatch][data-size='m'] {
		width: 20px;
		height: 20px;
	}
	[data-spectrum-color-picker-swatch][data-size='l'] {
		width: 24px;
		height: 24px;
	}
	[data-spectrum-color-picker-swatch][data-size='xl'] {
		width: 32px;
		height: 32px;
	}
</style>
