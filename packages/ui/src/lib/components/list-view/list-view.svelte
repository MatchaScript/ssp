<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { ListViewProps } from './types.js';
	import { ListViewState, setListViewContext } from './list-view.svelte.js';
	import { ProgressCircle } from '../progress-circle/index.js';

	let {
		selectionMode = 'none',
		selectionStyle = 'checkbox',
		selectedKeys = $bindable(undefined),
		defaultSelectedKeys,
		onSelectionChange,
		disabledKeys = new Set<string>(),
		density = 'regular',
		isQuiet = false,
		isDisabled = false,
		onAction,
		renderEmptyState,
		isLoading = false,
		isLoadingMore = false,
		onLoadMore,
		children,
		class: className,
		...restProps
	}: ListViewProps = $props();

	// defaultSelectedKeys is intentionally captured once — it sets initial uncontrolled state
	// svelte-ignore state_referenced_locally
	let internalSelectedKeys = new SvelteSet<string>(defaultSelectedKeys ?? []);
	let effectiveSelectedKeys = $derived(selectedKeys ?? internalSelectedKeys);

	function commitSelection(keys: Set<string>) {
		internalSelectedKeys.clear();
		for (const k of keys) internalSelectedKeys.add(k);
		selectedKeys = new SvelteSet(keys);
		onSelectionChange?.(new SvelteSet(keys));
	}

	let listViewState = new ListViewState({
		get selectionMode() {
			return selectionMode;
		},
		get selectionStyle() {
			return selectionStyle;
		},
		get selectedKeys() {
			return effectiveSelectedKeys;
		},
		get disabledKeys() {
			return disabledKeys;
		},
		get density() {
			return density;
		},
		get isQuiet() {
			return isQuiet;
		},
		get isDisabled() {
			return isDisabled;
		},
		get onAction() {
			return onAction;
		},
		onSelectionChange: commitSelection
	});

	setListViewContext(listViewState);

	function handleScroll(e: Event) {
		if (!isLoadingMore && onLoadMore) {
			const el = e.target as HTMLElement;
			const threshold = 50;
			if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
				onLoadMore();
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isDisabled) return;
		listViewState.handleKeyDown(e);
	}

	function handleFocusIn() {
		// First Tab into the list places roving focus on the first enabled item
		// when nothing is yet highlighted.
		if (listViewState.highlightedId === null) {
			listViewState.focusFirst({ focusVisible: true });
		}
	}
</script>

<div
	role="grid"
	aria-multiselectable={selectionMode === 'multiple' || undefined}
	aria-disabled={isDisabled || undefined}
	data-spectrum-list-view
	data-density={density}
	data-quiet={isQuiet || undefined}
	data-disabled={isDisabled || undefined}
	data-selection-mode={selectionMode}
	data-selection-style={selectionStyle}
	data-empty={!children && !isLoading ? '' : undefined}
	class={className}
	tabindex={isDisabled ? -1 : 0}
	onkeydown={handleKeydown}
	onscroll={handleScroll}
	onfocusin={handleFocusIn}
	{...restProps}
>
	{#if isLoading}
		<div data-spectrum-list-view-loader role="row" aria-rowindex={1}>
			<div role="gridcell">
				<ProgressCircle isIndeterminate={true} size="s" />
			</div>
		</div>
	{:else if children}
		{@render children()}
	{:else if renderEmptyState}
		<div data-spectrum-list-view-empty-state role="row" aria-rowindex={1}>
			<div role="gridcell">
				{@render renderEmptyState()}
			</div>
		</div>
	{/if}

	{#if isLoadingMore}
		<div data-spectrum-list-view-loader data-loading-more role="row">
			<div role="gridcell">
				<ProgressCircle isIndeterminate={true} size="s" />
			</div>
		</div>
	{/if}
</div>

<style>
	[data-spectrum-list-view] {
		display: grid;
		grid-template-columns: 1fr;
		box-sizing: border-box;
		font-family: inherit;
		overflow: auto;
		outline: none;
		border: 1px solid var(--gray-300);
		border-radius: var(--corner-radius-medium-default);
		background-color: var(--background-base-color);
	}

	[data-spectrum-list-view]:focus-visible {
		outline: 2px solid var(--focus-indicator-color);
		outline-offset: -2px;
	}

	[data-spectrum-list-view][data-quiet] {
		border: none;
		border-radius: 0;
		background-color: transparent;
	}

	[data-spectrum-list-view][data-disabled] {
		opacity: var(--opacity-disabled);
		pointer-events: none;
	}

	/* Loading states */
	[data-spectrum-list-view-loader] {
		display: grid;
		place-items: center;
		padding-block: var(--spacing-400);
	}

	[data-spectrum-list-view-loader][data-loading-more] {
		padding-block: var(--spacing-200);
	}

	/* Empty state */
	[data-spectrum-list-view-empty-state] {
		display: grid;
		place-items: center;
		padding: var(--spacing-600);
		color: var(--neutral-subdued-content-color-default);
		font-size: var(--text-100);
	}
</style>
