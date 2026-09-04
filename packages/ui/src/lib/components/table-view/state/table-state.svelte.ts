/* eslint-disable svelte/prefer-svelte-reactivity --
 * Several Map/Set instances in this file are intentionally non-reactive
 * (DOM element bookkeeping, registration metadata) — making them SvelteMap
 * would close $derived feedback loops or just waste reactivity tracking.
 * Plain Map/Set are used for registries read only from event handlers;
 * reactive consumers go through SvelteMap.
 */
import { tick, untrack } from 'svelte';
import {
	SelectableCollection,
	isPrintable,
	type ItemRegistration,
	type SelectionInputModifiers
} from '$lib/utils/selectable-collection/index.js';
import type {
	ColumnFilter,
	SortDescriptor,
	SortDirection,
	TableViewDensity,
	TableViewOverflowMode,
	TableViewSelectionMode
} from '../types.js';
import {
	order,
	type ColumnDescriptor,
	type FocusTarget,
	type Ordered,
	type RowMeta
} from './collection.js';
import { TableKeyboardDelegate } from '../internal/keyboard/table-keyboard-delegate.js';
import { Typeahead } from '$lib/utils/selectable-collection/typeahead.js';
import { getAnnouncer } from '$lib/utils/announcer/index.js';
import { getElementDirection } from '$lib/utils/direction.js';
import { TableColumnLayoutState } from './column-layout-state.svelte.js';

// Hint Safari (and modern Chromium / Firefox) to keep `:focus-visible`
// matching after a programmatic focus — without it, arrow-key driven moves
// don't paint the focus ring on Safari. The TS DOM lib doesn't list this
// field on `FocusOptions`, but browsers accept it; declaring a local typed
// const lets us pass it through `.focus()` without an inline cast.
const FOCUS_OPTS = { focusVisible: true } as FocusOptions;

/**
 * Reserved column id for the synthetic selection (checkbox) column. Mirrors
 * RAC's `ROW_HEADER_COLUMN_KEY` / `props.isSelectionCell`: the column is not
 * declared by the consumer but participates in 2D nav as the leftmost column
 * whenever `selectionMode !== 'none'`. Cells / headers that render the
 * checkboxes register under this id; the keyboard delegate sees it as just
 * another column and arrow-key nav reaches it naturally.
 */
export const SELECTION_COLUMN_ID = '__ssp_table_selection__';

/**
 * Fixed pixel width of the synthetic selection (checkbox) column. The
 * descriptor pins `minWidth` / `maxWidth` to the same value so the column
 * neither flexes nor picks up the 75px default min width — it always occupies
 * exactly this width in the layout.
 */
const SELECTION_COLUMN_WIDTH = 40;

/**
 * PageUp / PageDown distance used until the wrapper and one row have been
 * measured — server rendering and the first paint. Afterwards the real
 * viewport decides (`TableState.#pageSize`).
 */
const DEFAULT_PAGE_SIZE = 10;

const SELECTION_COLUMN_DESCRIPTOR: ColumnDescriptor = {
	id: SELECTION_COLUMN_ID,
	label: '',
	width: SELECTION_COLUMN_WIDTH,
	minWidth: SELECTION_COLUMN_WIDTH,
	maxWidth: SELECTION_COLUMN_WIDTH
};

export interface TableStateOptions {
	// display
	readonly density: TableViewDensity;
	readonly isQuiet: boolean;
	readonly hideHeader: boolean;
	readonly overflowMode: TableViewOverflowMode;

	// disabled
	readonly isDisabled: boolean;
	readonly disabledKeys: ReadonlySet<string>;

	// selection
	readonly selectionMode: TableViewSelectionMode;
	readonly selectedKeys: ReadonlySet<string>;
	readonly setSelectedKeys: (keys: Set<string>) => void;
	readonly disallowEmptySelection: boolean;

	// sort
	readonly sortDescriptor: SortDescriptor | undefined;
	readonly setSortDescriptor: (desc: SortDescriptor | undefined) => void;

	// column visibility
	readonly hiddenColumns: ReadonlySet<string>;
	readonly setHiddenColumns: (hidden: Set<string>) => void;

	// column filters
	readonly columnFilters: readonly ColumnFilter[];
	readonly setColumnFilters: (filters: ColumnFilter[]) => void;

	// layout
	readonly tableWidth: number;

	// identity — the prefix behind `columnHeaderId`. Supplied by Root from
	// `$props.id()` so the ids it derives survive hydration.
	readonly tableId: string;

	// actions
	readonly onAction?: (key: string) => void;
}

/**
 * An id part has to survive being written into an `id` attribute, which cannot
 * contain ASCII whitespace. Upstream normalizes the same way
 * (`react-aria/src/table/utils.ts`).
 */
function normalizeIdPart(value: string): string {
	return value.replace(/\s+/g, '');
}

/**
 * Owns the runtime state for a single TableView instance.
 *
 * Selection, roving focus, keyboard nav and typeahead are delegated to a shared
 * `SelectableCollection` (the same primitive ListView and Menu use). TableState
 * adds table-specific concerns on top: column registry, sort descriptor, row
 * metadata, and the `onAction` dispatch on Enter.
 *
 * Rows and columns are exposed as two independent `Ordered` lists. They are
 * deliberately not bundled into one collection object: a single façade makes
 * every row-side reader subscribe to column changes as well.
 */
export class TableState {
	#opts: TableStateOptions;
	#collection: SelectableCollection;

	// Non-reactive per-row metadata (href / onAction). See `RowMeta` doc for
	// why these are deliberately kept out of the reactive registry.
	#rowMeta = new Map<string, RowMeta>();
	// Row and cell label text, read only from event handlers and announcements.
	#rowText = new Map<string, string>();
	#cellText = new Map<string, string>();
	// Dev-only: how many cells currently claim each (row, column) slot.
	#cellSlotClaims = new Map<string, number>();

	// Row order and row identity come from `<TableView.Body items>`, never from
	// the DOM: the consumer's array is the order, so a re-sort needs no
	// observation to be picked up. `#rowSource` is registered synchronously by
	// Body (not from an `$effect`) so the rows are there on the server too.
	#rowSource: RowSource | null = $state.raw(null);
	#columnSource: ColumnSource | null = $state.raw(null);

	// Cell + column-header element registries for 2D keyboard nav. Cells are
	// keyed by `${rowKey}|${columnId}`. The maps stay non-reactive — only
	// `.focus()` calls read from them, never `$derived`.
	#cellElements = new Map<string, HTMLElement>();
	#columnHeaderElements = new Map<string, HTMLElement>();

	// The wrapper (scroll box) and the `<table>`. Registered by Root; the wrapper
	// is measured for `#pageSize` and read for the writing direction, and the
	// `<table>` is the reference point for the Tab-direction test in
	// `enterFromTab`.
	#wrapperEl: HTMLElement | null = null;
	#tableEl: HTMLElement | null = null;

	// Where the keyboard is pointed — one identity, all three modes. Its
	// resolution against the current rows and columns is `#keyboardTarget`; every
	// tabindex in the table reads that and nothing else.
	#focus: FocusTarget | null = $state.raw(null);

