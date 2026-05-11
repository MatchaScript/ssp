import type { ColumnFilterType, EnumFilterOption } from '../types.js';

// React Aria's `Node<T>` is the canonical shape for collections. Phase 0 only
// uses `row` nodes; `column` / `cell` are forward-declared so subsequent phases
// can extend without changing the shape.
export type NodeType = 'row' | 'column' | 'cell' | 'header' | 'body';

export type Node<T> = {
	type: NodeType;
	key: string;
	index: number;
	parentKey?: string;
	level: number;
	textValue?: string;
	rowData?: T;
};

export type RowDescriptor<T> = {
	key: string;
	rowData: T;
	textValue?: string;
	isDisabled?: boolean;
};

/**
 * Non-reactive per-row metadata used only inside event handlers. Kept out of
 * the reactive `RowDescriptor` because `onAction` is typically an inline
 * closure that gets a fresh identity on every parent render — storing it in
 * a SvelteMap would close a feedback loop with anything that derives from
 * the row registry (`collection`, `selectableKeys`, etc).
 */
export type RowMeta = {
	href?: string;
	onAction?: () => void;
};

// Runtime descriptor for a `<TableView.Column>` instance. Children (= header
// label) are rendered by the Column component itself; only metadata flows into
// state for cells / rows / sort UI to consume.
export type ColumnDescriptor = {
	id: string;
	isRowHeader: boolean;
	allowsSorting: boolean;
	allowsHiding: boolean;
	align?: 'start' | 'center' | 'end';
	showDivider?: boolean;
	width?: number | string;
	minWidth?: number;
	maxWidth?: number;
	// Filter dispatcher metadata (Phase 6.2). `filterType` activates the menu's
	// "Filter…" entry and decides which input UI the popover renders.
	// `enumOptions` is consumed only by `filterType: 'enum'`.
	filterType?: ColumnFilterType;
	enumOptions?: EnumFilterOption[];
};

// Minimal collection surface used by Phase 0. Later phases extend with
// `getKeyBefore` / `getKeyAfter` / `headerRows` / `rowHeaderColumnKeys`.
export interface ITableCollection<T> {
	readonly size: number;
	readonly rows: ReadonlyArray<Node<T>>;
	readonly columns: ReadonlyArray<ColumnDescriptor>;
	getRow(key: string): Node<T> | undefined;
	getColumn(id: string): ColumnDescriptor | undefined;
}
