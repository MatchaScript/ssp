<script lang="ts">
	import { untrack } from 'svelte';
	import type { TableViewCellProps } from './types.js';
	import { getRowContext, getTableContext } from './state/context.js';

	let { column: explicitColumnId, children }: TableViewCellProps = $props();

	const tableState = getTableContext();
	const row = getRowContext();

	// Markup-order column resolution. The closure increments per row instance,
	// so each cell gets its source-order index. An explicit `column="id"` prop
	// overrides this for cases where the consumer wants to skip / reorder cells.
	const cellIndex = row.getNextCellIndex();

	const column = $derived(
		explicitColumnId
			? tableState.columns.find((c) => c.id === explicitColumnId)
			: tableState.columns[cellIndex]
	);
	const columnId = $derived(column?.id);
	const isRowHeader = $derived(column?.isRowHeader === true);
	// Phase 6: when the column is hidden we skip rendering the `<td>` entirely.
	// Cells stay in markup order — the resolved column lookup uses the full
	// (markup-order) `tableState.columns`, so subsequent visible cells keep
	// pointing at the right column even when one in the middle is hidden.
	const isHidden = $derived(columnId ? tableState.isColumnHidden(columnId) : false);
	// Deterministic cell id, kept in sync with the pattern Row uses to
	// compute its `aria-labelledby`. Falling back to the markup-order index
	// when the column hasn't registered yet keeps the id non-empty during
	// the brief mount window.
	const cellDomId = $derived(`${row.rowDomId}-cell-${columnId ?? cellIndex}`);
	// Stretched-link is hosted in the rowheader cell only, even if the row
	// has multiple isRowHeader columns we use the first one we encounter.
	const isLink = $derived(isRowHeader && row.href !== undefined);
	// Cast at usage — `download` is typed as string | boolean for ergonomics
	// but the DOM attribute spec is "presence + optional string filename".
	const downloadAttr = $derived(
		row.download === true ? '' : typeof row.download === 'string' ? row.download : undefined
	);

	// ── cell-mode focus integration ─────────────────────────────
	// Each <Cell> registers its element so the keyboard delegate can move
	// focus by `(rowKey, columnId)` without DOM walking. The registration
	// stays put while the column id is stable; if the consumer re-orders or
	// re-keys columns, the $effect cleanup tears down the old slot first.
	let ref: HTMLTableCellElement | null = $state(null);
	$effect(() => {
		const el = ref;
		if (!el || !columnId) return;
		const cleanup = untrack(() => tableState.registerCell(row.rowKey, columnId, el));
		return cleanup;
	});

	const isCellFocused = $derived(columnId ? tableState.isCellFocused(row.rowKey, columnId) : false);
	// Leading-cell marker: when there's no checkbox column, the very first cell
	// of each row is the row's leading edge — render the row focus indicator
	// inside it. With a checkbox column the indicator lives inside that td
	// (see `<TableView.Row>`), so we skip it here to avoid duplicates.
	const isLeadingCell = $derived(cellIndex === 0 && tableState.selectionMode === 'none');
	// `aria-colindex` (Phase 6) is computed against the *visible* column set,
	// matching W3C ARIA APG semantics. Hidden columns drop out — both because
	// they're not in the DOM and so AT correctly reports "column N of M".
	// Selection-mode tables prepend a checkbox column (col 1), so cells start
	// at col 2 in that case.
	const ariaColIndex = $derived(
		columnId
			? (tableState.selectionMode === 'none' ? 1 : 2) + tableState.visibleColumnIndex(columnId)
			: 0
	);

	function handleKeydown(e: KeyboardEvent) {
		if (!columnId) return;
		// Bubbles from cell descendants (Button / TextField inside a cell) must
		// not drive grid navigation; only keys fired *on* the cell itself do.
		if (e.target !== e.currentTarget) return;
		tableState.handleCellKeyDown(e, row.rowKey, columnId);
	}
</script>

