import type { Snippet } from 'svelte';
import type { HTMLTableAttributes } from 'svelte/elements';

// ── Display ──────────────────────────────────────────────────
// `size` is intentionally absent — S2 has no equivalent prop. Vertical rhythm
// is controlled solely by `density`.
// `selectionStyle` is also absent — S2 hardcodes `selectionBehavior="toggle"`,
// which means the checkbox column always appears when selectionMode !== 'none'.
export type TableViewDensity = 'compact' | 'regular' | 'spacious';
export type TableViewSelectionMode = 'none' | 'single' | 'multiple';
export type TableViewOverflowMode = 'truncate' | 'wrap';
export type TableViewLoadingState = 'idle' | 'loading' | 'loadingMore' | 'sorting' | 'loadingError';

// ── Sort ─────────────────────────────────────────────────────
export type SortDirection = 'ascending' | 'descending';

export type SortDescriptor = {
	column: string;
	direction: SortDirection;
};

// ── Filter ───────────────────────────────────────────────────
// Per-column filter state. The shape varies by `filterType` (set on the
// Column): text → `contains` over a string, number → `between` over a
// `[min, max]` tuple where either bound can be null, enum → `in` over a
// string[] from the column's `enumOptions`. Other operators may be added
// in later phases; the union stays open.
//
// Like sort, *applying* the filter is the consumer's responsibility — the
// table only emits state. Stories show the pattern with `$derived`.
export type ColumnFilterType = 'text' | 'number' | 'enum';

export type ColumnFilterOperator =
	| 'contains'
	| 'equals'
	| 'startsWith'
	| 'endsWith'
	| 'between'
	| 'in';

export type ColumnFilter =
	| { column: string; type: 'text'; operator: 'contains'; value: string }
	| {
			column: string;
			type: 'number';
			operator: 'between';
			value: { min: number | null; max: number | null };
	  }
	| { column: string; type: 'enum'; operator: 'in'; value: string[] };

export type EnumFilterOption = {
	label: string;
	value: string;
};

// ── Root props ───────────────────────────────────────────────
// API is markup compositional throughout (RS S2 parity): consumers declare
// columns / rows / cells as JSX-style children, not as data passed via props.
// Hide the header by omitting <TableView.Header>; provide an empty state by
// passing `renderEmptyState` and an empty body.
export type TableViewRootProps = Omit<HTMLTableAttributes, 'role' | 'children'> & {
	// display
	density?: TableViewDensity;
	isQuiet?: boolean;
	overflowMode?: TableViewOverflowMode;

	// disabled
	isDisabled?: boolean;
	disabledKeys?: Iterable<string>;

	// selection
	selectionMode?: TableViewSelectionMode;
	selectedKeys?: Iterable<string>;
	defaultSelectedKeys?: Iterable<string>;
	onSelectionChange?: (keys: Set<string>) => void;
	disallowEmptySelection?: boolean;

	// sorting
	sortDescriptor?: SortDescriptor;
	defaultSortDescriptor?: SortDescriptor;
	onSortChange?: (desc: SortDescriptor | undefined) => void;

	// column visibility (Phase 6) — set of column ids that should NOT render. Same
	// controlled / uncontrolled lock-in story as selection / sort.
	hiddenColumns?: Iterable<string>;
	defaultHiddenColumns?: Iterable<string>;
	onHiddenColumnsChange?: (hidden: Set<string>) => void;

	// column filters (Phase 6) — list of active filters keyed by `column`. At
	// most one filter per column; setting a new filter replaces an existing one
	// for the same column, and `value` going empty (cleared text, both bounds
	// null, no enum options checked) drops the entry entirely. Same lock-in
	// story as the other controlled props.
	columnFilters?: ColumnFilter[];
	defaultColumnFilters?: ColumnFilter[];
	onColumnFiltersChange?: (filters: ColumnFilter[]) => void;

	// actions
	onAction?: (key: string) => void;
	renderEmptyState?: Snippet;

	// loading
	loadingState?: TableViewLoadingState;
	onLoadMore?: () => void;

	// content
	children: Snippet;
};

// ── Header props ─────────────────────────────────────────────
// Hosts <TableView.Column> children inside a <thead><tr>. The select-all
// checkbox column is injected automatically when selectionMode !== 'none'.
export type TableViewHeaderProps = {
	children: Snippet;
};

// ── Body props ───────────────────────────────────────────────
// Wraps row markup in <tbody>. `children` is optional so consumers can render
// an empty body (the empty-state snippet on Root will fill in).
export type TableViewBodyProps = {
	children?: Snippet;
};

// ── Column props ─────────────────────────────────────────────
// Children render the column header label. Sort UI is opt-in via
// `allowsSorting`; the consumer is responsible for actually sorting their data
// in response to `onSortChange` on Root (RS pattern — see docs).
export type TableViewColumnProps = {
	id: string;

	// a11y
	isRowHeader?: boolean;

	// display
	align?: 'start' | 'center' | 'end';
	showDivider?: boolean;

	// sorting
	allowsSorting?: boolean;

	// column menu (Phase 6) — opt-in surface area exposed on the column's
	// dropdown menu. Each flag adds the corresponding menu item.
	allowsHiding?: boolean;

	// filtering (Phase 6) — declares the column as filterable and picks the UI
	// dispatcher (text input, two number inputs, or a checkbox list of
	// `enumOptions`). The consumer still owns applying the filter to data;
	// the table only stores + emits the descriptor.
	filterType?: ColumnFilterType;
	enumOptions?: EnumFilterOption[];

	// sizing (Phase 7 will activate)
	width?: number | string;
	minWidth?: number;
	maxWidth?: number;

	// content
	children: Snippet;
};

// ── Row props ────────────────────────────────────────────────
// `href` turns the row into a link. We render a stretched `<a>` inside the
// rowheader cell that visually covers the entire `<tr>` via `::after`, so
// click / cmd+click / middle-click / right-click context menu / keyboard
// Enter / SvelteKit client-side nav all flow through a real `<a>` element.
// When `href` is present, plain row click does NOT toggle selection (RAC's
// `linkBehavior='override'` default for tables) — the checkbox column is
// still the way to select linked rows.
export type TableViewRowProps = {
	key: string;
	isDisabled?: boolean;
	textValue?: string;

	// link behavior (Phase 2)
	href?: string;
	target?: '_self' | '_blank' | '_parent' | '_top';
	download?: string | boolean;
	rel?: string;

	// per-row action — takes priority over the table-level `onAction` when set.
	// Suppressed for linked rows (Enter navigates instead).
	onAction?: () => void;

	children: Snippet;
};

// ── Cell props ───────────────────────────────────────────────
export type TableViewCellProps = {
	// Override the default markup-order column resolution. Useful when a row
	// reorders or skips cells relative to the column declaration order.
	column?: string;
	textValue?: string;
	children: Snippet;
};
