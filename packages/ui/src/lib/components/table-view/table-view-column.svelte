<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { ColumnDescriptor } from './state/collection.js';
	import { getTableContext } from './state/context.js';
	import { Icon, ArrowUpWideNarrow, ArrowDownNarrowWide } from '../icon/index.js';
	import ColumnMenu from './column-menu.svelte';
	import ColumnResizer from './column-resizer.svelte';

	// Internal render unit for one entry of `<TableView.Header columns>`. It
	// owns no order and registers no descriptor — Header supplies both — so the
	// `<th>` sequence and the column list cannot drift apart.
	let { column, content }: { column: ColumnDescriptor; content?: Snippet<[ColumnDescriptor]> } =
		$props();

	const tableState = getTableContext();
	let ref: HTMLTableCellElement | null = $state(null);

	const id = $derived(column.id);
	const align = $derived(column.align);
	const allowsSorting = $derived(column.allowsSorting === true);
	const allowsResizing = $derived(column.allowsResizing === true);

	// Anchor name used by the column-menu chevron's filter popover. Lives on
	// the `<th>` so the popover positions relative to the header rather than
	// the (much smaller) chevron button — matches what users expect from
	// "filter this column" affordances. Names must be unique and `--`-prefixed
	// per the CSS anchor positioning spec.
	const filterAnchor = $derived(`--ssp-tableview-col-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`);

	// Column-header element registry — drives 2D nav (ArrowDown into first
	// row at this column, ArrowLeft/Right between headers).
	$effect(() => {
		const el = ref;
		const owned = id;
		if (!el) return;
		return untrack(() => tableState.registerColumnHeader(owned, el));
	});

	const sortDirection = $derived(tableState.sortDirectionFor(id));
	const ariaSort = $derived(
		sortDirection === 'ascending'
			? 'ascending'
			: sortDirection === 'descending'
				? 'descending'
				: allowsSorting
					? 'none'
					: undefined
	);

	const isHidden = $derived(tableState.isColumnHidden(id));
	const keyboardTarget = $derived(tableState.keyboardTarget);
	const isHeaderFocused = $derived(
		keyboardTarget?.type === 'columnheader' && keyboardTarget.columnId === id
	);
	const ariaColIndex = $derived(tableState.navColumns.indexOf(id) + 1);
	const allowsFiltering = $derived(column.filterType !== undefined);
	const isFiltered = $derived(tableState.hasFilter(id));
	// RS parity: sort alone doesn't justify a menu — the header click already
	// toggles sort. The chevron only appears when there are menu-driven
	// actions (hide / filter / resize) that have no other affordance.
	// Sort items are still rendered *inside* the menu when both apply, so
	// "Clear sort" stays reachable on a column that's also hideable/filterable.
	// A hidden header has no visible affordances, so it renders none: an
	// off-screen menu trigger or resize handle is a focus stop the user cannot
	// see. Column names stay in the accessibility tree either way.
	const isHeaderVisible = $derived(!tableState.hideHeader);
	const hasMenu = $derived(
		isHeaderVisible && (column.allowsHiding === true || allowsFiltering || allowsResizing)
	);

	function handleClick(e: MouseEvent) {
		// Menu / filter popovers render in the top layer but are still DOM
		// descendants of this `<th>`, so clicks inside them bubble up here.
		// Without this guard, picking "Sort descending" from the menu fires
		// our own toggleSort right after MenuItem's handler — flipping the
		// direction the user just chose.
		// TODO: lift this into Menu.MenuItem (stopPropagation on activation)
		// so every consumer doesn't need to defend against it individually.
		if ((e.target as Element | null)?.closest?.('[popover]')) return;
		tableState.toggleSort(id);
	}

	function handleKeydown(e: KeyboardEvent) {
		// Only react to keys aimed at the header itself; descendants (the
		// column-menu trigger) own their own behavior.
		if (e.target !== e.currentTarget) return;
		tableState.handleColumnHeaderKeyDown(e, id);
	}
</script>

