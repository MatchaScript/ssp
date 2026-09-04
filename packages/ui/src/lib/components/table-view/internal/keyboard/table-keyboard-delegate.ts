/**
 * Pure-logic 2D navigation for TableView. Mirrors `@react-aria/grid`'s
 * `GridKeyboardDelegate` + `@react-aria/table`'s `TableKeyboardDelegate`,
 * collapsed into a single class because Svelte's reactive registries already
 * give us flat row/column lists — we don't need RA's `ITableCollection`
 * traversal helpers.
 *
 * The delegate never touches the DOM. It takes the current focus position
 * and a key event, and returns the next position. Callers (`TableState`,
 * `<TableView.Row>` / `<TableView.Cell>` / `<TableView.Column>`) translate
 * that target back to a registered element and call `.focus()` exactly once.
 *
 * Disabled rows are skipped in both row and cell modes. Cells inherit their
 * row's disabled state — there is no per-cell disabling in the API.
 */
import type { FocusTarget, Ordered } from '../../state/collection.js';

export type { FocusTarget };

export interface TableKeyboardDelegateOptions {
	/** Row keys in consumer order. Disabled rows stay in the list (so indices match) but are skipped when navigating. */
	readonly rowKeys: () => readonly string[];
	/** Position of a row key, or -1. Backed by the row list's key index, so no caller scans. */
	readonly rowIndexOf: (key: string) => number;
	readonly isRowDisabled: (key: string) => boolean;
	/** Columns in nav order. The synthetic selection column is prepended whenever `selectionMode !== 'none'`. */
	readonly columns: () => Ordered<{ id: string }>;
	/**
	 * Logical order → visual order. The column list runs leading-edge first, so
	 * ArrowRight steps forward through it under `ltr` and backward under `rtl`.
	 * Required: a default here is a silent wrong answer in RTL.
	 */
	readonly direction: () => 'ltr' | 'rtl';
	/** PageUp / PageDown distance, in rows. Supplied by TableState alone. */
	readonly pageSize: () => number;
}

export class TableKeyboardDelegate {
	#opts: TableKeyboardDelegateOptions;

	constructor(opts: TableKeyboardDelegateOptions) {
		this.#opts = opts;
	}

