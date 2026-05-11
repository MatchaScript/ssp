<script lang="ts" generics="TData">
	import type { ColumnFilter, SortDescriptor, TableViewRootProps } from './types.js';
	import { TableState } from './state/table-state.svelte.js';
	import { setTableContext } from './state/context.js';
	import { ProgressCircle } from '../progress-circle/index.js';

	const EMPTY_KEY_SET: ReadonlySet<string> = new Set();
	const EMPTY_FILTERS: readonly ColumnFilter[] = [];
	const toKeySet = (it: Iterable<string>): ReadonlySet<string> =>
		it instanceof Set ? it : new Set(it);

	let {
		density = 'regular',
		isQuiet = false,
		overflowMode = 'truncate',
		isDisabled = false,
		disabledKeys,
		selectionMode = 'none',
		selectedKeys,
		defaultSelectedKeys,
		onSelectionChange,
		disallowEmptySelection = false,
		sortDescriptor,
		defaultSortDescriptor,
		onSortChange,
		hiddenColumns,
		defaultHiddenColumns,
		onHiddenColumnsChange,
		columnFilters,
		defaultColumnFilters,
		onColumnFiltersChange,
		onAction,
		renderEmptyState,
		loadingState = 'idle',
		onLoadMore,
		class: className,
		children,
		...restProps
	}: TableViewRootProps = $props();

	// ── Controlled vs uncontrolled — lock-in pattern ─────────────
	// Once consumer passes a defined `selectedKeys` / `sortDescriptor`, the
	// component is permanently controlled for the rest of its lifetime.
	// Without the lock, the state cycle (e.g. sort: asc → desc → undefined)
	// flips back to uncontrolled on the third click and the effective value
	// falls back to a stale `internal*`. Consumers that need the component to
	// behave as controlled from the start should pass a defined initial value
	// (e.g. `selectedKeys={new Set()}`) — `defaultSelectedKeys` keeps it
	// uncontrolled.

	// ── Selection ────────────────────────────────────────────────
	// svelte-ignore state_referenced_locally
	let internalSelectedKeys = $state<ReadonlySet<string>>(toKeySet(defaultSelectedKeys ?? []));
	// svelte-ignore state_referenced_locally
	let isSelectionControlled = $state(selectedKeys !== undefined);
	$effect(() => {
		if (selectedKeys !== undefined) isSelectionControlled = true;
	});
	const effectiveSelectedKeys = $derived(
		isSelectionControlled
			? selectedKeys === undefined
				? EMPTY_KEY_SET
				: toKeySet(selectedKeys)
			: internalSelectedKeys
	);
	function setSelectedKeys(next: Set<string>) {
		if (!isSelectionControlled) internalSelectedKeys = next;
		onSelectionChange?.(next);
	}

	// ── Sort ─────────────────────────────────────────────────────
	// svelte-ignore state_referenced_locally
	let internalSortDescriptor = $state<SortDescriptor | undefined>(defaultSortDescriptor);
	// svelte-ignore state_referenced_locally
	let isSortControlled = $state(sortDescriptor !== undefined);
	$effect(() => {
		if (sortDescriptor !== undefined) isSortControlled = true;
	});
	const effectiveSortDescriptor = $derived(
		isSortControlled ? sortDescriptor : internalSortDescriptor
	);
	function setSortDescriptor(next: SortDescriptor | undefined) {
		if (!isSortControlled) internalSortDescriptor = next;
		onSortChange?.(next);
	}

	// ── Hidden columns ───────────────────────────────────────────
	// Same lock-in story as selection / sort. `hiddenColumns={new Set()}`
	// declares the table controlled from the start; `defaultHiddenColumns`
	// keeps it uncontrolled and any internal mutation stays local.
	// svelte-ignore state_referenced_locally
	let internalHiddenColumns = $state<ReadonlySet<string>>(toKeySet(defaultHiddenColumns ?? []));
	// svelte-ignore state_referenced_locally
	let isHiddenColumnsControlled = $state(hiddenColumns !== undefined);
	$effect(() => {
		if (hiddenColumns !== undefined) isHiddenColumnsControlled = true;
	});
	const effectiveHiddenColumns = $derived(
		isHiddenColumnsControlled
			? hiddenColumns === undefined
				? EMPTY_KEY_SET
				: toKeySet(hiddenColumns)
			: internalHiddenColumns
	);
	function setHiddenColumns(next: Set<string>) {
		if (!isHiddenColumnsControlled) internalHiddenColumns = next;
		onHiddenColumnsChange?.(next);
	}

	// ── Column filters ───────────────────────────────────────────
	// Same lock-in story as the other controlled props. Filters are stored as
	// an array (matches the public prop shape) — TableState memoizes a map
	// internally for O(1) per-column lookups.
	// svelte-ignore state_referenced_locally
	let internalColumnFilters = $state<readonly ColumnFilter[]>(defaultColumnFilters ?? []);
	// svelte-ignore state_referenced_locally
	let isColumnFiltersControlled = $state(columnFilters !== undefined);
	$effect(() => {
		if (columnFilters !== undefined) isColumnFiltersControlled = true;
	});
	const effectiveColumnFilters = $derived(
		isColumnFiltersControlled ? (columnFilters ?? EMPTY_FILTERS) : internalColumnFilters
	);
	function setColumnFilters(next: ColumnFilter[]) {
		if (!isColumnFiltersControlled) internalColumnFilters = next;
		onColumnFiltersChange?.(next);
	}

	// ── Disabled keys (memoized as Set for fast lookup) ──────────
	const effectiveDisabledKeys = $derived(disabledKeys ? toKeySet(disabledKeys) : EMPTY_KEY_SET);

	// ── TableState ───────────────────────────────────────────────
	const tableState = new TableState<TData>({
		get density() {
			return density;
		},
		get isQuiet() {
			return isQuiet;
		},
		get overflowMode() {
			return overflowMode;
		},
		get isDisabled() {
			return isDisabled;
		},
		get disabledKeys() {
			return effectiveDisabledKeys;
		},
		get selectionMode() {
			return selectionMode;
		},
		get selectedKeys() {
			return effectiveSelectedKeys;
		},
		setSelectedKeys,
		get disallowEmptySelection() {
			return disallowEmptySelection;
		},
		get sortDescriptor() {
			return effectiveSortDescriptor;
		},
		setSortDescriptor,
		get hiddenColumns() {
			return effectiveHiddenColumns;
		},
		setHiddenColumns,
		get columnFilters() {
			return effectiveColumnFilters;
		},
		setColumnFilters,
		get onAction() {
			return onAction;
		}
	});

	// ── Live region announcements ────────────────────────────────
	// Watch the effective (controlled-or-uncontrolled) values and pipe diffs
	// through TableState's announcer wrappers. Anchoring this here — rather
	// than inside individual mutators (`toggleSelectAll`, `selectFromInput`,
	// `setSortDescriptor`) — means controlled callers, header checkbox, and
	// keyboard nav all get the same announcement contract for free.
	// svelte-ignore state_referenced_locally
	let lastSelectedKeys: ReadonlySet<string> = effectiveSelectedKeys;
	$effect(() => {
		const next = effectiveSelectedKeys;
		const prev = lastSelectedKeys;
		lastSelectedKeys = next;
		if (prev === next) return;
		tableState.announceSelectionChange(prev, next);
	});

	// svelte-ignore state_referenced_locally
	let lastSortDescriptor: SortDescriptor | undefined = effectiveSortDescriptor;
	let isSortInitialized = false;
	$effect(() => {
		const next = effectiveSortDescriptor;
		const prev = lastSortDescriptor;
		lastSortDescriptor = next;
		// Skip the first run: the initial descriptor (whether default or
		// controlled) shouldn't read out as a change. Tabbing into the table
		// already announces the column's sort state via `aria-sort`.
		if (!isSortInitialized) {
			isSortInitialized = true;
			return;
		}
		if (prev?.column === next?.column && prev?.direction === next?.direction) {
			return;
		}
		tableState.announceSortChange(next);
	});

	// ── Focus integration ────────────────────────────────────────
	// Keyboard handling lives on each `<tr>` (alongside its onclick / onfocus)
	// so descendant keystrokes don't bubble into row navigation by accident.
	// The table only owns the Tab-entry behavior: when focus first enters it,
	// roll roving focus onto the first enabled row.
	function handleFocusIn(e: FocusEvent) {
		if (isDisabled || selectionMode === 'none') return;
		// Only auto-focus when the focus came from outside the table — focus
		// transitions between rows are handled by the row's own onfocus
		// (`syncHighlight`).
		if (e.target !== e.currentTarget) return;
		if (tableState.focusedKey === null) {
			tableState.focusFirst({ focusVisible: true });
		}
	}

	const isInteractive = $derived(!isDisabled && selectionMode !== 'none');
	const tableTabIndex = $derived(isInteractive && tableState.focusedKey === null ? 0 : -1);

	// Cast at the boundary — context stores TableState<unknown>.
	setTableContext(tableState as unknown as TableState<unknown>);

	// ── Empty state / loading: how many columns to colspan ───────
	// Columns are markup-registered, so the count is read from state.
	// S2 hardcodes selectionBehavior='toggle' → checkbox column always present
	// when selection is enabled.
	const showCheckboxColumn = $derived(selectionMode !== 'none');
	const totalColumns = $derived(
		tableState.collection.columns.length + (showCheckboxColumn ? 1 : 0)
	);
	const isEmpty = $derived(tableState.collection.size === 0);

	// ARIA row / col counts. `aria-rowcount` includes the header row; AT
	// implementations rely on the count for percentage announcements
	// ("row 5 of 200"). Phase 9 virtualization will revisit when only a
	// subset of rows is mounted.
	const ariaRowCount = $derived(1 + tableState.collection.size);
	const ariaColCount = $derived(totalColumns);

	// ── Scroll → onLoadMore ──────────────────────────────────────
	function handleScroll(e: Event) {
		if (loadingState !== 'idle' || !onLoadMore) return;
		const el = e.currentTarget as HTMLElement;
		const threshold = 50;
		if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
			onLoadMore();
		}
	}
