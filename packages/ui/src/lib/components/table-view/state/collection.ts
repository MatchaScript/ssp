import type { ColumnFilterType, EnumFilterOption } from '../types.js';
import type { ColumnSize, ColumnStaticSize } from './column-layout.js';

/**
 * An ordered list plus its key index. `items` is the array itself (never
 * copied); `indexOf` / `get` are the only ways position and lookup enter the
 * rest of the code, so no caller has to write `findIndex` or handle a -1
 * subscript. Rows and columns use the same shape.
 */
export type Ordered<T> = {
	readonly items: readonly T[];
	/** Position of `key`, or -1 when unknown. */
	indexOf(key: string): number;
	/** The entry for `key`, or undefined when unknown. */
	get(key: string): T | undefined;
};

export function order<T>(items: readonly T[], keyOf: (item: T) => string): Ordered<T> {
	const index = new Map<string, number>();
	for (let i = 0; i < items.length; i++) index.set(keyOf(items[i]), i);
	return {
		items,
		indexOf: (key) => index.get(key) ?? -1,
		get: (key) => {
			const i = index.get(key);
			return i === undefined ? undefined : items[i];
		}
	};
}

export const EMPTY_ORDERED: Ordered<never> = order([], () => '');

// Runtime descriptor for a `<TableView.Row>` instance.
export type RowDescriptor = {
	key: string;
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
 * the row registry (`rows`, `selectableKeys`, etc).
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
