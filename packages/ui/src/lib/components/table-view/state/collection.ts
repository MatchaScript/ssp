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

/**
 * Where the keyboard is pointed. Row, cell and column-header are three shapes of
 * one value rather than three independent flags, so there is never a pair of
 * "is a cell focused" / "is a header focused" answers to reconcile after the
 * fact — and an identity that stops resolving takes the whole target with it.
 */
export type FocusTarget =
	| { type: 'row'; rowKey: string }
	| { type: 'cell'; rowKey: string; columnId: string }
	| { type: 'columnheader'; columnId: string };

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

// One column. Supplied as an array on `<TableView.Header columns>`; the array
// order is the column order for the header, the colgroup and `aria-colindex`
// alike.
export type ColumnDescriptor = {
	id: string;
	/**
	 * Header text. Also the name the live region announces for this column, so
	 * it is a string rather than markup — scraping the `<th>` would pick up the
	 * column menu and filter UI that render inside it.
	 */
	label: string;
	isRowHeader?: boolean;
	allowsSorting?: boolean;
	allowsHiding?: boolean;
	allowsResizing?: boolean;
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
