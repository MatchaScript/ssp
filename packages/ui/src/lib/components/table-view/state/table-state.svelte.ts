/* eslint-disable svelte/prefer-svelte-reactivity --
 * Several Map/Set instances in this file are intentionally non-reactive
 * (DOM element bookkeeping, registration metadata) — making them SvelteMap
 * would close $derived feedback loops or just waste reactivity tracking.
 * TODO: Audit each site and re-enable for the ones that could be SvelteMap.
 */
import { SvelteMap } from 'svelte/reactivity';
import {
	SelectableCollection,
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
import type {
	ColumnDescriptor,
	ITableCollection,
	Node,
	RowDescriptor,
	RowMeta
} from './collection.js';
import {
	TableKeyboardDelegate,
	type FocusTarget
} from '../internal/keyboard/table-keyboard-delegate.js';
import { getAnnouncer } from '$lib/utils/announcer/index.js';

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

const SELECTION_COLUMN_DESCRIPTOR: ColumnDescriptor = {
	id: SELECTION_COLUMN_ID,
	isRowHeader: false,
	allowsSorting: false,
	allowsHiding: false
};

export interface TableStateOptions {
	// display
	readonly density: TableViewDensity;
	readonly isQuiet: boolean;
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

	// column visibility (Phase 6)
	readonly hiddenColumns: ReadonlySet<string>;
	readonly setHiddenColumns: (hidden: Set<string>) => void;

	// column filters (Phase 6.2)
	readonly columnFilters: readonly ColumnFilter[];
	readonly setColumnFilters: (filters: ColumnFilter[]) => void;

	// actions
	readonly onAction?: (key: string) => void;
}

/**
 * Owns the runtime state for a single TableView instance.
 *
 * Selection, roving focus, keyboard nav and typeahead are delegated to a shared
 * `SelectableCollection` (the same primitive ListView and Menu use). TableState
 * adds table-specific concerns on top: column registry, sort descriptor, row
 * metadata (rowData / Node tree), and the `onAction` dispatch on Enter.
 *
 * Both rows and columns are markup compositional — the corresponding
 * components register themselves on mount and unregister on unmount. The
 * SvelteMap insertion order is the source-order of the consumer's markup.
 */
export class TableState<TData> {
	#opts: TableStateOptions;
	#collection: SelectableCollection;

	#rowEntries = new SvelteMap<string, RowDescriptor<TData>>();
	// Non-reactive per-row metadata (href / onAction). See `RowMeta` doc for
	// why these are deliberately kept out of the reactive registry.
	#rowMeta = new Map<string, RowMeta>();
	#columnEntries = new SvelteMap<string, ColumnDescriptor>();

	// Cell + column-header element registries for 2D keyboard nav. Cells are
	// keyed by `${rowKey}|${columnId}`. The maps stay non-reactive — only
	// `.focus()` calls read from them, never `$derived`.
	#cellElements = new Map<string, HTMLElement>();
	#columnHeaderElements = new Map<string, HTMLElement>();

	// Cell-mode focus state. When set, the cell is the keyboard target
	// (tabindex=0) instead of the row. Row highlight (SelectableCollection)
	// stays in sync so selection / aria still reference the right row.
	#focusedCell: { rowKey: string; columnId: string } | null = $state(null);
	#focusedColumnHeader: string | null = $state(null);

	#delegate: TableKeyboardDelegate;

	constructor(opts: TableStateOptions) {
		this.#opts = opts;
		this.#collection = new SelectableCollection({
			get selectionMode() {
				return opts.selectionMode;
			},
			get selectedKeys() {
				return opts.selectedKeys as Set<string>;
			},
			// S2 hardcodes `selectionBehavior: 'toggle'` for TableView — checkbox
			// column is shown whenever selection is on, and clicks always toggle.
			selectionBehavior: 'toggle',
			shouldFocusWrap: false,
			get disallowEmptySelection() {
				return opts.disallowEmptySelection;
			},
			onSelectionChange: (keys) => opts.setSelectedKeys(keys)
		});
		this.#delegate = new TableKeyboardDelegate({
			rows: () =>
				[...this.#rowEntries.entries()].map(([key, entry]) => ({
					key,
					disabled:
						this.#opts.isDisabled || this.#opts.disabledKeys.has(key) || !!entry.isDisabled
				})),
			// Selection column is treated as the first column for nav purposes
			// whenever selection is enabled (RAC parity — see
			// `SELECTION_COLUMN_ID` doc). The synthetic descriptor is appended
			// to the registered user columns; cells / headers register under
			// `SELECTION_COLUMN_ID` so the delegate's index lookups land on
			// the right elements. Hidden columns drop out of the nav order so
			// arrow keys skip them — they're not focusable in the DOM either.
			columns: () =>
				this.#opts.selectionMode === 'none'
					? this.#visibleColumns
					: [SELECTION_COLUMN_DESCRIPTOR, ...this.#visibleColumns]
		});
	}

	// ── option pass-through ─────────────────────────────────────
	get density() {
		return this.#opts.density;
	}
	get isQuiet() {
		return this.#opts.isQuiet;
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
	// `#columns` is the canonical markup-order list. `#visibleColumns` filters
	// out columns the consumer has hidden — that's what AT and Header iterate
	// over, while `#columns` stays the source of truth for cell-to-column
	// resolution (cells are rendered in markup order regardless of hide state).
	#columns = $derived.by<ColumnDescriptor[]>(() => [...this.#columnEntries.values()]);
	#visibleColumns = $derived.by<ColumnDescriptor[]>(() =>
		this.#columns.filter((c) => !this.#opts.hiddenColumns.has(c.id))
	);
	get columns(): readonly ColumnDescriptor[] {
		return this.#columns;
	}
	get visibleColumns(): readonly ColumnDescriptor[] {
		return this.#visibleColumns;
	}
	getColumn(id: string): ColumnDescriptor | undefined {
		return this.#columnEntries.get(id);
	}
	isColumnHidden(id: string): boolean {
		return this.#opts.hiddenColumns.has(id);
	}
	/**
	 * 0-based index of `id` among the *visible* columns. Returns -1 when the
	 * column is hidden or unknown. Used to compute `aria-colindex` (which is
	 * defined against the visible column set, not markup order).
	 */
	visibleColumnIndex(id: string): number {
		return this.#visibleColumns.findIndex((c) => c.id === id);
	}

	// ── derived collection (Phase 0: rows + columns) ───────────
	// Collection exposes visible columns only — that's what Header iterates
	// over and what aria-colcount reflects. Cells still resolve their column
	// via `tableState.columns[markupIndex]` (see `<TableView.Cell>`).
	get collection(): ITableCollection<TData> {
		const rowNodes: Node<TData>[] = [];
		let i = 0;
		for (const [key, entry] of this.#rowEntries) {
			rowNodes.push({
				type: 'row',
				key,
				index: i++,
				level: 0,
				textValue: entry.textValue,
				rowData: entry.rowData
			});
		}
		const columns = this.#visibleColumns;
		return {
			size: rowNodes.length,
			rows: rowNodes,
			columns,
			getRow: (key) => rowNodes.find((r) => r.key === key),
			getColumn: (id) => this.#columnEntries.get(id)
		};
	}

	// ── row registration (called from <TableView.Row>) ─────────
	// Two parallel registries:
	//   • #rowEntries: TableView-specific metadata (rowData, textValue) used by
	//     the collection getter and the select-all helper.
	//   • SelectableCollection: the focusable element + selection / keyboard /
	//     typeahead state (shared with Menu / ListView).
	registerRow(reg: RowRegistration<TData>): () => void {
		this.#rowEntries.set(reg.value, {
			key: reg.value,
			rowData: reg.rowData,
			textValue: reg.textValue,
			isDisabled: reg.disabled
		});
		this.#rowMeta.set(reg.value, { href: reg.href, onAction: reg.onAction });
		const unregister = this.#collection.registerItem({
			domId: reg.domId,
			value: reg.value,
			el: reg.el,
			disabled: reg.disabled,
			textValue: reg.textValue
		});
		return () => {
			this.#rowEntries.delete(reg.value);
			this.#rowMeta.delete(reg.value);
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
		this.#collection.updateItem(domId, updates);
	}

	// ── column registration (called from <TableView.Column>) ───
	registerColumn(descriptor: ColumnDescriptor): void {
		this.#columnEntries.set(descriptor.id, descriptor);
	}
	unregisterColumn(id: string): void {
		this.#columnEntries.delete(id);
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

	// ── focus-target queries (driven by 2D nav state) ──────────
	isCellFocused(rowKey: string, columnId: string): boolean {
		const f = this.#focusedCell;
		return f !== null && f.rowKey === rowKey && f.columnId === columnId;
	}
	isColumnHeaderFocused(columnId: string): boolean {
		return this.#focusedColumnHeader === columnId;
	}
	get focusedCell(): { rowKey: string; columnId: string } | null {
		return this.#focusedCell;
	}
	get focusedColumnHeader(): string | null {
		return this.#focusedColumnHeader;
	}
	/** True when a cell or a column header currently owns the keyboard. */
	get isCellModeActive(): boolean {
		return this.#focusedCell !== null || this.#focusedColumnHeader !== null;
	}

	// ── helpers ─────────────────────────────────────────────────
	isSelected(key: string): boolean {
		return this.#collection.isSelected(key);
	}
	isRowDisabled(key: string): boolean {
		return this.#opts.isDisabled || this.#opts.disabledKeys.has(key);
	}
	isFocused(domId: string): boolean {
		return this.#collection.highlightedId === domId;
	}
	get focusedKey(): string | null {
		const id = this.#collection.highlightedId;
		return id === null ? null : (this.#collection.getValue(id) ?? null);
	}

	// ── focus control (used by <TableView.Root> on focusin) ────
	focusFirst(opts?: { focusVisible?: boolean }): void {
		this.#focusedCell = null;
		this.#focusedColumnHeader = null;
		this.#collection.focusFirst(opts);
	}
	/**
	 * Called from `<tr onfocus>`. Clears cell-mode state so an explicit
	 * row focus (Tab-in, row click) collapses any prior cell selection
	 * back to row mode.
	 */
	syncHighlight(domId: string | null): void {
		this.#focusedCell = null;
		this.#focusedColumnHeader = null;
		this.#collection.syncHighlight(domId);
	}

	// ── selection input dispatch (used by <TableView.Row> click) ──
	selectFromInput(key: string, mods?: SelectionInputModifiers): void {
		this.#collection.selectFromInput(key, mods);
	}

	// ── keyboard ────────────────────────────────────────────────
	/**
	 * Move keyboard focus to a `(row | cell | columnheader)` target. Updates
	 * the corresponding `#focused*` slots and calls `.focus()` on the
	 * registered element exactly once. Row highlight stays in sync when
	 * entering cell mode so selection / aria still reference the right row.
	 */
	#focusTarget(target: FocusTarget): void {
		switch (target.type) {
			case 'row': {
				this.#focusedCell = null;
				this.#focusedColumnHeader = null;
				const domId = this.#collection.getDomId(target.rowKey);
				if (!domId) return;
				this.#collection.highlight(domId, { focusVisible: true });
				return;
			}
			case 'cell': {
				this.#focusedColumnHeader = null;
				this.#focusedCell = { rowKey: target.rowKey, columnId: target.columnId };
				const rowDomId = this.#collection.getDomId(target.rowKey);
				if (rowDomId) this.#collection.syncHighlight(rowDomId);
				const el = this.#cellElements.get(this.#cellKey(target.rowKey, target.columnId));
				el?.focus(FOCUS_OPTS);
				return;
			}
			case 'columnheader': {
				this.#focusedCell = null;
				this.#focusedColumnHeader = target.columnId;
				const el = this.#columnHeaderElements.get(target.columnId);
				el?.focus(FOCUS_OPTS);
				return;
			}
		}
	}

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
		// ArrowRight on a row → enter cell mode at the first cell.
		if (event.key === 'ArrowRight') {
			const target = this.#delegate.getKeyRight({ type: 'row', rowKey });
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
	 *
	 * Letter-key typeahead is NOT handled here — RA's behavior is to hijack
	 * letter keys in cell mode too, but Phase 4 keeps typeahead row-mode-only
	 * to avoid stealing input from cell-embedded TextField / NumberField.
	 * Phase 5 will revisit when announce + textValue improvements land.
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

	/** Resolve the href for a row, if any (consumed by Row click handlers). */
	getRowHref(key: string): string | undefined {
		return this.#rowMeta.get(key)?.href;
	}

	// ── column filters (Phase 6.2) ─────────────────────────────
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

	// ── column visibility (Phase 6) ────────────────────────────
	hideColumn(id: string): void {
		const col = this.#columnEntries.get(id);
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
	 * is reachable only programmatically (`setSortDescriptor(undefined)`) —
	 * Phase 6 Column Menu will expose it as an explicit "Clear sort" item.
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
		[...this.#rowEntries.keys()].filter((k) => !this.#opts.disabledKeys.has(k))
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
	//
	// Strings are English-only for now. Phase 6 i18n work will move them to
	// a string formatter once we settle on a localization story for SSP.

	/**
	 * Announce filter changes for a single column. Single-column granularity
	 * (rather than diffing the whole filters array) matches the actual UI flow:
	 * the column-menu's Filter… popover only mutates one column at a time.
	 */
	announceFilterChange(columnId: string, applied: boolean): void {
		const label = this.#columnLabel(columnId);
		this.#getAnnouncer()?.announce(
			applied ? `Filter applied to ${label}` : `Filter cleared from ${label}`,
			'polite',
			500
		);
	}

	announceSortChange(desc: SortDescriptor | undefined): void {
		if (!desc) {
			// Phase 6: Column Menu's Clear sort lands here. Without an explicit
			// announcement the column header just silently flips back to
			// `aria-sort='none'`, which most screen readers ignore.
			this.#getAnnouncer()?.announce('Sort cleared', 'assertive', 500);
			return;
		}
		const label = this.#columnLabel(desc.column);
		this.#getAnnouncer()?.announce(`Sorted by ${label}, ${desc.direction}`, 'assertive', 500);
	}

	/**
	 * Diff `prev` against `next` and announce the change. Single-key diffs
	 * read the row's label ("Foo selected" / "Foo not selected"); larger
	 * diffs (select-all, range extend, clear) collapse to a count
	 * ("3 items selected"). Skips announcement when there's nothing to say
	 * (no diff, or selection is unchanged).
	 */
	announceSelectionChange(
		prev: ReadonlySet<string>,
		next: ReadonlySet<string>
	): void {
		if (this.#opts.selectionMode === 'none') return;
		if (setsEqual(prev, next)) return;

		const added: string[] = [];
		const removed: string[] = [];
		for (const key of next) if (!prev.has(key)) added.push(key);
		for (const key of prev) if (!next.has(key)) removed.push(key);

		const messages: string[] = [];
		if (added.length === 1 && removed.length === 0) {
			const label = this.#rowLabel(added[0]);
			if (label) messages.push(`${label} selected`);
		} else if (removed.length === 1 && added.length === 0) {
			const label = this.#rowLabel(removed[0]);
			if (label) messages.push(`${label} not selected`);
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

	#columnLabel(columnId: string): string {
		const el = this.#columnHeaderElements.get(columnId);
		const text = el?.textContent?.trim();
		// Fall back to the id when the column header hasn't rendered yet
		// (e.g. announce fired before $effect ran) or when the header is
		// hidden — the id is at least somewhat meaningful to the consumer.
		return text || columnId;
	}

	#rowLabel(rowKey: string): string {
		const entry = this.#rowEntries.get(rowKey);
		if (entry?.textValue) return entry.textValue;
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

export interface RowRegistration<T> {
	domId: string;
	value: string;
	el: HTMLElement;
	disabled: boolean;
	textValue: string;
	rowData: T;
	href?: string;
	onAction?: () => void;
}
