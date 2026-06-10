import type { ColumnFilterType, EnumFilterOption } from '../types.js';
import type { ColumnSize, ColumnStaticSize } from './column-layout.js';

// React Aria's `Node<T>` is the canonical shape for collections. Only 'row'
// nodes are built; the others are reserved for future shapes.
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
	// The row's `<tr>` element. Carried so the canonical row order can be
	// derived from DOM position (`compareDocumentPosition`) rather than mount
	// order — a keyed `{#each}` reorders the DOM without re-registering.
	el: HTMLElement;
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
	allowsResizing: boolean;
	align?: 'start' | 'center' | 'end';
	showDivider?: boolean;
	width?: ColumnSize;
	defaultWidth?: ColumnSize;
	minWidth?: ColumnStaticSize;
	maxWidth?: ColumnStaticSize;
	// Filter dispatcher metadata. `filterType` activates the menu's
	// "Filter…" entry and decides which input UI the popover renders.
	// `enumOptions` is consumed only by `filterType: 'enum'`.
	filterType?: ColumnFilterType;
	enumOptions?: EnumFilterOption[];
};

// Collection surface consumed by TableState.
export interface ITableCollection<T> {
	readonly size: number;
	readonly rows: ReadonlyArray<Node<T>>;
	readonly columns: ReadonlyArray<ColumnDescriptor>;
	getRow(key: string): Node<T> | undefined;
	getColumn(id: string): ColumnDescriptor | undefined;
}