	// Focus relocation state. Three plain integers, not a snapshot of the
	// collection: the last resolved position, and the row count it was resolved
	// against (needed to know how many rows a change removed).
	#lastRowIndex = -1;
	#lastColumnIndex = -1;
	#lastRowCount = 0;
	// Set once anything inside the table has taken DOM focus. Combined with
	// where focus is *now* to decide whether relocation owes the user a
	// `.focus()` call — see `#shouldRestoreDomFocus`.
	#hasBeenFocused = false;
	// Whether DOM focus was inside the table, sampled ahead of the DOM change
	// rather than read live — see `hadDomFocus`.
	#hadDomFocus = false;

	#delegate: TableKeyboardDelegate;
	#cellTypeahead: Typeahead;
	#layout: TableColumnLayoutState;
	// The layout operates over the same column list as 2D nav: the synthetic
	// selection column is the leftmost layout column whenever selection is on,
	// so its 40px lands in the colgroup alongside the user columns and the
	// widths sum to exactly `tableWidth`. `ColumnDescriptor` is a structural
	// superset of `LayoutColumn`, so descriptors feed the layout directly.
	//
	// Nav order: the same list 2D navigation and the colgroup read. Index 0 is
	// the leading edge, so the column headers' `aria-colindex` is uniformly
	// `navColumns.indexOf(id) + 1` with no selection-mode arithmetic at the
	// call sites.
	#navColumns = $derived.by<Ordered<ColumnDescriptor>>(() =>
		order(
			this.#opts.selectionMode === 'none'
				? this.#visibleColumns.items
				: [SELECTION_COLUMN_DESCRIPTOR, ...this.#visibleColumns.items],
			(c) => c.id
		)
	);

	// Resizer input elements (one per resizable column). Used so the column
	// menu's "Resize column" entry can focus the input directly without a
	// document-wide DOM query.
	#resizerInputs = new Map<string, HTMLInputElement>();

