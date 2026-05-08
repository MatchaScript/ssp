<script lang="ts">
	import { untrack } from 'svelte';
	import { getTagGroupContext } from './tag-group.svelte.js';
	import type { TagItemProps } from './types.js';
	import { Icon, X } from '../icon/index.js';

	let {
		id,
		children,
		icon,
		textValue,
		isDisabled = false,
		href,
		target,
		rel,
		download,
		ref = $bindable(null),
		class: className,
		...restProps
	}: TagItemProps = $props();

	const domId = $props.id();
	const removeBtnId = `${domId}-remove`;
	const state = getTagGroupContext();

	let isTagDisabled = $derived(state.isTagDisabled(id) || isDisabled);
	let isSelected = $derived(state.isSelected(id));
	let isRowFocused = $derived(state.isRowFocused(domId));

	// Mount registration — capture id once, ignore reactive churn afterwards.
	$effect(() => {
		const el = ref;
		if (!el) return;
		return untrack(() =>
			state.registerTag({
				domId,
				value: id,
				el,
				disabled: isTagDisabled,
				textValue: textValue ?? el.textContent?.trim() ?? '',
				isLink: !!href
			})
		);
	});

	// Sync mutable fields without re-registering. Track the reactive inputs
	// in the outer scope, then dispatch the side effect inside `untrack` so
	// updateTag's internal `#tags.map(...)` read doesn't get added to this
	// effect's dep set (which would loop with the `#tags = ...` write).
	$effect(() => {
		const disabled = isTagDisabled;
		const text = textValue ?? ref?.textContent?.trim() ?? '';
		const isLink = !!href;
		untrack(() => state.updateTag(domId, { disabled, textValue: text, isLink }));
	});

	function handleRowClick(event: MouseEvent) {
		if (isTagDisabled) return;
		state.onRowClick(id, event);
	}

	function handleRowKeydown(event: KeyboardEvent) {
		if (isTagDisabled) return;
		state.onRowKeydown(event, id);
	}

	function handleCellKeydown(event: KeyboardEvent, cellId: 'content' | 'remove') {
		if (isTagDisabled) return;
		state.onCellKeydown(event, id, cellId);
	}

	function handleRemoveClick(event: MouseEvent) {
		event.stopPropagation();
		if (isTagDisabled) return;
		state.removeKey(id);
	}
</script>

<div
	bind:this={ref}
	role="row"
	id={domId}
	aria-selected={state.selectionMode !== 'none' && !href ? isSelected : undefined}
	aria-disabled={isTagDisabled || undefined}
	data-spectrum-tag
	data-key={id}
	data-size={state.size}
	data-emphasized={state.isEmphasized || undefined}
	data-selected={isSelected || undefined}
	data-disabled={isTagDisabled || undefined}
	data-focused={isRowFocused || undefined}
	data-allows-removing={state.allowsRemoving || undefined}
	data-selection-mode={state.selectionMode === 'none' ? undefined : state.selectionMode}
	data-link={href ? '' : undefined}
	tabindex={state.getRowTabIndex(domId)}
	class={className}
	onclick={handleRowClick}
	onkeydown={handleRowKeydown}
	onfocus={() => state.onRowFocus(domId)}
	{...restProps}
