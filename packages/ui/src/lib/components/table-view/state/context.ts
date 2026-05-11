import { createContext } from 'svelte';
import type { TableState } from './table-state.svelte.js';

// Table-level context: shared by Header / Row / Cell.
// `unknown` here so Root can use any TData; consumers cast at the boundary.
export const [getTableContext, setTableContext] = createContext<TableState<unknown>>();

// Row-level context: shared by Cell (looks up its column index, and learns
// whether the rowheader cell needs to render the stretched `<a>` overlay
// for row-level link behavior).
export type RowContext = {
	rowKey: string;
	// Stable DOM id for the row (`<tr>`). Used to derive deterministic per-cell
	// element ids without back-coordination from the cell to the row — the
	// rowheader cell becomes `${rowDomId}-cell-${columnId}` and the row's
	// `aria-labelledby` points at it.
	rowDomId: string;
	getNextCellIndex: () => number;

	// When set, the rowheader Cell renders an `<a class="row-link-overlay">`
	// that stretches over the whole `<tr>` (via CSS `::after`).
	href?: string;
	target?: string;
	rel?: string;
	download?: string | boolean;
	textValue?: string;
};

export const [getRowContext, setRowContext] = createContext<RowContext>();
