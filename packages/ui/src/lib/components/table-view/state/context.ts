import { createContext } from 'svelte';
import type { TableState } from './table-state.svelte.js';

// Table-level context: shared by Header / Row / Cell.
export const [getTableContext, setTableContext] = createContext<TableState>();

// Row identity, established by <TableViewRowScope> around the consumer's row
// snippet. Separate from RowContext because it exists before <TableView.Row>
// renders and survives a snippet branching between different Row markups.
export type RowScope = {
	readonly key: string;
	/** 0-based position in the consumer's `items` array. */
	readonly index: number;
};

export const [getRowScope, setRowScope] = createContext<RowScope>();

// Row-level context: shared by Cell (learns whether the rowheader cell needs
// to render the stretched `<a>` overlay for row-level link behavior).
export type RowContext = {
	rowKey: string;
	// Stable DOM id for the row (`<tr>`). Used to derive deterministic per-cell
	// element ids without back-coordination from the cell to the row — the
	// rowheader cell becomes `${rowDomId}-cell-${columnId}` and the row's
	// `aria-labelledby` points at it.
	rowDomId: string;

	// When set, the rowheader Cell renders an `<a class="row-link-overlay">`
	// that stretches over the whole `<tr>` (via CSS `::after`).
	href?: string;
	target?: string;
	rel?: string;
	download?: string | boolean;
	textValue?: string;
};

export const [getRowContext, setRowContext] = createContext<RowContext>();