	#rowKeys() {
		return this.#opts.rowKeys();
	}
	#columns() {
		return this.#opts.columns();
	}
	#isDisabled(key: string) {
		return this.#opts.isRowDisabled(key);
	}

	/** Step from `fromIdx` by `direction` (1 down, -1 up), skipping disabled rows. */
	#stepRow(fromIdx: number, direction: 1 | -1): string | null {
		const keys = this.#rowKeys();
		for (let i = fromIdx + direction; i >= 0 && i < keys.length; i += direction) {
			if (!this.#isDisabled(keys[i])) return keys[i];
		}
		return null;
	}

	/** Find the closest enabled row at or beyond `targetIdx` in `direction`. */
	#nearestEnabled(targetIdx: number, direction: 1 | -1): string | null {
		const keys = this.#rowKeys();
		const start = Math.max(0, Math.min(targetIdx, keys.length - 1));
		for (let i = start; direction === 1 ? i < keys.length : i >= 0; i += direction) {
			if (!this.#isDisabled(keys[i])) return keys[i];
		}
		// Fallback: try the other direction so callers always land somewhere
		// enabled if any enabled row exists.
		for (let i = start; direction === 1 ? i >= 0 : i < keys.length; i -= direction) {
			if (!this.#isDisabled(keys[i])) return keys[i];
		}
		return null;
	}

	#firstEnabledRow(): string | null {
		return this.#rowKeys().find((key) => !this.#isDisabled(key)) ?? null;
	}

	#lastEnabledRow(): string | null {
		const keys = this.#rowKeys();
		for (let i = keys.length - 1; i >= 0; i--) {
			if (!this.#isDisabled(keys[i])) return keys[i];
		}
		return null;
	}

	getKeyBelow(current: FocusTarget): FocusTarget | null {
		switch (current.type) {
			case 'columnheader': {
				const first = this.#firstEnabledRow();
				if (first === null) return null;
				// From column header, ArrowDown drops into the first cell of the
				// first enabled row (cell mode). RAC behavior.
				return { type: 'cell', rowKey: first, columnId: current.columnId };
			}
			case 'row': {
				const next = this.#stepRow(this.#opts.rowIndexOf(current.rowKey), 1);
				return next === null ? null : { type: 'row', rowKey: next };
			}
			case 'cell': {
				const next = this.#stepRow(this.#opts.rowIndexOf(current.rowKey), 1);
				return next === null ? null : { type: 'cell', rowKey: next, columnId: current.columnId };
			}
		}
	}

	getKeyAbove(current: FocusTarget): FocusTarget | null {
		switch (current.type) {
			case 'columnheader':
				return null;
			case 'row': {
				const prev = this.#stepRow(this.#opts.rowIndexOf(current.rowKey), -1);
				if (prev !== null) return { type: 'row', rowKey: prev };
				// At the first row, ArrowUp escapes to the column header. We
				// jump to the first column since a row-level focus has no
				// associated column index.
				const cols = this.#columns().items;
				return cols.length > 0 ? { type: 'columnheader', columnId: cols[0].id } : null;
			}
			case 'cell': {
				const prev = this.#stepRow(this.#opts.rowIndexOf(current.rowKey), -1);
				if (prev !== null) return { type: 'cell', rowKey: prev, columnId: current.columnId };
				return { type: 'columnheader', columnId: current.columnId };
			}
		}
	}

	getKeyRight(current: FocusTarget): FocusTarget | null {
		return this.#stepCol(current, this.#opts.direction() === 'rtl' ? -1 : 1);
	}

	getKeyLeft(current: FocusTarget): FocusTarget | null {
		return this.#stepCol(current, this.#opts.direction() === 'rtl' ? 1 : -1);
	}

	#stepCol(current: FocusTarget, direction: 1 | -1): FocusTarget | null {
		const cols = this.#columns();
		if (cols.items.length === 0) return null;

		switch (current.type) {
			case 'row': {
				// ArrowRight on a row enters cell mode at the first cell;
				// ArrowLeft on a row stays put (RAC: no left-of-row).
				if (direction === 1) {
					return { type: 'cell', rowKey: current.rowKey, columnId: cols.items[0].id };
				}
				return null;
			}
			case 'cell': {
				const idx = cols.indexOf(current.columnId);
				if (idx < 0) return null;
				const next = idx + direction;
				if (next < 0) {
					// Past the leading edge → drop back to row mode.
					return { type: 'row', rowKey: current.rowKey };
				}
				if (next >= cols.items.length) return null;
				return { type: 'cell', rowKey: current.rowKey, columnId: cols.items[next].id };
			}
			case 'columnheader': {
				const idx = cols.indexOf(current.columnId);
				if (idx < 0) return null;
				const next = idx + direction;
				if (next < 0 || next >= cols.items.length) return null;
				return { type: 'columnheader', columnId: cols.items[next].id };
			}
		}
	}

	getFirstKey(current: FocusTarget): FocusTarget | null {
		const cols = this.#columns().items;
		switch (current.type) {
			case 'columnheader':
				return cols.length > 0 ? { type: 'columnheader', columnId: cols[0].id } : null;
			case 'row': {
				const first = this.#firstEnabledRow();
				return first === null ? null : { type: 'row', rowKey: first };
			}
			case 'cell':
				// Home in cell mode: first cell of the current row (RAC).
				return cols.length > 0
					? { type: 'cell', rowKey: current.rowKey, columnId: cols[0].id }
					: null;
		}
	}

	getLastKey(current: FocusTarget): FocusTarget | null {
		const cols = this.#columns().items;
		switch (current.type) {
			case 'columnheader':
				return cols.length > 0
					? { type: 'columnheader', columnId: cols[cols.length - 1].id }
					: null;
			case 'row': {
				const last = this.#lastEnabledRow();
				return last === null ? null : { type: 'row', rowKey: last };
			}
			case 'cell':
				return cols.length > 0
					? { type: 'cell', rowKey: current.rowKey, columnId: cols[cols.length - 1].id }
					: null;
		}
	}

	getKeyPageBelow(current: FocusTarget): FocusTarget | null {
		const page = this.#opts.pageSize();
		switch (current.type) {
			case 'columnheader':
				return null;
			case 'row': {
				const idx = this.#opts.rowIndexOf(current.rowKey);
				if (idx < 0) return null;
				const target = this.#nearestEnabled(idx + page, -1);
				return target === null ? null : { type: 'row', rowKey: target };
			}
			case 'cell': {
				const idx = this.#opts.rowIndexOf(current.rowKey);
				if (idx < 0) return null;
				const target = this.#nearestEnabled(idx + page, -1);
				return target === null
					? null
					: { type: 'cell', rowKey: target, columnId: current.columnId };
			}
		}
	}

	getKeyPageAbove(current: FocusTarget): FocusTarget | null {
		const page = this.#opts.pageSize();
		switch (current.type) {
			case 'columnheader':
				return null;
			case 'row': {
				const idx = this.#opts.rowIndexOf(current.rowKey);
				if (idx < 0) return null;
				const target = this.#nearestEnabled(idx - page, 1);
				return target === null ? null : { type: 'row', rowKey: target };
			}
			case 'cell': {
				const idx = this.#opts.rowIndexOf(current.rowKey);
				if (idx < 0) return null;
				const target = this.#nearestEnabled(idx - page, 1);
				return target === null
					? null
					: { type: 'cell', rowKey: target, columnId: current.columnId };
			}
		}
	}
}
