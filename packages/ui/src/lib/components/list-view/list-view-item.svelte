<script lang="ts">
	import { untrack } from 'svelte';
	import type { ListViewItemProps } from './types.js';
	import { getListViewContext } from './list-view.svelte.js';
	import { Checkbox } from '../checkbox/index.js';

	let {
		key,
		// Destructured to keep out of restProps (spread on DOM element)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		href,
		textValue,
		isDisabled: isItemDisabled = false,
		children,
		description,
		class: className,
		ref = $bindable(null),
		...restProps
	}: ListViewItemProps & { ref?: HTMLElement | null } = $props();

	const domId = $props.id();
	const state = getListViewContext();

	let isDisabled = $derived(state.isItemDisabled(key) || isItemDisabled);
	let isSelected = $derived(state.isSelected(key));
	let isFocused = $derived(state.highlightedId === domId);
	let showCheckbox = $derived(
		state.selectionMode !== 'none' && state.selectionStyle === 'checkbox'
	);
	let isHighlightStyle = $derived(
		state.selectionMode !== 'none' && state.selectionStyle === 'highlight'
	);

	// Register on mount; don't re-register on disabled/textValue changes (keeps highlight stable).
	$effect(() => {
		const el = ref;
		if (!el) return;
		return untrack(() =>
			state.registerItem({
				domId,
				value: key,
				el,
				disabled: isDisabled,
				textValue: textValue ?? el.textContent?.trim() ?? ''
			})
		);
	});

	// Sync mutable fields without unregistering.
	$effect(() => {
		state.updateItem(domId, {
			disabled: isDisabled,
			textValue: textValue ?? ref?.textContent?.trim() ?? ''
		});
	});

	function handleClick(e: MouseEvent) {
		if (isDisabled) return;
		state.selectFromInput(key, {
			shiftKey: e.shiftKey,
			ctrlKey: e.ctrlKey,
			metaKey: e.metaKey
		});
	}

	function handleDoubleClick() {
		if (isDisabled) return;
		state.onAction?.(key);
	}

	// Sync highlightedId to whatever the browser focused (Tab, click, AT)
	// without re-calling .focus() — that would cause an infinite loop.
	function handleFocus() {
		if (isDisabled) return;
		state.syncHighlight(domId);
	}
</script>

<div
	role="row"
	aria-selected={state.selectionMode !== 'none' ? isSelected : undefined}
	aria-disabled={isDisabled || undefined}
	data-spectrum-list-view-row
	data-key={key}
	data-selected={isSelected || undefined}
	data-disabled={isDisabled || undefined}
	data-focused={isFocused || undefined}
	data-density={state.density}
>
	<div
		bind:this={ref}
		role="gridcell"
		data-spectrum-list-view-item
		data-key={key}
		data-selected={isSelected || undefined}
		data-disabled={isDisabled || undefined}
		data-focused={isFocused || undefined}
		data-density={state.density}
		data-quiet={state.isQuiet || undefined}
		data-highlight={isHighlightStyle && isSelected ? '' : undefined}
		class={className}
		tabindex={isFocused ? 0 : -1}
		onclick={handleClick}
		ondblclick={handleDoubleClick}
		onfocus={handleFocus}
		{...restProps}
	>
		{#if showCheckbox}
			<div aria-hidden="true" data-spectrum-list-view-checkbox>
				<Checkbox checked={isSelected} {isDisabled} size="s" tabindex={-1} />
			</div>
		{/if}

		<div data-spectrum-list-view-item-content>
			<div data-spectrum-list-view-item-text>
				{#if children}
					{@render children()}
				{/if}
			</div>

			{#if description}
				<div data-spectrum-list-view-item-description>
					{#if typeof description === 'string'}
						{description}
					{:else}
						{@render description()}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	[data-spectrum-list-view-row] {
		display: contents;
	}

	[data-spectrum-list-view-item] {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--spacing-100);

		box-sizing: border-box;
		font-family: inherit;
		font-size: var(--text-100);
		color: var(--neutral-subdued-content-color-default);
		text-decoration: none;
		cursor: default;

		padding-inline: var(--spacing-200);
		border-block-end: 1px solid var(--gray-300);

		outline: none;
		position: relative;
	}

	/* Density: row heights */
	[data-spectrum-list-view-item][data-density='compact'] {
		min-height: 32px;
	}
	[data-spectrum-list-view-item][data-density='regular'] {
		min-height: 40px;
	}
	[data-spectrum-list-view-item][data-density='spacious'] {
		min-height: 48px;
	}

	/* Focus */
	[data-spectrum-list-view-item][data-focused] {
		outline: 2px solid var(--focus-indicator-color);
		outline-offset: -2px;
		border-radius: var(--corner-radius-small-default);
		z-index: 1;
	}

	/* Hover */
	[data-spectrum-list-view-item]:not([data-disabled]):hover {
		background-color: var(--neutral-subtle-background-color-default);
	}

	/* Selected: promote to full neutral */
	[data-spectrum-list-view-item][data-selected] {
		color: var(--neutral-content-color-default);
	}

	/* Highlight selection — subtle blue overlay, text stays dark */
	[data-spectrum-list-view-item][data-highlight] {
		background-color: color-mix(
			in srgb,
			var(--background-base-color),
			var(--accent-background-color-default) 10%
		);
	}
	[data-spectrum-list-view-item][data-highlight]:hover {
		background-color: color-mix(
			in srgb,
			var(--background-base-color),
			var(--accent-background-color-default) 15%
		);
	}

	/* Checkbox selection - subtle gray indicator */
	[data-spectrum-list-view-item][data-selected]:not([data-highlight]) {
		background-color: color-mix(in srgb, var(--background-base-color), var(--gray-900) 7%);
	}

	/* Disabled */
	[data-spectrum-list-view-item][data-disabled] {
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}

	/* Quiet mode: no row dividers */
	[data-spectrum-list-view-item][data-quiet] {
		border-block-end: none;
	}

	/* Checkbox */
	[data-spectrum-list-view-checkbox] {
		display: grid;
		place-items: center;
		padding-inline-end: var(--spacing-75);
		cursor: pointer;
	}
	[data-spectrum-list-view-checkbox] {
		pointer-events: none;
	}

	/* Item content */
	[data-spectrum-list-view-item-content] {
		display: grid;
		gap: 1px;
		padding-block: var(--spacing-75);
		min-width: 0;
	}

	[data-spectrum-list-view-item-text] {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	[data-spectrum-list-view-item-description] {
		font-size: var(--text-75);
		color: var(--neutral-subdued-content-color-default);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	[data-spectrum-list-view-item][data-disabled] [data-spectrum-list-view-item-description] {
		color: var(--disabled-content-color);
	}

	[data-spectrum-list-view-item][data-highlight] [data-spectrum-list-view-item-description] {
		color: var(--neutral-subdued-content-color-default);
	}
</style>