	constructor(opts: TableStateOptions) {
		this.#opts = opts;
		// Captures `this` for the literal-object getters below — Svelte 5 needs a
		// lexical alias so each getter re-reads the live value on access.
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		this.#collection = new SelectableCollection({
			get selectionMode() {
				return opts.selectionMode;
			},
			get selectedKeys() {
				return opts.selectedKeys as Set<string>;
			},
			// Row order comes from `items`, not from the DOM. The shared
			// primitive's `compareDocumentPosition` sort is for collections whose
			// items self-register and have no other way to know their order.
			orderedValues: () => this.#rowKeys,
			// The highlight is TableState's `#focus`, resolved. Row-mode moves
			// (arrows, Home/End, Page*, typeahead) are applied inside the
			// collection and reported back through `onHighlightChange`, so the
			// identity stays a single value with a single owner.
			highlightedValue: () => {
				const f = this.#keyboardTarget;
				return f === null || f.type === 'columnheader' ? null : f.rowKey;
			},
			onHighlightChange: (value) => {
				this.#setFocus(value === null ? null : { type: 'row', rowKey: value });
			},
			get pageSize() {
				return self.#pageSize();
			},
			// S2 hardcodes `selectionBehavior: 'toggle'` for TableView — checkbox
			// column is shown whenever selection is on, and clicks always toggle.
			selectionBehavior: 'toggle',
			shouldFocusWrap: false,
			// Ctrl+A is handled by TableState in both row and cell mode so the
			// select-all population is decided in one place. The collection's own
			// implementation would use its registered items, which is a different
			// set from `items` whenever a row is declared but not rendered.
			allowsSelectAll: false,
			get disallowEmptySelection() {
				return opts.disallowEmptySelection;
			},
			onSelectionChange: (keys) => opts.setSelectedKeys(keys)
		});
		this.#delegate = new TableKeyboardDelegate({
			// Nothing here builds an array per call: the delegate asks the row list
			// for indices and disabled-ness one key at a time.
			rowKeys: () => this.#rowKeys,
			rowIndexOf: (key) => this.#rows.indexOf(key),
			isRowDisabled: (key) => this.isRowDisabled(key),
			// Selection column is treated as the first column for nav purposes
			// whenever selection is enabled (RAC parity — see
			// `SELECTION_COLUMN_ID` doc). `#navColumns` already prepends the
			// synthetic descriptor under that condition; cells / headers register
			// under `SELECTION_COLUMN_ID` so the delegate's index lookups land on
			// the right elements. Hidden columns drop out of the nav order so
			// arrow keys skip them — they're not focusable in the DOM either.
			columns: () => this.#navColumns,
			direction: () => getElementDirection(this.#wrapperEl),
			pageSize: () => this.#pageSize()
		});
		this.#cellTypeahead = new Typeahead(
			() =>
				this.#rowKeys.flatMap((key) => {
					const domId = this.#collection.getDomId(key);
					const el = domId ? this.#collection.getElement(domId) : undefined;
					if (!domId || !el) return [];
					return [
						{
							domId,
							value: key,
							el,
							disabled: this.isRowDisabled(key),
							textValue: this.#rowLabel(key)
						}
					];
				}),
			(domId) => {
				const rowKey = this.#collection.getValue(domId);
				const f = this.#focus;
				if (!rowKey || f === null || f.type !== 'cell') return;
				this.#focusTarget({ type: 'cell', rowKey, columnId: f.columnId });
			}
		);
		this.#layout = new TableColumnLayoutState({
			get tableWidth() {
				return self.#opts.tableWidth;
			},
			get columns() {
				return self.#navColumns.items;
			}
		});

		// The single place that decides where focus goes when the collection
		// changes underneath it. Two triggers, both leading to the same question:
		// the identity stopped resolving (its row or column left), or the row it
		// names turned disabled. Upstream answers them in two separate effects
		// (`useGridState` and `useSelectableItem`); one entry point is enough.
		$effect(() => {
			const rows = this.#rows;
			const nav = this.#navColumns;
			void this.#opts.isDisabled;
			void this.#opts.disabledKeys;
			// `#focus` is both read and written below. Untracked, or the effect
			// re-enters itself on every relocation.
			untrack(() => this.#reconcileFocus(rows, nav));
		});

		// Samples `hadDomFocus` for the selection the announcement is about to
		// report. `$effect.pre` is what puts the read in the right place: it runs
		// during the traversal, and this one is created in Root's `<script>` — so
		// ahead of `<TableView.Body>`'s `{#each}` — which means the rows the change
		// removes are still in the DOM and still hold focus when it runs. Reading
		// `document.activeElement` from the announcement effect instead would ask
		// after the removal, when focus has already fallen to `<body>`.
		$effect.pre(() => {
			void this.#opts.selectedKeys;
			this.#hadDomFocus = this.#wrapperEl?.contains(document.activeElement) ?? false;
		});
	}

	// ── option pass-through ─────────────────────────────────────
	get density() {
		return this.#opts.density;
	}
	get isQuiet() {
		return this.#opts.isQuiet;
	}
	get hideHeader() {
		return this.#opts.hideHeader;
	}
	get overflowMode() {
		return this.#opts.overflowMode;
	}
	get isDisabled() {
		return this.#opts.isDisabled;
	}
	get disabledKeys() {
		return this.#opts.disabledKeys;
	}
	get selectionMode() {
		return this.#opts.selectionMode;
	}
	get selectedKeys() {
		return this.#opts.selectedKeys;
	}
	get sortDescriptor() {
		return this.#opts.sortDescriptor;
	}
	get onAction() {
		return this.#opts.onAction;
	}

	// ── columns (registry) ─────────────────────────────────────
	// `#columns` is the canonical registration-order list. `#visibleColumns` filters
	// out columns the consumer has hidden — that's what AT and Header iterate
	// over, while `#columns` stays the source of truth for cell-to-column
	// resolution (cells are rendered in markup order regardless of hide state).
	#columns = $derived.by<Ordered<ColumnDescriptor>>(() =>
		order(this.#columnSource?.columns ?? [], (c) => c.id)
	);
	#visibleColumns = $derived.by<Ordered<ColumnDescriptor>>(() =>
		order(
			this.#columns.items.filter((c) => !this.#opts.hiddenColumns.has(c.id)),
			(c) => c.id
		)
	);
	/** Every declared column, in registration order. */
	get columns(): Ordered<ColumnDescriptor> {
		return this.#columns;
	}
	/** Declared columns the consumer has not hidden. */
	get visibleColumns(): Ordered<ColumnDescriptor> {
		return this.#visibleColumns;
	}
	/**
	 * Ids of the visible rowheader columns. When none is declared this falls back
	 * to the first visible column, matching upstream `TableCollection`, so a row
	 * always has something to take its accessible name from.
	 */
	#rowHeaderColumnIds = $derived.by<readonly string[]>(() => {
		const declared = this.#visibleColumns.items.filter((c) => c.isRowHeader).map((c) => c.id);
		if (declared.length > 0) return declared;
		const first = this.#visibleColumns.items[0];
		return first ? [first.id] : [];
	});
	get rowHeaderColumnIds(): readonly string[] {
		return this.#rowHeaderColumnIds;
	}
	/**
	 * Visible columns plus the synthetic selection column when selection is on.
	 * The single list behind 2D nav, the colgroup and the column headers'
	 * `aria-colindex`.
	 */
	get navColumns(): Ordered<ColumnDescriptor> {
		return this.#navColumns;
	}
	/**
	 * The `<th>` id for a column header. One convention in one place, because the
	 * column resizer composes its accessible name out of it — its own label plus
	 * the header it belongs to — and would otherwise read the same for every
	 * resizable column.
	 */
	columnHeaderId(columnId: string): string {
		return `${this.#opts.tableId}-col-${normalizeIdPart(columnId)}`;
	}
	/**
	 * The `<td>` / `<th>` id for one cell. The row predicts its rowheader cells'
	 * ids from here to build its `aria-labelledby` (and the row checkbox's), and
	 * the cell writes the same id onto its element, so the two cannot disagree.
	 * The column id is normalized for the same reason `columnHeaderId` normalizes
	 * it: `aria-labelledby` tokenizes on whitespace, so a consumer's column id
	 * carrying any would turn one reference into several that resolve to nothing
	 * — and the row and its checkbox would go unnamed. Upstream normalizes its
	 * cell id the same way (`react-aria/src/table/utils.ts` `getCellId`).
	 */
	cellId(rowDomId: string, columnId: string): string {
		return `${rowDomId}-cell-${normalizeIdPart(columnId)}`;
	}
	getColumn(id: string): ColumnDescriptor | undefined {
		return this.#columns.get(id);
	}
	isColumnHidden(id: string): boolean {
		return this.#opts.hiddenColumns.has(id);
	}

	// ── rows ───────────────────────────────────────────────────
	// Kept separate from the column lists on purpose: bundling them would make
	// every per-row derived subscribe to column changes too.
	#rowKeys = $derived.by<readonly string[]>(() => this.#rowSource?.keys ?? []);
	#rows = $derived.by<Ordered<string>>(() => order(this.#rowKeys, (k) => k));
	/** Row keys in consumer order. */
	get rows(): Ordered<string> {
		return this.#rows;
	}

	// ── data sources (registered synchronously by Body / Header) ─
	// Registration happens in the component body rather than an `$effect` so
	// rows and columns exist during server rendering too — the colgroup and the
	// rowheader `<th>`s depend on them.
	// Both return a release function. The identity check matters because a
	// replacement source can register before the outgoing one releases, and the
	// stale release must not wipe the live source.
	setRowSource(source: RowSource): () => void {
		this.#rowSource = source;
		return () => {
			if (this.#rowSource === source) this.#rowSource = null;
		};
	}
	setColumnSource(source: ColumnSource): () => void {
		this.#columnSource = source;
		return () => {
			if (this.#columnSource === source) this.#columnSource = null;
		};
	}

	// ── row registration (called from <TableView.Row>) ─────────
	// Order and identity come from the row source; this registers the parts
	// only the rendered row knows: its element (focus, typeahead) and the
	// non-reactive metadata behind `onAction` / `href`.
	registerRow(reg: RowRegistration): () => void {
		this.#rowMeta.set(reg.value, { href: reg.href, onAction: reg.onAction });
		if (reg.textValue) this.#rowText.set(reg.value, reg.textValue);
		const unregister = this.#collection.registerItem({
			domId: reg.domId,
			value: reg.value,
			el: reg.el,
			disabled: reg.disabled,
			textValue: reg.textValue
		});
		return () => {
			this.#rowMeta.delete(reg.value);
			this.#rowText.delete(reg.value);
			unregister();
		};
	}
	/**
	 * Update non-reactive per-row metadata (href / onAction). Called from a
	 * Row `$effect` so changes to those props after mount stay in sync —
	 * mutating `#rowMeta` (a plain Map) does NOT trigger any derived re-runs,
	 * which is the whole point: `onAction` is typically an inline closure
	 * with a fresh identity on every parent render, and storing it in a
	 * SvelteMap would create a render → update → re-render feedback loop.
	 */
	updateRowMeta(key: string, updates: Partial<RowMeta>): void {
		const existing = this.#rowMeta.get(key);
		if (!existing) return;
		this.#rowMeta.set(key, { ...existing, ...updates });
	}
	updateRow(
		domId: string,
		updates: Partial<Pick<ItemRegistration, 'disabled' | 'textValue'>>
	): void {
		const rowKey = this.#collection.getValue(domId);
		if (rowKey !== undefined && updates.textValue !== undefined) {
			// Store only what the row itself declared; the rowheader-cell text and
			// the DOM scrape stay resolve-on-read, so a later change reaches the
			// label without the row re-registering.
			if (updates.textValue) this.#rowText.set(rowKey, updates.textValue);
			else this.#rowText.delete(rowKey);
		}
		// The shared collection has no view of cells, so it gets the resolved
		// label — that is what row-mode typeahead matches against.
		this.#collection.updateItem(domId, {
			...updates,
			...(rowKey === undefined ? {} : { textValue: this.#rowLabel(rowKey) })
		});
	}

	// ── cell text (called from <TableView.Cell>) ────────────────
	// Cells in a rowheader column supply the row's accessible name, matching
	// upstream `TableCollection.getTextValue`, which joins the rowheader cells'
	// own text rather than reading the DOM.
	registerCellText(rowKey: string, columnId: string, text: string): () => void {
		const key = this.#cellKey(rowKey, columnId);
		this.#cellText.set(key, text);
		return () => this.#cellText.delete(key);
	}
	/**
	 * Dev-only duplicate detection: a second cell claiming the same
	 * `(row, column)` slot warns instead of silently producing two keyboard
	 * targets for one cell.
	 */
	claimCellSlot(rowKey: string, columnId: string): () => void {
		const key = this.#cellKey(rowKey, columnId);
		const count = (this.#cellSlotClaims.get(key) ?? 0) + 1;
		this.#cellSlotClaims.set(key, count);
		if (count > 1) {
			console.warn(
				`[TableView] row "${rowKey}" renders more than one cell for column "${columnId}".`
			);
		}
		return () => {
			const next = (this.#cellSlotClaims.get(key) ?? 1) - 1;
			if (next > 0) this.#cellSlotClaims.set(key, next);
			else this.#cellSlotClaims.delete(key);
		};
	}

	/** Joined text of this row's rowheader cells, or '' when none supplied one. */
	rowHeaderCellText(rowKey: string): string {
		const parts: string[] = [];
		for (const id of this.#rowHeaderColumnIds) {
			const text = this.#cellText.get(this.#cellKey(rowKey, id));
			if (text) parts.push(text);
		}
		return parts.join(' ');
	}

	// ── cell + column-header element registries ────────────────
	// Cells / column headers register their DOM element so 2D keyboard nav can
	// move focus by `(rowKey, columnId)` without a DOM query each step. The
	// maps stay non-reactive — they're only consumed inside event handlers.
	#cellKey(rowKey: string, columnId: string): string {
		return `${rowKey}|${columnId}`;
	}
	registerCell(rowKey: string, columnId: string, el: HTMLElement): () => void {
		const key = this.#cellKey(rowKey, columnId);
		this.#cellElements.set(key, el);
		return () => {
			if (this.#cellElements.get(key) === el) this.#cellElements.delete(key);
		};
	}
	registerColumnHeader(columnId: string, el: HTMLElement): () => void {
		this.#columnHeaderElements.set(columnId, el);
		return () => {
			if (this.#columnHeaderElements.get(columnId) === el) {
				this.#columnHeaderElements.delete(columnId);
			}
		};
	}

	// ── the keyboard target ────────────────────────────────────
	// `#focus` is what the user aimed at; `#keyboardTarget` is that identity
	// resolved against the rows and columns that exist right now. A target whose
	// row or column has left resolves to null, and null is what hands the tab
	// stop back to the `<table>` — so "focus was on a column I just hid" cannot
	// leave the table with no tab stop at all.
	#keyboardTarget = $derived.by<FocusTarget | null>(() =>
		this.#resolve(this.#focus, this.#rows, this.#navColumns)
	);

	#resolve(
		f: FocusTarget | null,
		rows: Ordered<string>,
		nav: Ordered<ColumnDescriptor>
	): FocusTarget | null {
		if (f === null) return null;
		switch (f.type) {
			case 'row':
				return rows.indexOf(f.rowKey) === -1 ? null : f;
			case 'cell':
				return rows.indexOf(f.rowKey) === -1 || nav.indexOf(f.columnId) === -1 ? null : f;
			case 'columnheader':
				return nav.indexOf(f.columnId) === -1 ? null : f;
		}
	}

	/** The resolved keyboard target. Every `tabindex` in the table reads this. */
	get keyboardTarget(): FocusTarget | null {
		return this.#keyboardTarget;
	}

	/**
	 * The keyboard target when it points at this row, else null. Read once per
	 * row (by `<TableViewRowScope>`) so a row's cells subscribe to their own
	 * row's focus rather than to the table-wide target.
	 */
	rowFocus(rowKey: string): FocusTarget | null {
		const f = this.#keyboardTarget;
		if (f === null || f.type === 'columnheader' || f.rowKey !== rowKey) return null;
		return f;
	}

	// ── helpers ─────────────────────────────────────────────────
	isSelected(key: string): boolean {
		return this.#collection.isSelected(key);
	}
	isRowDisabled(key: string): boolean {
		return this.#opts.isDisabled || this.#opts.disabledKeys.has(key);
	}

	// ── focus control ──────────────────────────────────────────
	#setFocus(next: FocusTarget | null): void {
		this.#focus = next;
		// Remember where we were, for `#relocate`. Doing it here (and again in
		// `#reconcileFocus` when the collection shifts under a still-resolvable
		// identity) covers both ways the position can change.
		if (next === null) return;
		if (next.type !== 'columnheader') this.#lastRowIndex = this.#rows.indexOf(next.rowKey);
		if (next.type !== 'row') this.#lastColumnIndex = this.#navColumns.indexOf(next.columnId);
	}

	#rowElement(rowKey: string | undefined): HTMLElement | undefined {
		if (rowKey === undefined) return undefined;
		const domId = this.#collection.getDomId(rowKey);
		return domId === undefined ? undefined : this.#collection.getElement(domId);
	}

	#elementFor(target: FocusTarget): HTMLElement | undefined {
		switch (target.type) {
			case 'row':
				return this.#rowElement(target.rowKey);
			case 'cell':
				return this.#cellElements.get(this.#cellKey(target.rowKey, target.columnId));
			case 'columnheader':
				return this.#columnHeaderElements.get(target.columnId);
		}
	}

	#applyDomFocus(target: FocusTarget): void {
		this.#elementFor(target)?.focus(FOCUS_OPTS);
	}

	/**
	 * Down-grade a target the DOM cannot satisfy. A row may legitimately skip a
	 * cell — `<TableView.Cell>` binds by column id, not by markup position — and
	 * the delegate steps over the column list without knowing which cells were
	 * rendered. Row mode is always satisfiable: a rendered row always registers
	 * its `<tr>`. Keeping this in one place is what stops the identity from ever
	 * naming something with no element, which would leave the table with no
	 * `tabindex=0` anywhere and no way back in.
	 */
	#reachable(target: FocusTarget): FocusTarget | null {
		if (this.#elementFor(target) !== undefined) return target;
		if (target.type !== 'cell') return null;
		const row: FocusTarget = { type: 'row', rowKey: target.rowKey };
		return this.#elementFor(row) === undefined ? null : row;
	}

	/** Move the identity and the DOM focus together. */
	#focusTarget(target: FocusTarget): void {
		const reachable = this.#reachable(target);
		if (reachable === null) return;
		this.#setFocus(reachable);
		this.#applyDomFocus(reachable);
	}

	#firstEnabledRow(): string | null {
		return this.#rowKeys.find((key) => !this.isRowDisabled(key)) ?? null;
	}
	#lastEnabledRow(): string | null {
		const keys = this.#rowKeys;
		for (let i = keys.length - 1; i >= 0; i--) {
			if (!this.isRowDisabled(keys[i])) return keys[i];
		}
		return null;
	}

	/**
	 * The `<table>` itself took focus and nothing inside is aimed at yet: place
	 * the identity on the first enabled row, or the last when Tab arrived from
	 * after the table. The direction test is upstream's
	 * (`useSelectableCollection`'s focusin handler), plus a containment check —
	 * a `tabindex=-1` cell is still mouse-focusable, and Shift+Tab off one lands
	 * here with a relatedTarget the table *contains*. `compareDocumentPosition`
	 * reports a descendant as CONTAINED_BY|FOLLOWING, so without the check that
	 * reads as "arrived from after the table" and walks focus forward instead of
	 * letting it leave.
	 *
	 * With no enabled row — an empty table, every row disabled, or `isDisabled` —
	 * the column headers are the only thing left to operate, and they are how a
	 * filter that emptied the table gets cleared again. So the identity goes
	 * there instead of nowhere. Upstream reaches the same place by a different
	 * route: it forces every column header untabbable when the collection is
	 * empty (`useTableColumnHeader.ts:123-124`) and hands the grid the tab stop
	 * only if no tabbable child exists (`useGrid.ts:216-229`) — its column-menu
	 * buttons *are* tabbable children, so Tab still reaches them. Ours are not
	 * (the table is one tab stop), so the entry has to be deliberate.
	 */
	enterFromTab(relatedTarget: Node | null): void {
		if (this.#focus !== null) return;
		const table = this.#tableEl;
		const backward =
			relatedTarget !== null &&
			table !== null &&
			!table.contains(relatedTarget) &&
			(table.compareDocumentPosition(relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

		const rowKey = backward ? this.#lastEnabledRow() : this.#firstEnabledRow();
		if (rowKey !== null) {
			this.#focusTarget({ type: 'row', rowKey });
			this.announceRowFocus(rowKey);
			return;
		}

		// Declared columns only. The synthetic selection column is a nav stop but
		// not a place to start: with no enabled row there is nothing to select,
		// and the affordances a user comes here for hang off the real headers.
		const columns = this.#visibleColumns.items;
		const column = backward ? columns[columns.length - 1] : columns[0];
		if (column) this.#focusTarget({ type: 'columnheader', columnId: column.id });
	}

	/** Something inside the table took DOM focus. Fed by the wrapper's focusin. */
	noteDomFocus(): void {
		this.#hasBeenFocused = true;
	}

	/**
	 * Was DOM focus inside the table when the selection change happened?
	 *
	 * The live region only speaks for changes the user drove from here. A
	 * consumer that rewrites `selectedKeys` from a toolbar elsewhere on the page
	 * would otherwise make the table narrate someone else's UI. Upstream gates
	 * its selection announcement on the same question (`useGridSelectionAnnouncement`).
	 *
	 * The value is sampled before the change reaches the DOM, not read live at
	 * the point of asking, because the reader is a `$effect` and user effects run
	 * after reconciliation. A change that removes the focused row along with it
	 * leaves `document.activeElement` on `<body>` by then, so a live read would
	 * call the user's own deletion someone else's change and stay silent.
	 */
	get hadDomFocus(): boolean {
		return this.#hadDomFocus;
	}

	/**
	 * Does relocation owe the user a `.focus()` call?
	 *
	 * Answered on read rather than sampled beforehand, because the two events
	 * that would carry the answer do not. `focusout` fires for a removed element
	 * exactly as it does for a deliberate exit — null `relatedTarget`, target
	 * still reporting `isConnected` — and `$effect.pre` only runs during a
	 * traversal, so a change that dirties the row list from inside another
	 * effect's flush skips it entirely.
	 *
	 * So: focus still inside means relocation just moves it along; focus fallen
	 * to `<body>` means whatever held it stopped being focusable — removed, or
	 * turned disabled and dropped its tabindex — and nothing else claimed it.
	 *
	 * ponytail: also treats "user parked focus on bare page background, then the
	 * row they had been on changed" as ours, and pulls focus back into the
	 * table. Separating that needs to distinguish "the element stopped being
	 * focusable" from "the user left", which the DOM does not report.
	 */
	#shouldRestoreDomFocus(): boolean {
		if (!this.#hasBeenFocused) return false;
		if (this.#wrapperEl?.contains(document.activeElement)) return true;
		return document.activeElement === document.body;
	}

	/**
	 * The `<tr>` received focus on its own (click, AT, a programmatic move).
	 * `focus` does not bubble, so a cell taking focus never reaches here — which
	 * is exactly what keeps cell mode from collapsing back to row mode.
	 */
	setRowFocus(rowKey: string): void {
		this.#adoptDomFocus({ type: 'row', rowKey });
	}

	/**
	 * A cell or a column header received focus on its own. Cells and headers are
	 * `tabindex=-1`, which still makes them mouse-focusable, so a click has to
	 * move the identity as well — otherwise it stays wherever the keyboard last
	 * left it, and the next arrow key jumps somewhere unrelated.
	 */
	setCellFocus(rowKey: string, columnId: string): void {
		this.#adoptDomFocus({ type: 'cell', rowKey, columnId });
	}
	setColumnHeaderFocus(columnId: string): void {
		this.#adoptDomFocus({ type: 'columnheader', columnId });
	}

	// Also reached by our own `.focus()` calls, which have already set the
	// identity — hence the equality check rather than an unconditional write.
	#adoptDomFocus(target: FocusTarget): void {
		if (sameTarget(this.#focus, target)) return;
		this.#setFocus(target);
	}

	// ── focus relocation ───────────────────────────────────────
	#isDisabledTarget(f: FocusTarget): boolean {
		return f.type !== 'columnheader' && this.isRowDisabled(f.rowKey);
	}

	#reconcileFocus(rows: Ordered<string>, nav: Ordered<ColumnDescriptor>): void {
		const f = this.#focus;
		if (f === null) {
			this.#lastRowCount = rows.items.length;
			return;
		}
		if (this.#resolve(f, rows, nav) !== null && !this.#isDisabledTarget(f)) {
			// Still valid — just refresh where it sits, in case rows moved.
			if (f.type !== 'columnheader') this.#lastRowIndex = rows.indexOf(f.rowKey);
			if (f.type !== 'row') this.#lastColumnIndex = nav.indexOf(f.columnId);
			this.#lastRowCount = rows.items.length;
			return;
		}
		const next = this.#relocate(f, rows, nav);
		this.#lastRowCount = rows.items.length;
		this.#setFocus(next);
		// Writing `#focus` inside an effect means the tabindex reaches the DOM on
		// the next flush, so the element cannot be focused until after it.
		if (next !== null && this.#shouldRestoreDomFocus()) {
			void tick().then(() => this.#applyDomFocus(next));
		}
	}

	#relocate(
		f: FocusTarget,
		rows: Ordered<string>,
		nav: Ordered<ColumnDescriptor>
	): FocusTarget | null {
		// A column that no longer exists at the remembered index drops back to row
		// mode rather than sliding onto the last column — upstream does the same
		// when the old cell index overruns the new row (`useGridState`'s
		// `keyToFocus`).
		const columnId =
			this.#lastColumnIndex >= 0 && this.#lastColumnIndex < nav.items.length
				? nav.items[this.#lastColumnIndex].id
				: null;
		const rowKey = this.#relocateRow(rows);

		if (f.type === 'columnheader') {
			if (columnId !== null) return { type: 'columnheader', columnId };
			return rowKey === null ? null : { type: 'row', rowKey };
		}
		if (rowKey === null) return null;
		if (f.type === 'row' || columnId === null) return { type: 'row', rowKey };
		return { type: 'cell', rowKey, columnId };
	}

	/**
	 * Upstream's landing formula (`useGridState`): when more than one row went
	 * away, back up by the number removed so focus lands *ahead* of the deleted
	 * block. A plain clamp lands on whatever now occupies the old index — delete
	 * B, C, D out of A–E with focus on C and clamping puts you on E, while this
	 * puts you on A.
	 */
	#relocateRow(rows: Ordered<string>): string | null {
		const len = rows.items.length;
		if (len === 0) return null;
		const diff = this.#lastRowCount - len;
		const index = Math.min(
			diff > 1 ? Math.max(this.#lastRowIndex - diff + 1, 0) : this.#lastRowIndex,
			len - 1
		);
		for (let i = Math.max(index, 0); i < len; i++) {
			if (!this.isRowDisabled(rows.items[i])) return rows.items[i];
		}
		for (let i = index - 1; i >= 0; i--) {
			if (!this.isRowDisabled(rows.items[i])) return rows.items[i];
		}
		return null;
	}

	// ── element registration from Root ─────────────────────────
	// Passed as methods rather than `TableStateOptions` fields so tables built
	// directly in tests keep working without a DOM.
	registerWrapper(el: HTMLElement): () => void {
		this.#wrapperEl = el;
		return () => {
			if (this.#wrapperEl === el) this.#wrapperEl = null;
		};
	}
	registerTable(el: HTMLElement): () => void {
		this.#tableEl = el;
		return () => {
			if (this.#tableEl === el) this.#tableEl = null;
		};
	}

	/**
	 * PageUp / PageDown distance, in rows. The one supplier — both the keyboard
	 * delegate (cell mode) and the shared collection (row mode) read this, so a
	 * page is the same distance in either mode.
	 *
	 * It is an approximation. Upstream has no scalar page size: it fixes the
	 * page boundary in pixels and walks the row rects one at a time until it
	 * crosses (`GridKeyboardDelegate.getKeyPageAbove` / `Below`). A row count
	 * only matches that while every row is the same height, which
	 * `overflowMode: 'wrap'` breaks.
	 */
	#pageSize(): number {
		const wrapper = this.#wrapperEl;
		const rowHeight = this.#rowElement(this.#rowKeys[0])?.offsetHeight ?? 0;
		if (!wrapper || rowHeight <= 0) return DEFAULT_PAGE_SIZE;
		return Math.max(1, Math.floor(wrapper.clientHeight / rowHeight));
	}

	// ── selection input dispatch (used by <TableView.Row> click) ──
	selectFromInput(key: string, mods?: SelectionInputModifiers): void {
		this.#collection.selectFromInput(key, mods);
	}

	// ── keyboard ────────────────────────────────────────────────
	/**
	 * Row-level keydown. Handles cell-mode transitions (ArrowRight enters
	 * cell mode; ArrowUp on the first enabled row escapes to the column
	 * header) before falling through to the shared collection's row-mode
	 * navigation / selection logic.
	 *
	 * On Enter additionally:
	 *   - if the row is a link (`href`), dispatches a click on the row's
	 *     stretched `<a>` so the browser handles SvelteKit nav / target / etc;
	 *   - otherwise fires the per-row `onAction` (or table-level fallback).
	 * Space always toggles selection. Linked rows do NOT toggle selection on
	 * Enter (RAC `linkBehavior='override'` semantics).
	 */
	handleRowKeyDown(event: KeyboardEvent, rowKey: string): void {
		// Ctrl/Cmd+A. Handled here rather than in the shared collection (which is
		// constructed with `allowsSelectAll: false`) so row mode and cell mode
		// select the same set — the one derived from `items`, not from whichever
		// rows happen to be registered.
		if (
			(event.key === 'a' || event.key === 'A') &&
			(event.ctrlKey || event.metaKey) &&
			this.selectionMode === 'multiple'
		) {
			event.preventDefault();
			this.toggleSelectAll();
			return;
		}
		// Enter cell mode at the leading cell. Which physical arrow does that is
		// a function of the writing direction, so both go through the delegate
		// rather than ArrowRight being hardcoded as "forward".
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			const current: FocusTarget = { type: 'row', rowKey };
			const target =
				event.key === 'ArrowRight'
					? this.#delegate.getKeyRight(current)
					: this.#delegate.getKeyLeft(current);
			if (target) {
				event.preventDefault();
				this.#focusTarget(target);
			}
			return;
		}
		// ArrowUp on the first enabled row → column header.
		if (event.key === 'ArrowUp') {
			const target = this.#delegate.getKeyAbove({ type: 'row', rowKey });
			if (target?.type === 'columnheader') {
				event.preventDefault();
				this.#focusTarget(target);
				return;
			}
		}
		// Otherwise hand off to the existing row-mode pipeline.
		this.#handleRowModeKeyDown(event);
	}

	#handleRowModeKeyDown(event: KeyboardEvent): void {
		const activatedDomId = this.#collection.handleKeyDown(event);
		if (!activatedDomId) return;

		const value = this.#collection.getValue(activatedDomId);
		if (value === undefined) return;

		if (event.key === 'Enter') {
			const meta = this.#rowMeta.get(value);
			if (meta?.href) {
				const el = this.#collection.getElement(activatedDomId);
				const link = el?.querySelector<HTMLAnchorElement>('a[data-row-link]');
				link?.click();
				return;
			}
			if (meta?.onAction) meta.onAction();
			else this.#opts.onAction?.(value);
			// Selection toggle still rides along on Enter for non-linked rows
			// (matches Space + click).
			this.#collection.selectFromInput(value, {
				shiftKey: event.shiftKey,
				ctrlKey: event.ctrlKey,
				metaKey: event.metaKey
			});
			return;
		}

		this.#collection.selectFromInput(value, {
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			metaKey: event.metaKey
		});
	}

	/**
	 * Cell-level keydown. Arrow keys / Home / End / Page* delegate to
	 * `TableKeyboardDelegate`; Esc returns to row mode; Enter / Space dispatch
	 * action / selection on the parent row (mirrors row-mode semantics so the
	 * keyboard contract stays consistent regardless of focus mode).
	 */
	handleCellKeyDown(event: KeyboardEvent, rowKey: string, columnId: string): void {
		const current: FocusTarget = { type: 'cell', rowKey, columnId };
		let target: FocusTarget | null = null;

		switch (event.key) {
			case 'ArrowDown':
				target = this.#delegate.getKeyBelow(current);
				break;
			case 'ArrowUp':
				target = this.#delegate.getKeyAbove(current);
				break;
			case 'ArrowRight':
				target = this.#delegate.getKeyRight(current);
				break;
			case 'ArrowLeft':
				target = this.#delegate.getKeyLeft(current);
				break;
			case 'Home':
				target = this.#delegate.getFirstKey(current);
				break;
			case 'End':
				target = this.#delegate.getLastKey(current);
				break;
			case 'PageUp':
				target = this.#delegate.getKeyPageAbove(current);
				break;
			case 'PageDown':
				target = this.#delegate.getKeyPageBelow(current);
				break;
			case 'Escape':
				event.preventDefault();
				this.#focusTarget({ type: 'row', rowKey });
				return;
			case 'Enter': {
				event.preventDefault();
				const meta = this.#rowMeta.get(rowKey);
				if (meta?.href) {
					const rowDomId = this.#collection.getDomId(rowKey);
					const rowEl = rowDomId ? this.#collection.getElement(rowDomId) : null;
					const link = rowEl?.querySelector<HTMLAnchorElement>('a[data-row-link]');
					link?.click();
				} else if (meta?.onAction) {
					meta.onAction();
				} else {
					this.#opts.onAction?.(rowKey);
				}
				return;
			}
			case ' ':
				event.preventDefault();
				this.#collection.selectFromInput(rowKey, {
					shiftKey: event.shiftKey,
					ctrlKey: event.ctrlKey,
					metaKey: event.metaKey
				});
				return;
			case 'a':
			case 'A':
				if ((event.ctrlKey || event.metaKey) && this.selectionMode === 'multiple') {
					event.preventDefault();
					this.toggleSelectAll();
					return;
				}
			// Plain 'a' falls through to typeahead.
			// falls through
			default:
				if (isPrintable(event)) {
					event.preventDefault();
					this.#cellTypeahead.search(event.key);
				}
				return;
		}

		if (target) {
			event.preventDefault();
			this.#focusTarget(target);
		}
	}

	/**
	 * Column-header keydown. Arrow keys move between columns; ArrowDown drops
	 * into the first row at the same column; Enter / Space toggle sort on
	 * sortable columns (mirrors the existing click handler so keyboard /
	 * pointer have parity).
	 */
	handleColumnHeaderKeyDown(event: KeyboardEvent, columnId: string): void {
		const current: FocusTarget = { type: 'columnheader', columnId };
		let target: FocusTarget | null = null;

		switch (event.key) {
			case 'ArrowDown':
				// Alt+ArrowDown opens the column menu — the APG menu-button
				// gesture. The trigger is not a tab stop of its own (the table is
				// a single tab stop), so this is the keyboard's way in, and from
				// the menu's "Resize column" entry, into the resizer as well.
				// Upstream leaves the same hole open: `useGridCell` swallows
				// ArrowUp / ArrowDown for grid nav only `if (!e.altKey)`.
				if (event.altKey) {
					event.preventDefault();
					this.#openColumnMenu(columnId);
					return;
				}
				target = this.#delegate.getKeyBelow(current);
				break;
			case 'ArrowRight':
				target = this.#delegate.getKeyRight(current);
				break;
			case 'ArrowLeft':
				target = this.#delegate.getKeyLeft(current);
				break;
			case 'Home':
				target = this.#delegate.getFirstKey(current);
				break;
			case 'End':
				target = this.#delegate.getLastKey(current);
				break;
			case 'Enter':
			case ' ': {
				// The synthetic selection column header is the select-all
				// trigger when in multiple mode; in single mode it has no
				// activation behavior (just a focus stop, like the empty
				// header cell RAC renders).
				if (columnId === SELECTION_COLUMN_ID) {
					if (this.selectionMode === 'multiple') {
						event.preventDefault();
						this.toggleSelectAll();
					}
					return;
				}
				const col = this.getColumn(columnId);
				if (col?.allowsSorting) {
					event.preventDefault();
					this.toggleSort(columnId);
				}
				return;
			}
		}

		if (target) {
			event.preventDefault();
			this.#focusTarget(target);
		}
	}

	/**
	 * Click the column's menu trigger, if it renders one. Scoped to the
	 * registered `<th>`, so no second registry is needed for an element the
	 * header already owns.
	 */
	#openColumnMenu(columnId: string): void {
		this.#columnHeaderElements
			.get(columnId)
			?.querySelector<HTMLElement>('[data-spectrum-table-view-column-menu-trigger]')
			?.click();
	}

	/** Resolve the href for a row, if any (consumed by Row click handlers). */
	getRowHref(key: string): string | undefined {
		return this.#rowMeta.get(key)?.href;
	}

	// ── column filters ──────────────────────────────────────────
	// Filters are addressed by column id. The state is stored as an array on
	// the consumer side (matching the public `columnFilters` prop shape), but
	// internal lookups go through this small map for O(1) `getFilter`.
	#filterMap = $derived.by<ReadonlyMap<string, ColumnFilter>>(() => {
		const m = new Map<string, ColumnFilter>();
		for (const f of this.#opts.columnFilters) m.set(f.column, f);
		return m;
	});
	get columnFilters(): readonly ColumnFilter[] {
		return this.#opts.columnFilters;
	}
	getFilter(columnId: string): ColumnFilter | undefined {
		return this.#filterMap.get(columnId);
	}
	hasFilter(columnId: string): boolean {
		return this.#filterMap.has(columnId);
	}
	get hasAnyFilter(): boolean {
		return this.#opts.columnFilters.length > 0;
	}
	/**
	 * Replace this column's filter entry. Pass `undefined` (or an "empty"
	 * filter — empty text, both bounds null, no enum selection) to clear.
	 * Bounces back to the consumer via `setColumnFilters` so controlled
	 * tables stay in sync.
	 */
	setFilter(columnId: string, filter: ColumnFilter | undefined): void {
		const isEmpty = filter ? isEmptyFilter(filter) : true;
		const others = this.#opts.columnFilters.filter((f) => f.column !== columnId);
		const next = isEmpty || !filter ? others : [...others, filter];
		// No-op when nothing changed (avoid spurious onColumnFiltersChange and
		// unnecessary downstream re-derivations).
		if (
			next.length === this.#opts.columnFilters.length &&
			next.every((f, i) => f === this.#opts.columnFilters[i])
		) {
			return;
		}
		this.#opts.setColumnFilters(next);
	}
	clearFilter(columnId: string): void {
		this.setFilter(columnId, undefined);
	}
	clearAllFilters(): void {
		if (this.#opts.columnFilters.length === 0) return;
		this.#opts.setColumnFilters([]);
	}

	// ── column visibility ───────────────────────────────────────
	hideColumn(id: string): void {
		const col = this.#columns.get(id);
		// Refuse to hide when the column hasn't opted in; otherwise the consumer
		// gets a hidden column they can't restore through any first-class UI.
		if (!col?.allowsHiding) return;
		if (this.#opts.hiddenColumns.has(id)) return;
		const next = new Set(this.#opts.hiddenColumns);
		next.add(id);
		this.#opts.setHiddenColumns(next);
	}
	showColumn(id: string): void {
		if (!this.#opts.hiddenColumns.has(id)) return;
		const next = new Set(this.#opts.hiddenColumns);
		next.delete(id);
		this.#opts.setHiddenColumns(next);
	}

	// ── sort ────────────────────────────────────────────────────
	/**
	 * 2-way toggle (RAC parity): clicking the same column flips ascending ⇄
	 * descending. Clicking a new column starts at ascending. The "off" state
	 * is reachable programmatically (`setSortDescriptor(undefined)`) or via
	 * the Column Menu's explicit "Clear sort" item.
	 */
	toggleSort(columnId: string): void {
		const current = this.#opts.sortDescriptor;
		const direction =
			current?.column === columnId && current.direction === 'ascending'
				? 'descending'
				: 'ascending';
		this.#opts.setSortDescriptor({ column: columnId, direction });
	}
	setSortDescriptor(desc: SortDescriptor | undefined): void {
		this.#opts.setSortDescriptor(desc);
	}
	sortDirectionFor(columnId: string): SortDirection | undefined {
		const d = this.#opts.sortDescriptor;
		return d && d.column === columnId ? d.direction : undefined;
	}

	// ── select-all helpers (used by checkbox header) ───────────
	#selectableKeys = $derived.by(() =>
		this.#opts.isDisabled ? [] : this.#rowKeys.filter((k) => !this.#opts.disabledKeys.has(k))
	);
	get selectableKeys(): readonly string[] {
		return this.#selectableKeys;
	}
	get isAllSelected(): boolean {
		const sel = this.#selectableKeys;
		if (sel.length === 0) return false;
		return sel.every((k) => this.#opts.selectedKeys.has(k));
	}
	get isSomeSelected(): boolean {
		if (this.isAllSelected) return false;
		return this.#selectableKeys.some((k) => this.#opts.selectedKeys.has(k));
	}
	toggleSelectAll(): void {
		if (this.#opts.selectionMode !== 'multiple') return;
		if (this.isAllSelected) {
			if (this.#opts.disallowEmptySelection) return;
			this.#opts.setSelectedKeys(new Set());
		} else {
			this.#opts.setSelectedKeys(new Set(this.#selectableKeys));
		}
	}

	// ── live-region announcements ──────────────────────────────
	// Most screen readers don't natively announce selection / sort changes
	// in a `role="grid"` — RA works around this by piping textual updates
	// through a shared `aria-live` region. We mirror that contract: the
	// parent component owns a `$effect` that watches selection / sort and
	// calls these methods whenever the effective value changes.

	/**
	 * Announce filter changes for a single column. Single-column granularity
	 * (rather than diffing the whole filters array) matches the actual UI flow:
	 * the column-menu's Filter… popover only mutates one column at a time.
	 */
	announceFilterChange(columnId: string, applied: boolean): void {
		const columnName = this.#columnLabel(columnId);
		const message = applied
			? `Filter applied to ${columnName}`
			: `Filter cleared from ${columnName}`;
		this.#getAnnouncer()?.announce(message, 'polite', 500);
	}

	announceSortChange(desc: SortDescriptor | undefined): void {
		if (!desc) {
			// Column Menu's "Clear sort" lands here. Without an explicit
			// announcement the column header just silently flips back to
			// `aria-sort='none'`, which most screen readers ignore.
			this.#getAnnouncer()?.announce('Sort cleared', 'assertive', 500);
			return;
		}
		const columnName = this.#columnLabel(desc.column);
		this.#getAnnouncer()?.announce(
			`sorted by column ${columnName} in ${desc.direction} order`,
			'assertive',
			500
		);
	}

	/**
	 * Diff `prev` against `next` and announce the change. Single-key diffs
	 * read the row's label ("Foo selected" / "Foo not selected"); larger
	 * diffs (select-all, range extend, clear) collapse to a count
	 * ("3 items selected"). Skips announcement when there's nothing to say
	 * (no diff, or selection is unchanged).
	 */
	announceSelectionChange(prev: ReadonlySet<string>, next: ReadonlySet<string>): void {
		if (this.#opts.selectionMode === 'none') return;
		if (setsEqual(prev, next)) return;

		const added: string[] = [];
		const removed: string[] = [];
		for (const key of next) if (!prev.has(key)) added.push(key);
		for (const key of prev) if (!next.has(key)) removed.push(key);

		const messages: string[] = [];
		if (added.length === 1 && removed.length === 0) {
			const rowName = this.#rowLabel(added[0]);
			if (rowName) messages.push(`${rowName} selected`);
		} else if (removed.length === 1 && added.length === 0) {
			const rowName = this.#rowLabel(removed[0]);
			if (rowName) messages.push(`${rowName} not selected`);
		}

		// In multiple mode also announce the running count, except when the
		// single-item add/remove message above already conveys the state
		// fully (selection size is exactly 0 or 1 and we already named it).
		if (this.#opts.selectionMode === 'multiple') {
			const noNamedChange = messages.length === 0;
			const isBulk = next.size > 1 || prev.size > 1;
			if (noNamedChange || isBulk) {
				if (next.size === 0) {
					messages.push('Selection cleared');
				} else if (this.#selectableKeys.length > 0 && next.size === this.#selectableKeys.length) {
					messages.push('All items selected');
				} else if (next.size === 1) {
					messages.push('1 item selected');
				} else {
					messages.push(`${next.size} items selected`);
				}
			}
		}

		if (messages.length > 0) this.#getAnnouncer()?.announce(messages.join('. '));
	}

	announceRowFocus(rowKey: string): void {
		const index = this.#rows.indexOf(rowKey);
		if (index === -1) return;
		const total = this.#rowKeys.length;
		const rowName = this.#rowLabel(rowKey) || rowKey;
		this.#getAnnouncer()?.announce(`${rowName}, row ${index + 1} of ${total}`);
	}

	// ── column layout ────────────────────────────────────────────
	columnWidth(id: string): number {
		return this.#layout.getWidth(id);
	}
	columnMinWidth(id: string): number {
		return this.#layout.getMinWidth(id);
	}
	columnMaxWidth(id: string): number {
		return this.#layout.getMaxWidth(id);
	}
	get widths(): readonly number[] {
		return this.#layout.widths;
	}
	get resizingColumn(): string | null {
		return this.#layout.resizingColumn;
	}
	startResize(id: string): void {
		this.#layout.startResize(id);
	}
	endResize(): void {
		this.#layout.endResize();
	}
	resizeColumn(id: string, newWidth: number): void {
		this.#layout.resize(id, newWidth);
	}

	registerResizerInput(columnId: string, el: HTMLInputElement): () => void {
		this.#resizerInputs.set(columnId, el);
		return () => {
			if (this.#resizerInputs.get(columnId) === el) {
				this.#resizerInputs.delete(columnId);
			}
		};
	}
	focusResizer(columnId: string): void {
		this.#resizerInputs.get(columnId)?.focus();
	}

	#columnLabel(columnId: string): string {
		// The declared label, never the rendered `<th>` text: the header hosts
		// the column menu and the filter popover, so scraping it concatenates
		// whatever UI happens to be open.
		return this.#columns.get(columnId)?.label || columnId;
	}

	#rowLabel(rowKey: string): string {
		const explicit = this.#rowText.get(rowKey);
		if (explicit) return explicit;
		const fromCells = this.rowHeaderCellText(rowKey);
		if (fromCells) return fromCells;
		// Fall back to scraping the rowheader cell text. SelectableCollection
		// already stores `textValue` when Row passes it; this branch covers
		// the common case where the consumer didn't bother with an explicit
		// `textValue` prop.
		const domId = this.#collection.getDomId(rowKey);
		const rowEl = domId ? this.#collection.getElement(domId) : null;
		const rowheader = rowEl?.querySelector<HTMLElement>('th[scope="row"]');
		return rowheader?.textContent?.trim() ?? '';
	}

	#getAnnouncer() {
		if (typeof document === 'undefined') return null;
		return getAnnouncer(document);
	}
}

function sameTarget(a: FocusTarget | null, b: FocusTarget): boolean {
	if (a === null || a.type !== b.type) return false;
	switch (b.type) {
		case 'row':
			return a.type === 'row' && a.rowKey === b.rowKey;
		case 'cell':
			return a.type === 'cell' && a.rowKey === b.rowKey && a.columnId === b.columnId;
		case 'columnheader':
			return a.type === 'columnheader' && a.columnId === b.columnId;
	}
}

function setsEqual<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean {
	if (a === b) return true;
	if (a.size !== b.size) return false;
	for (const v of a) if (!b.has(v)) return false;
	return true;
}

/**
 * A filter is considered empty when the consumer hasn't supplied anything to
 * actually narrow the data: blank text, both number bounds null, or no enum
 * options selected. `setFilter` treats empty filters as a clear so the public
 * `columnFilters` array doesn't accumulate no-op entries.
 */
function isEmptyFilter(filter: ColumnFilter): boolean {
	switch (filter.type) {
		case 'text':
			return filter.value.trim().length === 0;
		case 'number':
			return filter.value.min === null && filter.value.max === null;
		case 'enum':
			return filter.value.length === 0;
	}
}

export interface RowRegistration {
	domId: string;
	value: string;
	el: HTMLElement;
	disabled: boolean;
	textValue: string;
	href?: string;
	onAction?: () => void;
}

/** Row order + identity, supplied by `<TableView.Body>`. */
export interface RowSource {
	readonly keys: readonly string[];
}

/** Column order + definitions, supplied by `<TableView.Header>`. */
export interface ColumnSource {
	readonly columns: readonly ColumnDescriptor[];
}
