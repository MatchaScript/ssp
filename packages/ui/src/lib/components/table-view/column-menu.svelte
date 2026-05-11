<script lang="ts">
	import {
		Icon,
		ArrowUpWideNarrow,
		ArrowDownNarrowWide,
		ChevronDown,
		EyeOff,
		Filter,
		FilterX,
		XCircle
	} from '../icon/index.js';
	import { ActionButton } from '../action-button/index.js';
	import * as Menu from '../menu/index.js';
	import { getTableContext } from './state/context.js';
	import ColumnFilter from './column-filter.svelte';

	// Per-column dropdown anchored to the column header. Mirrors S2's
	// `ColumnWithMenu` in spirit — a single menu surface that consolidates
	// sort / hide / filter / (Phase 7: resize) — but built from the SSP Menu
	// primitive so we get keyboard nav / focus management for free.
	//
	// Visibility rule: the trigger is shown only when the column has at least
	// one menu-driven feature enabled (`allowsSorting`, `allowsHiding`, or
	// `filterType`). Columns with no menu features stay clean — no chevron
	// clutter.
	let {
		columnId,
		align,
		filterAnchor
	}: {
		columnId: string;
		align?: 'start' | 'center' | 'end';
		filterAnchor: string;
	} = $props();

	const tableState = getTableContext();
	const column = $derived(tableState.getColumn(columnId));
	const sortDirection = $derived(tableState.sortDirectionFor(columnId));
	const hasSort = $derived(column?.allowsSorting === true);
	const canHide = $derived(column?.allowsHiding === true);
	const canFilter = $derived(column?.filterType !== undefined);
	const hasFilter = $derived(tableState.hasFilter(columnId));

	let filterOpen = $state(false);

	// Note: we deliberately do NOT mark the active sort direction with
	// `selectionMode='single' + selectedKeys` (S2 doesn't either — current sort
	// is conveyed by the arrow icon in the column header, not by a checkmark
	// in the menu). Using single-mode selection here also fights with our
	// derived `selectedKeys` since the Menu writes to its own bindable on
	// click, leaving the menu in a stale state on subsequent opens.

	function handleAction(itemId: string) {
		switch (itemId) {
			case 'sort-asc':
				tableState.setSortDescriptor({ column: columnId, direction: 'ascending' });
				return;
			case 'sort-desc':
				tableState.setSortDescriptor({ column: columnId, direction: 'descending' });
				return;
			case 'sort-clear':
				tableState.setSortDescriptor(undefined);
				return;
			case 'filter':
				// Defer one tick so the menu's own click-outside detection
				// doesn't immediately close the popover we're about to open.
				queueMicrotask(() => {
					filterOpen = true;
				});
				return;
			case 'filter-clear': {
				const wasFiltered = tableState.hasFilter(columnId);
				tableState.clearFilter(columnId);
				if (wasFiltered) tableState.announceFilterChange(columnId, false);
				return;
			}
			case 'hide':
				tableState.hideColumn(columnId);
				return;
		}
	}
</script>

<Menu.MenuTrigger>
	{#snippet trigger({ triggerProps })}
		<ActionButton
			{...triggerProps}
			isQuiet
			size="s"
			data-spectrum-table-view-column-menu-trigger
			aria-label="Column menu"
			onclick={(e: MouseEvent) => {
				// Header click toggles sort; the menu trigger lives inside the
				// header so its click would bubble up and re-toggle. Stop early
				// so the menu opens cleanly without a phantom sort flip.
				e.stopPropagation();
				(triggerProps.onclick as ((event: MouseEvent) => void) | undefined)?.(e);
			}}
			onkeydown={(e: KeyboardEvent) => {
				// Same story for keyboard activation: the column header captures
				// Enter / Space to toggle sort; let the menu trigger own those.
				if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
				(triggerProps.onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(e);
			}}
		>
			<Icon icon={ChevronDown} size="s" />
		</ActionButton>
	{/snippet}
	<Menu.Menu size="s" onAction={handleAction} data-popover-align={align ?? 'start'}>
		{#if hasSort}
			<Menu.MenuItem id="sort-asc">
				{#snippet icon()}<Icon icon={ArrowUpWideNarrow} size="s" />{/snippet}
				Sort ascending
			</Menu.MenuItem>
			<Menu.MenuItem id="sort-desc">
				{#snippet icon()}<Icon icon={ArrowDownNarrowWide} size="s" />{/snippet}
				Sort descending
			</Menu.MenuItem>
			{#if sortDirection}
				<Menu.MenuItem id="sort-clear">
					{#snippet icon()}<Icon icon={XCircle} size="s" />{/snippet}
					Clear sort
				</Menu.MenuItem>
			{/if}
		{/if}
		{#if hasSort && canFilter}
			<Menu.MenuDivider />
		{/if}
		{#if canFilter}
			<Menu.MenuItem id="filter">
				{#snippet icon()}<Icon icon={Filter} size="s" />{/snippet}
				{hasFilter ? 'Edit filter…' : 'Filter…'}
			</Menu.MenuItem>
			{#if hasFilter}
				<Menu.MenuItem id="filter-clear">
					{#snippet icon()}<Icon icon={FilterX} size="s" />{/snippet}
					Clear filter
				</Menu.MenuItem>
			{/if}
		{/if}
		{#if (hasSort || canFilter) && canHide}
			<Menu.MenuDivider />
		{/if}
		{#if canHide}
			<Menu.MenuItem id="hide">
				{#snippet icon()}<Icon icon={EyeOff} size="s" />{/snippet}
				Hide column
			</Menu.MenuItem>
		{/if}
	</Menu.Menu>
</Menu.MenuTrigger>

{#if canFilter}
	<ColumnFilter {columnId} anchorName={filterAnchor} bind:open={filterOpen} />
{/if}
