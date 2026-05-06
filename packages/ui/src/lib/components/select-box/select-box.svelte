<script lang="ts">
	import { untrack } from 'svelte';
	import type { SelectBoxProps } from './types.js';
	import { getSelectBoxGroupContext } from './select-box-group.svelte.js';
	import { CheckboxBox } from '../checkbox/index.js';

	let {
		key,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		textValue,
		isDisabled: isItemDisabled = false,
		illustration,
		description,
		children,
		class: className,
		...restProps
	}: SelectBoxProps = $props();

	const group = getSelectBoxGroupContext();

	$effect(() => {
		const k = key;
		untrack(() => group.registerKey(k));
		return () => untrack(() => group.unregisterKey(k));
	});

	const isSelected = $derived(group.isSelected(key));
	const isDisabled = $derived(group.isItemDisabled(key) || isItemDisabled);
	const isFocused = $derived(group.focusedKey === key);
	const showCheckbox = $derived(group.selectionMode === 'multiple' && !isDisabled);

	function handleClick() {
		if (isDisabled) return;
		group.setFocusedKey(key);
		group.toggleSelection(key);
	}

	function handleFocus() {
		group.setFocusedKey(key);
	}
</script>

<div
	role="option"
	aria-selected={isSelected}
	aria-disabled={isDisabled || undefined}
	data-spectrum-select-box
	data-key={key}
	data-orientation={group.orientation}
	data-selected={isSelected || undefined}
	data-disabled={isDisabled || undefined}
	data-focused={isFocused || undefined}
	data-has-illustration={illustration ? '' : undefined}
	data-has-description={description ? '' : undefined}
	class={className}
	tabindex={isFocused ? 0 : -1}
	onclick={handleClick}
	onfocus={handleFocus}
	{...restProps}
>
	{#if showCheckbox}
		<div data-spectrum-select-box-indicator aria-hidden="true">
			<CheckboxBox checked={isSelected} {isDisabled} size="m" />
		</div>
	{/if}

	{#if illustration}
		<div data-spectrum-select-box-illustration>
			{@render illustration()}
		</div>
	{/if}

	{#if children}
		<div data-spectrum-select-box-label>
			{@render children()}
		</div>
	{/if}

	{#if description}
		<div data-spectrum-select-box-description>
			{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}
</div>

<style>
	[data-spectrum-select-box] {
		position: relative;
		display: grid;
		box-sizing: border-box;
		overflow: hidden;
		cursor: default;
		outline: none;

		font-family: inherit;
		font-size: var(--text-100);
		color: var(--neutral-content-color-default);

		background-color: var(--layer-2-background-color, var(--background-base-color));
		border: var(--border-width-200) solid transparent;
		border-radius: var(--corner-radius-large-default, 12px);

		box-shadow: var(--drop-shadow-emphasized, 0 1px 4px rgb(0 0 0 / 0.1));
		transition:
			background-color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default),
			box-shadow var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default);
	}

	/* Vertical (default) — square card with stacked illustration + label */
	[data-spectrum-select-box][data-orientation='vertical'] {
		width: 170px;
		min-width: 144px;
		height: 170px;
		min-height: 144px;
		max-height: 170px;
		max-width: 100%;
		padding: var(--spacing-300);
		grid-template-areas:
			'illustration'
			'label';
		grid-template-rows: 1fr min-content;
		row-gap: var(--spacing-100);
		align-content: center;
		justify-items: center;
		text-align: center;
	}

	/* Horizontal — wide card with side-by-side illustration + (label + description) */
	[data-spectrum-select-box][data-orientation='horizontal'] {
		width: 368px;
		min-width: 188px;
		max-width: min(100%, 480px);
		min-height: 80px;
		max-height: 240px;
		padding: var(--spacing-200);
		padding-inline-start: var(--spacing-400);
		padding-inline-end: var(--spacing-300);
		grid-template-areas:
			'illustration label'
			'illustration description';
		grid-template-columns: min-content 1fr;
		grid-template-rows: min-content min-content;
		column-gap: var(--spacing-200);
		align-content: center;
	}
	[data-spectrum-select-box][data-orientation='horizontal']:not([data-has-description]) {
		grid-template-areas: 'illustration label';
		grid-template-rows: min-content;
	}
	[data-spectrum-select-box][data-orientation='horizontal']:not([data-has-illustration]) {
		grid-template-columns: 1fr;
		grid-template-areas:
			'label'
			'description';
	}

	/* Hover */
	[data-spectrum-select-box]:not([data-disabled]):hover {
		box-shadow: var(--drop-shadow-elevated, 0 2px 8px rgb(0 0 0 / 0.15));
	}

	/* Selected — neutral border */
	[data-spectrum-select-box][data-selected] {
		border-color: var(--neutral-content-color-default);
		box-shadow: var(--drop-shadow-elevated, 0 2px 8px rgb(0 0 0 / 0.15));
	}

	/* Disabled */
	[data-spectrum-select-box][data-disabled] {
		background-color: var(--disabled-background-color);
		color: var(--disabled-content-color);
		box-shadow: none;
		border-color: transparent;
		cursor: default;
	}

	/* Focus ring */
	[data-spectrum-select-box][data-focused]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	/* Press */
	[data-spectrum-select-box]:not([data-disabled]):active {
		transform: scale(0.98);
	}

	/* Multi-select indicator — top-left checkbox */
	[data-spectrum-select-box-indicator] {
		position: absolute;
		top: var(--spacing-100);
		inset-inline-start: var(--spacing-100);
		pointer-events: none;
	}

	/* Slot styling */
	[data-spectrum-select-box-illustration] {
		grid-area: illustration;
		display: grid;
		place-items: center;
		min-width: 48px;
		min-height: 48px;
		color: var(--neutral-content-color-default);
	}
	[data-spectrum-select-box][data-disabled] [data-spectrum-select-box-illustration] {
		color: var(--disabled-content-color);
	}

	[data-spectrum-select-box-label] {
		grid-area: label;
		min-width: 0;
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: inherit;
	}
	[data-spectrum-select-box][data-orientation='horizontal'] [data-spectrum-select-box-label] {
		font-weight: var(--font-weight-bold, 700);
		text-align: start;
	}

	[data-spectrum-select-box-description] {
		grid-area: description;
		font-size: var(--text-75);
		color: var(--neutral-subdued-content-color-default);
		overflow: hidden;
	}
	[data-spectrum-select-box][data-orientation='vertical'] [data-spectrum-select-box-description] {
		display: none;
	}
	[data-spectrum-select-box][data-disabled] [data-spectrum-select-box-description] {
		color: var(--disabled-content-color);
	}
</style>