>
	<div
		role="gridcell"
		data-spectrum-tag-cell-id="content"
		data-spectrum-tag-content
		tabindex={state.getCellTabIndex(id, 'content')}
		onfocus={() => state.onCellFocus(id, 'content')}
		onkeydown={(e) => handleCellKeydown(e, 'content')}
		style="display: contents;"
	>
		<span data-spectrum-tag-content-inner>
			{#if href}
				<a {href} {target} {rel} {download} data-tag-link tabindex="-1" aria-hidden="true"
				></a>
			{/if}
			{#if icon}
				<span data-spectrum-tag-icon>
					{@render icon()}
				</span>
			{/if}
			<span data-spectrum-tag-text>
				{@render children?.()}
			</span>
		</span>
	</div>

	{#if state.allowsRemoving}
		<div
			role="gridcell"
			data-spectrum-tag-cell-id="remove"
			style="display: contents;"
		>
			<button
				type="button"
				id={removeBtnId}
				data-spectrum-tag-remove
				tabindex={state.getCellTabIndex(id, 'remove')}
				disabled={isTagDisabled}
				aria-label="Remove"
				aria-labelledby="{removeBtnId} {domId}"
				onclick={handleRemoveClick}
				onfocus={() => state.onCellFocus(id, 'remove')}
				onkeydown={(e) => handleCellKeydown(e, 'remove')}
			>
				<Icon icon={X} size="xs" />
			</button>
		</div>
	{/if}
</div>

<style>
	[data-spectrum-tag] {
		display: inline-flex;
		align-items: center;
		box-sizing: border-box;
		font-family: inherit;
		border-radius: var(--corner-radius-full);
		background-color: var(--neutral-subtle-background-color-default);
		color: var(--neutral-content-color-default);
		cursor: default;
		user-select: none;
		position: relative;
		transition:
			background-color var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default);
		outline: none;
	}

	/* Focus ring on the row (the focus target in row mode). Without this, the
	   row receives keyboard focus invisibly — users see nothing happen on Tab,
	   so keyboard activation feels broken even when handlers fire correctly. */
	[data-spectrum-tag]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	[data-spectrum-tag][data-link] {
		cursor: pointer;
	}

	/* Sizes — control height, font, padding, and icon scaling. */
	[data-spectrum-tag][data-size='s'] {
		min-height: 20px;
		font-size: var(--text-75);
		--tag-content-padding-inline: var(--spacing-100);
		--tag-icon-size: 14px;
	}
	[data-spectrum-tag][data-size='m'] {
		min-height: 24px;
		font-size: var(--text-100);
		--tag-content-padding-inline: var(--spacing-100);
		--tag-icon-size: 16px;
	}
	[data-spectrum-tag][data-size='l'] {
		min-height: 32px;
		font-size: var(--text-200);
		--tag-content-padding-inline: var(--spacing-200);
		--tag-icon-size: 18px;
	}

	[data-spectrum-tag-content-inner] {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-75);
		padding-inline: var(--tag-content-padding-inline);
		padding-block: 2px;
		outline: none;
	}

	:global(
			[data-spectrum-tag]
				[data-spectrum-tag-cell-id='content']:focus-visible
				[data-spectrum-tag-content-inner]
		) {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: 0;
		border-radius: inherit;
	}

	[data-spectrum-tag-icon] {
		display: inline-flex;
		flex-shrink: 0;
		--icon-size: var(--tag-icon-size);
	}

	[data-tag-link] {
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	[data-spectrum-tag-remove] {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border: none;
		background: transparent;
		color: inherit;
		padding: 2px;
		margin-inline-end: var(--spacing-75);
		cursor: pointer;
		border-radius: var(--corner-radius-full);
		--icon-size: calc(var(--tag-icon-size) - 2px);
		outline: none;
		position: relative;
		z-index: 1;
	}
	[data-spectrum-tag-remove]:hover {
		background-color: color-mix(
			in srgb,
			var(--neutral-content-color-default),
			transparent 80%
		);
	}
	[data-spectrum-tag-remove]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: 1px;
	}

	/* Hover (non-disabled, non-selected) */
	[data-spectrum-tag]:not([data-disabled]):not([data-selected]):hover {
		background-color: var(--neutral-subtle-background-color-hover);
	}

	/* Selected — non-emphasized: neutral filled */
	[data-spectrum-tag][data-selected] {
		background-color: var(--neutral-background-color-default);
		color: white;
	}
	[data-spectrum-tag][data-selected]:not([data-disabled]):hover {
		background-color: var(--neutral-background-color-hover);
	}

	/* Selected — emphasized: accent filled */
	[data-spectrum-tag][data-emphasized][data-selected] {
		background-color: var(--accent-background-color-default);
		color: white;
	}
	[data-spectrum-tag][data-emphasized][data-selected]:not([data-disabled]):hover {
		background-color: var(--accent-background-color-hover);
	}

	/* Disabled */
	[data-spectrum-tag][data-disabled] {
		background-color: var(--disabled-background-color);
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}
	[data-spectrum-tag][data-disabled] [data-spectrum-tag-remove] {
		pointer-events: none;
		color: var(--disabled-content-color);
	}

	/* Forced colors (Windows High Contrast) */
	@media (forced-colors: active) {
		[data-spectrum-tag] {
			border: 1px solid CanvasText;
		}
		[data-spectrum-tag][data-selected] {
			background-color: Highlight;
			color: HighlightText;
		}
	}
</style>