{#if !isHidden}
	<th
		bind:this={ref}
		id={tableState.columnHeaderId(id)}
		role="columnheader"
		data-spectrum-table-view-column
		data-align={align ?? undefined}
		data-sortable={allowsSorting || undefined}
		data-sort-direction={sortDirection || undefined}
		data-show-divider={column.showDivider || undefined}
		data-focused={isHeaderFocused || undefined}
		data-filtered={isFiltered || undefined}
		aria-sort={ariaSort}
		aria-colindex={ariaColIndex}
		{...allowsSorting ? { 'aria-description': 'sortable column' } : {}}
		tabindex={isHeaderFocused ? 0 : -1}
		onfocus={() => tableState.setColumnHeaderFocus(id)}
		onclick={allowsSorting && isHeaderVisible ? handleClick : undefined}
		onkeydown={handleKeydown}
		style="anchor-name: {filterAnchor};"
	>
		<div data-spectrum-table-view-column-content data-align={align ?? undefined}>
			{#if sortDirection === 'ascending'}
				<Icon icon={ArrowUpWideNarrow} size="s" class="spectrum-table-view-sort-icon" />
			{:else if sortDirection === 'descending'}
				<Icon icon={ArrowDownNarrowWide} size="s" class="spectrum-table-view-sort-icon" />
			{/if}
			<span data-spectrum-table-view-column-text>
				{#if content}{@render content(column)}{:else}{column.label}{/if}
			</span>
			{#if isFiltered}
				<!-- Filter-active dot. Visible regardless of menu — when filtering is
				     driven externally (controlled `columnFilters` without a column
				     menu) the indicator still surfaces the state. -->
				<span data-spectrum-table-view-column-filter-dot aria-hidden="true"></span>
			{/if}
			{#if hasMenu}
				<ColumnMenu columnId={id} {align} {filterAnchor} />
			{/if}
		</div>
		{#if allowsResizing && isHeaderVisible}
			<ColumnResizer columnId={id} />
		{/if}
	</th>
{/if}

<style>
	/* S2 column header: paddingX=16 (= --spacing-300), no paddingY (vertically
	   centered via flex in S2; we use vertical-align: middle since this is a
	   real <th>). Same font-size as cells, differentiated by font-weight. */
	[data-spectrum-table-view-column] {
		box-sizing: border-box;
		height: inherit;
		padding-inline: var(--spacing-300);
		padding-block: 0;
		font-weight: bold;
		font-size: var(--table-view-font-size);
		color: var(--neutral-content-color-default);
		text-align: start;
		vertical-align: middle;
		white-space: nowrap;
		user-select: none;
		position: relative;
		/* Focusable in cell-mode (`tabindex=0` when this is the focused header).
		   Suppress UA outline; we paint our own `:focus-visible` ring below. */
		outline: none;
	}

	[data-spectrum-table-view-column][data-sortable] {
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	[data-spectrum-table-view-column][data-sortable]:hover {
		color: var(--neutral-content-color-hover);
	}

	[data-spectrum-table-view-column][data-show-divider] {
		border-right: 1px solid var(--gray-300);
	}

	[data-spectrum-table-view-column-content] {
		display: flex;
		align-items: center;
		width: 100%;
		min-width: 0;
	}

	[data-spectrum-table-view-column-content][data-align='center'] {
		justify-content: center;
	}

	[data-spectrum-table-view-column-content][data-align='end'] {
		justify-content: flex-end;
	}

	[data-spectrum-table-view-column-text] {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
		flex: 0 1 auto;
	}

	[data-spectrum-table-view-column-content] > :global(.spectrum-table-view-sort-icon) {
		flex-shrink: 0;
		margin-inline-end: var(--spacing-75);
	}

	/* Column menu trigger: lives at the inline-end of the header label.
	   `margin-inline-start: auto` pushes it to the cell edge for `start` /
	   `center` aligned columns; for `end` aligned columns the chevron sits
	   directly after the label (no auto margin needed because justify-content
	   is already flex-end). The trigger sits above the header's own click
	   target — its onclick stops propagation so opening the menu doesn't also
	   toggle sort. */
	[data-spectrum-table-view-column-content]
		> :global([data-spectrum-table-view-column-menu-trigger]) {
		flex-shrink: 0;
		margin-inline-start: var(--spacing-75);
	}
	[data-spectrum-table-view-column-content]:not([data-align='end'])
		> :global([data-spectrum-table-view-column-menu-trigger]) {
		margin-inline-start: auto;
	}

	/* Filter-active indicator. Sits inline-end of the label, before the
	   chevron, so a filtered column reads at a glance even when the menu
	   trigger is closed. The dot is purely decorative; SR users learn the
	   state from `aria-pressed` on the Filter… menu item once they open the
	   menu. */
	[data-spectrum-table-view-column-filter-dot] {
		flex-shrink: 0;
		width: 6px;
		height: 6px;
		margin-inline-start: var(--spacing-100);
		border-radius: 50%;
		background-color: var(--accent-background-color-default);
	}
	[data-spectrum-table-view-column-content]:not([data-align='end'])
		> [data-spectrum-table-view-column-filter-dot] {
		margin-inline-start: auto;
	}
	/* When both the dot and the chevron exist, push only the dot to the end —
	   the chevron then follows it with the regular gap. */
	[data-spectrum-table-view-column-content]:not([data-align='end'])
		> [data-spectrum-table-view-column-filter-dot]
		~ :global([data-spectrum-table-view-column-menu-trigger]) {
		margin-inline-start: var(--spacing-75);
	}
</style>
