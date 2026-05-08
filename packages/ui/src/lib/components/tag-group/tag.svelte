<script lang="ts">
	import { untrack } from 'svelte';
	import { getTagGroupContext } from './tag-group.svelte.js';
	import type { TagItemProps } from './types.js';
	import { ClearButton } from '../clear-button/index.js';

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

	// Activation keys (Enter/Space) and printable typeahead are owned by
	// whichever element inside the row currently has focus. When the user has
	// tabbed onto the ClearButton, Enter/Space must activate the button (not
	// re-toggle row selection); same row receives the keydown via bubble, so
	// we filter out those keys when the row isn't itself the event target.
	// Navigation / removal / Escape / Ctrl+A still apply uniformly so the user
	// can keep arrowing or hit Delete from either focus point.
	const ROW_OWNED_KEYS_FROM_DESCENDANT = new Set([
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Home',
		'End',
		'Delete',
		'Backspace',
		'Escape'
	]);

	function handleRowKeydown(event: KeyboardEvent) {
		if (isTagDisabled) return;
		const isOnRow = event.target === event.currentTarget;
		if (!isOnRow) {
			const isCtrlA = (event.ctrlKey || event.metaKey) && /^a$/i.test(event.key);
			if (!ROW_OWNED_KEYS_FROM_DESCENDANT.has(event.key) && !isCtrlA) return;
		}
		state.onRowKeydown(event, id);
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
	<div role="gridcell" data-spectrum-tag-content style="display: contents;">
		<span data-spectrum-tag-content-inner>
			{#if href}
				<a {href} {target} {rel} {download} data-tag-link tabindex="-1" aria-hidden="true"></a>
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
		<div role="gridcell" style="display: contents;">
			<!--
				Tabindex mirrors the row's roving stop. When the row is the current
				tab stop, the X is too — so a Tab keystroke advances naturally from
				the row into its X via the browser's native focus walk, and a
				second Tab leaves the group. Focus on the X also drives the row's
				highlight via onfocus, keeping the roving anchor in sync.
			-->
			<ClearButton
				id={removeBtnId}
				size={state.size}
				isDisabled={isTagDisabled}
				tabindex={state.getRowTabIndex(domId)}
				aria-label="Remove"
				aria-labelledby="{removeBtnId} {domId}"
				onclick={handleRemoveClick}
				onfocus={() => state.onRowFocus(domId)}
			/>
		</div>
	{/if}
</div>

<style>
	/* Mirrors React-Spectrum S2 `tagStyles` (control({shape:'default', icon:true})):
	   round-rect (not pill), height-relative paddings, gray-100 / gray-200 hover,
	   neutral-filled selected, accent-filled emphasized+selected. */
	[data-spectrum-tag] {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		font-family: inherit;
		vertical-align: middle;
		max-width: 100%;
		height: var(--tag-height);
		min-width: var(--tag-height);
		border-radius: var(--tag-border-radius);
		background-color: var(--gray-100);
		color: var(--neutral-content-color-default);
		cursor: default;
		user-select: none;
		position: relative;
		outline: none;
		transition:
			background-color var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default);
	}

	/* Sizes — height drives padding (edge-to-text = height * 3/8) and border-radius. */
	[data-spectrum-tag][data-size='s'] {
		--tag-height: var(--spacing-400);
		--tag-border-radius: var(--corner-radius-medium-size-small);
		font-size: var(--text-75);
	}
	[data-spectrum-tag][data-size='m'] {
		--tag-height: var(--spacing-500);
		--tag-border-radius: var(--corner-radius-medium-size-medium);
		font-size: var(--text-100);
	}
	[data-spectrum-tag][data-size='l'] {
		--tag-height: var(--spacing-600);
		--tag-border-radius: var(--corner-radius-medium-size-large);
		font-size: var(--text-200);
	}

	[data-spectrum-tag][data-link] {
		cursor: pointer;
	}

	/* Row focus ring (row-mode focus target). */
	[data-spectrum-tag]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	/* Hover / focus-visible — S2 maps both to gray-200 on the unselected tag. */
	[data-spectrum-tag]:not([data-disabled]):not([data-selected]):hover,
	[data-spectrum-tag]:not([data-disabled]):not([data-selected]):focus-visible,
	[data-spectrum-tag]:not([data-disabled]):not([data-selected]):has(:focus-visible) {
		background-color: var(--gray-200);
		color: var(--neutral-content-color-hover);
	}

	[data-spectrum-tag-content-inner] {
		display: inline-flex;
		align-items: center;
		min-width: 0;
		gap: calc(var(--tag-height) * 0.1875); /* S2 text-to-visual ≈ fontRelative(6) */
		padding-inline: calc(var(--tag-height) * 3 / 8); /* S2 edge-to-text */
		outline: none;
	}
	/* When the X cell is present, the row reserves trailing space via the remove
	   button's own margin (matches S2 `paddingEnd: 0, allowsRemoving`). */
	[data-spectrum-tag][data-allows-removing] [data-spectrum-tag-content-inner] {
		padding-inline-end: 0;
	}

	[data-spectrum-tag-text] {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Cell-mode focus ring on the content cell. */
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
		--icon-size: 1.43em; /* S2 fontRelative(20) */
	}

	[data-tag-link] {
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	/* Slot the ClearButton inside the row's trailing space. z-index lifts it
	   above the stretched-link anchor so it remains clickable on link tags. */
	[data-spectrum-tag] :global([data-spectrum-clear-button]) {
		margin-inline-end: calc(var(--tag-height) * 3 / 16);
		position: relative;
		z-index: 1;
	}

	/* Selected — non-emphasized: neutral filled (S2 baseColor('neutral')). */
	[data-spectrum-tag][data-selected] {
		background-color: var(--neutral-background-color-selected-default);
		color: var(--background-base-color);
	}
	[data-spectrum-tag][data-selected]:not([data-disabled]):hover,
	[data-spectrum-tag][data-selected]:not([data-disabled]):focus-visible,
	[data-spectrum-tag][data-selected]:not([data-disabled]):has(:focus-visible) {
		background-color: var(--neutral-background-color-selected-hover);
	}

	/* Selected — emphasized: accent filled. */
	[data-spectrum-tag][data-emphasized][data-selected] {
		background-color: var(--accent-background-color-default);
		color: white;
	}
	[data-spectrum-tag][data-emphasized][data-selected]:not([data-disabled]):hover,
	[data-spectrum-tag][data-emphasized][data-selected]:not([data-disabled]):focus-visible,
	[data-spectrum-tag][data-emphasized][data-selected]:not([data-disabled]):has(:focus-visible) {
		background-color: var(--accent-background-color-hover);
	}

	/* Disabled */
	[data-spectrum-tag][data-disabled] {
		background-color: var(--disabled-background-color);
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}

	/* Forced colors (Windows High Contrast) */
	@media (forced-colors: active) {
		[data-spectrum-tag] {
			border: 1px solid CanvasText;
			background-color: ButtonFace;
			color: ButtonText;
		}
		[data-spectrum-tag][data-selected] {
			background-color: Highlight;
			color: HighlightText;
		}
		[data-spectrum-tag][data-disabled] {
			color: GrayText;
		}
	}
</style>