</script>

<div
	data-spectrum-table-view-wrapper
	data-density={density}
	data-quiet={isQuiet || undefined}
	onscroll={handleScroll}
>
	<table
		role="grid"
		data-spectrum-table-view
		data-density={density}
		data-quiet={isQuiet || undefined}
		data-disabled={isDisabled || undefined}
		data-selection-mode={selectionMode}
		data-overflow={overflowMode}
		class={className}
		aria-multiselectable={selectionMode === 'multiple' || undefined}
		aria-disabled={isDisabled || undefined}
		aria-rowcount={ariaRowCount}
		aria-colcount={ariaColCount}
		tabindex={tableTabIndex}
		onfocusin={handleFocusIn}
		{...restProps}
	>
		{@render children()}
		{#if loadingState === 'loading'}
			<tbody>
				<tr>
					<td data-spectrum-table-view-loader colspan={totalColumns || 1}>
						<ProgressCircle isIndeterminate={true} size="m" />
					</td>
				</tr>
			</tbody>
		{:else if isEmpty && renderEmptyState}
			<tbody>
				<tr>
					<td data-spectrum-table-view-empty-state colspan={totalColumns || 1}>
						{@render renderEmptyState()}
					</td>
				</tr>
			</tbody>
		{/if}
		{#if loadingState === 'loadingMore'}
			<tbody>
				<tr>
					<td data-spectrum-table-view-loader data-loading-more colspan={totalColumns || 1}>
						<ProgressCircle isIndeterminate={true} size="s" />
					</td>
				</tr>
			</tbody>
		{/if}
	</table>
</div>

<style>
	/* ── Scroll Wrapper ──────────────────────────────────────── */

	[data-spectrum-table-view-wrapper] {
		overflow: auto;
		border: 1px solid var(--gray-300);
		border-radius: var(--corner-radius-100);
		background: var(--background-base-color);
	}

	[data-spectrum-table-view-wrapper][data-quiet] {
		border: none;
		border-radius: 0;
		background: transparent;
		overflow: visible;
	}

	/* Quiet mode: header gets a top border to visually frame it. */
	[data-spectrum-table-view][data-quiet] {
		--_table-header-top-border-width: 1px;
	}

	/* ── Root Table ──────────────────────────────────────────── */

	[data-spectrum-table-view] {
		--table-row-hover-color: var(--gray-900);
		/* S2 uses the same controlFont() for both cells and column headers;
		   the header is differentiated by font-weight: bold only. */
		--table-view-font-size: var(--text-100);
		/* Quiet mode propagates a top border to the sticky header row.
		   Default 0; overridden to 1px on [data-quiet] below. */
		--_table-header-top-border-width: 0px;
		border-collapse: collapse;
		width: 100%;
		font-family: inherit;
		color: var(--neutral-content-color-default);
		outline: none;
		table-layout: fixed;
		/* Prevent keyboard-navigated rows from sliding under the sticky header. */
		scroll-padding-top: 32px;
	}

	/* Disabled */
	[data-spectrum-table-view][data-disabled] {
		opacity: var(--opacity-disabled);
		pointer-events: none;
	}

	/* ── Density → row height (S2 medium scale) ──────────────
	   Values come straight from spectrum-tokens `table-row-height-medium-*`:
	   compact=component-height-100=32, regular=40, spacious=48. S2 keeps
	   horizontal cell padding fixed at 16px regardless of density (no
	   padding-block); density only changes row height. */

	[data-spectrum-table-view][data-density='compact'] {
		--table-view-row-height: 32px;
	}
	[data-spectrum-table-view][data-density='regular'] {
		--table-view-row-height: 40px;
	}
	[data-spectrum-table-view][data-density='spacious'] {
		--table-view-row-height: 48px;
	}

	/* ── Empty State ─────────────────────────────────────────── */

	[data-spectrum-table-view-empty-state] {
		padding: var(--spacing-500) var(--spacing-300);
		text-align: center;
		color: var(--neutral-subdued-content-color-default);
		font-size: var(--table-view-font-size);
	}

	/* ── Loading State ───────────────────────────────────────── */

	[data-spectrum-table-view-loader] {
		padding: var(--spacing-400);
		text-align: center;
		vertical-align: middle;
	}

	[data-spectrum-table-view-loader][data-loading-more] {
		padding: var(--spacing-200);
	}

	/* ── Cell / Column-header Focus Ring ─────────────────────────
	   Shared `:focus-visible` indicator for every keyboard-focusable cell
	   surface (data / rowheader / column header / checkbox cell + header).
	   Centralised here rather than repeated in each subcomponent so the
	   focus ring stays consistent in one place. Matches S2 TableView's
	   `cellFocus` (2px focus-ring inset -2, 6px border-radius). `:global`
	   is required because the matching elements live in sibling components
	   under their own scope hashes. */
	[data-spectrum-table-view]
		:global(
			:is(
				[data-spectrum-table-view-cell],
				[data-spectrum-table-view-checkbox-cell],
				[data-spectrum-table-view-column],
				[data-spectrum-table-view-checkbox-header]
			):focus-visible
		) {
		outline: 2px solid var(--focus-indicator-color);
		outline-offset: -2px;
		border-radius: var(--corner-radius-300);
		z-index: 2;
	}
</style>