{#if isHidden}
	<!-- Hidden via Column Menu (Phase 6). Skipping the `<td>` entirely keeps
	     the table layout collapsed — `<colgroup>` would still need explicit
	     coordination here once Phase 7 ships fixed widths. -->
{:else if isRowHeader}
	<th
		bind:this={ref}
		id={cellDomId}
		scope="row"
		role="rowheader"
		data-spectrum-table-view-cell
		data-row-header
		data-align={column?.align ?? undefined}
		data-show-divider={column?.showDivider || undefined}
		data-overflow={tableState.overflowMode}
		data-focused={isCellFocused || undefined}
		aria-colindex={ariaColIndex}
		tabindex={isCellFocused ? 0 : -1}
		onkeydown={handleKeydown}
	>
		{#if isLeadingCell}
			<span data-spectrum-table-view-row-focus-indicator aria-hidden="true"></span>
		{/if}
		{#if isLink}
			<!-- Stretched row-link: visually inline with the rowheader text, but
			     `::after` covers the entire `<tr>` so click / cmd+click /
			     middle-click / right-click context menu / keyboard Enter /
			     SvelteKit nav all flow through this `<a>`. tabindex=-1: the row
			     itself is the keyboard target; Enter on the row dispatches a
			     click on this anchor. -->
			<a
				href={row.href}
				target={row.target}
				rel={row.rel}
				download={downloadAttr}
				data-row-link
				data-spectrum-table-view-row-link
				tabindex={-1}
				aria-label={row.textValue || undefined}
			>
				{@render children()}
			</a>
		{:else}
			{@render children()}
		{/if}
	</th>
{:else}
	<td
		bind:this={ref}
		id={cellDomId}
		role="gridcell"
		data-spectrum-table-view-cell
		data-align={column?.align ?? undefined}
		data-show-divider={column?.showDivider || undefined}
		data-overflow={tableState.overflowMode}
		data-focused={isCellFocused || undefined}
		aria-colindex={ariaColIndex}
		tabindex={isCellFocused ? 0 : -1}
		onkeydown={handleKeydown}
	>
		{#if isLeadingCell}
			<span data-spectrum-table-view-row-focus-indicator aria-hidden="true"></span>
		{/if}
		{@render children()}
	</td>
{/if}

<style>
	/* S2: paddingX=16 (table-edge-to-content) is constant across densities; row
	   height is controlled by <tr height> alone. No padding-block. In this
	   project --spacing-300 resolves to 16px (verified against core/tokens/). */
	[data-spectrum-table-view-cell] {
		box-sizing: border-box;
		padding-inline: var(--spacing-300);
		padding-block: 0;
		font-size: var(--table-view-font-size);
		/* S2: cells use --rowTextColor (neutral-subdued by default, neutral when
		   selected) set by the parent <tr>. Fallback keeps things safe if a cell
		   is ever rendered outside a TableView.Row. */
		color: var(--_row-text-color, var(--neutral-content-color-default));
		vertical-align: middle;
		text-align: start;
		font-weight: normal;
		/* Cell-mode focus target: tabindex=0 on the focused cell, -1 elsewhere.
		   Suppress the UA outline; we paint our own focus-visible ring below. */
		outline: none;
		/* Establish a positioning context so the cell-mode focus ring (and
		   future absolutely positioned cell content) anchors here. */
		position: relative;
	}

	/* row header has the same baseline appearance as a regular cell */
	[data-spectrum-table-view-cell][data-row-header] {
		font-weight: inherit;
	}

	[data-spectrum-table-view-cell][data-align='start'] {
		text-align: start;
	}
	[data-spectrum-table-view-cell][data-align='center'] {
		text-align: center;
	}
	[data-spectrum-table-view-cell][data-align='end'] {
		text-align: end;
	}

	/* Column divider */
	[data-spectrum-table-view-cell][data-show-divider] {
		border-right: 1px solid var(--gray-300);
	}

	/* Overflow: truncate */
	[data-spectrum-table-view-cell][data-overflow='truncate'] {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 0;
	}

	/* Overflow: wrap */
	[data-spectrum-table-view-cell][data-overflow='wrap'] {
		white-space: normal;
		word-break: break-word;
	}

	/* ── Stretched row link ────────────────────────────────────
	   The `<a>` itself sits inline with the rowheader text. Its `::after`
	   pseudo-element is absolutely positioned against the nearest positioned
	   ancestor (`<tr>` carries `position: relative`), spanning the entire row.
	   That makes the whole row a real link target: native context menu (Open
	   in New Tab / Copy Link), middle-click, hover preview, link extensions,
	   and SvelteKit's `data-sveltekit-*` semantics all just work. */
	[data-spectrum-table-view-row-link] {
		color: inherit;
		text-decoration: none;
		outline: none; /* row owns the focus ring */
	}
	[data-spectrum-table-view-row-link]::after {
		content: '';
		position: absolute;
		inset: 0;
		/* Sit below interactive descendants (which get z-index: 1) but above
		   the row's background. */
		z-index: 0;
	}
</style>
