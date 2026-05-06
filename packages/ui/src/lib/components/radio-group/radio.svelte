<script lang="ts">
	import { getRadioGroupContext } from './radio-group.svelte.js';
	import type { RadioProps } from './types.js';

	let {
		value,
		isDisabled = false,
		children,
		class: className,
		...restProps
	}: RadioProps = $props();

	const group = getRadioGroupContext();

	const checked = $derived(group.isSelected(value));
	const disabled = $derived(group.isDisabled || isDisabled);

	function onchange(e: Event & { currentTarget: HTMLInputElement }) {
		if (group.isReadOnly) {
			e.currentTarget.checked = group.isSelected(value);
			return;
		}
		if (e.currentTarget.checked) {
			group.setValue(value);
		}
	}

	function onclick(e: MouseEvent) {
		if (group.isReadOnly) e.preventDefault();
	}
</script>

<label
	class={className}
	data-spectrum-radio
	data-size={group.size}
	data-emphasized={group.isEmphasized || undefined}
	data-disabled={disabled || undefined}
	data-error={group.isError || undefined}
	data-readonly={group.isReadOnly || undefined}
>
	<input
		type="radio"
		name={group.name}
		{value}
		{checked}
		{disabled}
		required={group.isRequired || undefined}
		class="visually-hidden"
		{onchange}
		{onclick}
		{...restProps}
	/>
	<span data-spectrum-radio-circle></span>
	{#if children}
		<span data-spectrum-radio-label>{@render children()}</span>
	{/if}
</label>

<style>
	[data-spectrum-radio] {
		display: inline-grid;
		grid-auto-flow: column;
		place-items: center start;
		column-gap: var(--space-2, var(--spacing-100));
		cursor: pointer;
		font-family: inherit;
		box-sizing: border-box;
		margin: 0;
	}
	[data-spectrum-radio][data-disabled] {
		cursor: default;
	}
	[data-spectrum-radio][data-readonly] {
		cursor: default;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/*
	 * The radio circle uses Spectrum 2's "border grows inward when selected" trick.
	 * Outer dimensions stay the same; the border thickens to (height - 4px) / 2,
	 * leaving a 4px center of the background showing through.
	 */
	[data-spectrum-radio-circle] {
		box-sizing: border-box;
		display: inline-block;
		flex-shrink: 0;
		border-radius: var(--corner-radius-full);
		background-color: var(--background-base-color);
		border: var(--border-width-200) solid var(--neutral-content-color-default);
		transition:
			background-color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default),
			border-width var(--duration-fast) var(--ease-default);
	}

	/* Sizes — track checkbox sizes */
	[data-size='s'] [data-spectrum-radio-circle] {
		width: 14px;
		height: 14px;
	}
	[data-size='m'] [data-spectrum-radio-circle] {
		width: 16px;
		height: 16px;
	}
	[data-size='l'] [data-spectrum-radio-circle] {
		width: 18px;
		height: 18px;
	}
	[data-size='xl'] [data-spectrum-radio-circle] {
		width: 20px;
		height: 20px;
	}

	/* Label font sizes */
	[data-size='s'] [data-spectrum-radio-label] {
		font-size: var(--text-75);
	}
	[data-size='m'] [data-spectrum-radio-label] {
		font-size: var(--text-100);
	}
	[data-size='l'] [data-spectrum-radio-label] {
		font-size: var(--text-200);
	}
	[data-size='xl'] [data-spectrum-radio-label] {
		font-size: var(--text-300);
	}

	/* Hover (unselected) */
	[data-spectrum-radio]:hover [data-spectrum-radio-circle] {
		border-color: var(--neutral-content-color-hover);
	}
	[data-spectrum-radio]:active [data-spectrum-radio-circle] {
		border-color: var(--neutral-content-color-down);
	}

	/* Selected — border grows inward to leave a 4px center dot */
	[data-spectrum-radio]:has(input:checked)[data-size='s'] [data-spectrum-radio-circle] {
		border-width: 5px; /* (14 - 4) / 2 */
	}
	[data-spectrum-radio]:has(input:checked)[data-size='m'] [data-spectrum-radio-circle] {
		border-width: 6px; /* (16 - 4) / 2 */
	}
	[data-spectrum-radio]:has(input:checked)[data-size='l'] [data-spectrum-radio-circle] {
		border-width: 7px; /* (18 - 4) / 2 */
	}
	[data-spectrum-radio]:has(input:checked)[data-size='xl'] [data-spectrum-radio-circle] {
		border-width: 8px; /* (20 - 4) / 2 */
	}

	/* Selected — default (non-emphasized): use neutral content color */
	[data-spectrum-radio]:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--neutral-content-color-default);
	}
	[data-spectrum-radio]:hover:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--neutral-content-color-hover);
	}
	[data-spectrum-radio]:active:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--neutral-content-color-down);
	}

	/* Selected — emphasized: use accent color */
	[data-spectrum-radio][data-emphasized]:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--accent-background-color-default);
	}
	[data-spectrum-radio][data-emphasized]:hover:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--accent-background-color-hover);
	}
	[data-spectrum-radio][data-emphasized]:active:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--accent-background-color-down);
	}

	/* Error (unselected) */
	[data-spectrum-radio][data-error] [data-spectrum-radio-circle] {
		border-color: var(--negative-visual-color);
	}
	[data-spectrum-radio][data-error]:hover [data-spectrum-radio-circle] {
		border-color: var(--negative-visual-color);
	}

	/* Error + selected */
	[data-spectrum-radio][data-error]:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--negative-background-color-default);
	}
	[data-spectrum-radio][data-error]:hover:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--negative-background-color-hover);
	}

	/* Disabled */
	[data-spectrum-radio][data-disabled] [data-spectrum-radio-circle] {
		border-color: var(--disabled-content-color);
	}
	[data-spectrum-radio][data-disabled]:has(input:checked) [data-spectrum-radio-circle] {
		border-color: var(--disabled-content-color);
	}
	[data-spectrum-radio][data-disabled] [data-spectrum-radio-label] {
		color: var(--disabled-content-color);
	}

	/* Focus ring */
	[data-spectrum-radio] input:focus-visible ~ [data-spectrum-radio-circle] {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}
</style>
