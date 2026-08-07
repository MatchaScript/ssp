import type { Snippet } from 'svelte';
import type { HTMLTableAttributes } from 'svelte/elements';
import type { ColumnDescriptor } from './state/collection.js';

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
	'contains' | 'equals' | 'startsWith' | 'endsWith' | 'between' | 'in';

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
// Columns come from `<TableView.Header columns>` and rows from
// `<TableView.Body items>`; cells are still written as markup and bind to a
// column by id. Provide an empty state by passing `renderEmptyState` and an
// empty `items`.
export type TableViewRootProps = Omit<HTMLTableAttributes, 'role' | 'children'> & {
	// display
	density?: TableViewDensity;
	isQuiet?: boolean;
	overflowMode?: TableViewOverflowMode;
	/**
	 * Hide the header row visually. The `<thead>` stays in the DOM so column
	 * names remain available to assistive technology.
	 */
	hideHeader?: boolean;

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

	// column visibility — set of column ids that should NOT render. Same
	// controlled / uncontrolled lock-in story as selection / sort.
	hiddenColumns?: Iterable<string>;
	defaultHiddenColumns?: Iterable<string>;
	onHiddenColumnsChange?: (hidden: Set<string>) => void;

	// column filters — list of active filters keyed by `column`. At
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
// `columns` is the column order: the header cells, the `<colgroup>` and
// `aria-colindex` all read this one array, so they cannot disagree. The
// select-all checkbox column is injected automatically when
// selectionMode !== 'none'.
export type TableViewHeaderProps = {
	columns: readonly TableViewColumn[];
	/** Header cell content. Defaults to the column's `label`. */
	column?: Snippet<[TableViewColumn]>;
};

// ── Body props ───────────────────────────────────────────────
// `items` is the row order and the row identity: `getKey` names each row, and
// the `row` snippet renders it. Position-aware behavior (arrow keys, range
// selection, announcements) reads the array, never the DOM.
export type TableViewBodyProps<TItem> = {
	items: readonly TItem[];
	getKey: (item: TItem, index: number) => string;
	row: Snippet<[TItem, number]>;
};

// ── Column ───────────────────────────────────────────────────
// One entry of `<TableView.Header columns>`. Sort UI is opt-in via
// `allowsSorting`; the consumer is responsible for actually sorting their data
// in response to `onSortChange` on Root (RS pattern — see docs).
export type TableViewColumn = ColumnDescriptor;

// ── Row props ────────────────────────────────────────────────
// `href` turns the row into a link. We render a stretched `<a>` inside the
// rowheader cell that visually covers the entire `<tr>` via `::after`, so
// click / cmd+click / middle-click / right-click context menu / keyboard
// Enter / SvelteKit client-side nav all flow through a real `<a>` element.
// When `href` is present, plain row click does NOT toggle selection (RAC's
// `linkBehavior='override'` default for tables) — the checkbox column is
// still the way to select linked rows.
export type TableViewRowProps = {
	textValue?: string;

	// link behavior
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
	/** Id of the column this cell belongs to. */
	column: string;
	/**
	 * Text for this cell. Cells in a rowheader column supply the row's
	 * accessible name and its typeahead text.
	 */
	textValue?: string;
	children: Snippet;
};
