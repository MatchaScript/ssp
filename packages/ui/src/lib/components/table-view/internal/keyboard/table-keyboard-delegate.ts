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
export type FocusTarget =
	| { type: 'row'; rowKey: string }
	| { type: 'cell'; rowKey: string; columnId: string }
	| { type: 'columnheader'; columnId: string };

export interface TableKeyboardDelegateOptions {
	/** Rows in markup order. Disabled rows stay in the list (so indices match) but are skipped when navigating. */
	readonly rows: () => readonly { key: string; disabled: boolean }[];
	/** Columns in markup order. The checkbox column is NOT included here. */
	readonly columns: () => readonly { id: string }[];
	/** Default 10. Used for PageUp / PageDown. */
	readonly pageSize?: () => number;
}

export class TableKeyboardDelegate {
	#opts: TableKeyboardDelegateOptions;

	constructor(opts: TableKeyboardDelegateOptions) {
		this.#opts = opts;
	}

	#rows() {
		return this.#opts.rows();
	}
	#columns() {
		return this.#opts.columns();
	}
	#pageSize() {
		return this.#opts.pageSize?.() ?? 10;
	}

	#rowIndex(key: string): number {
		return this.#rows().findIndex((r) => r.key === key);
	}
	#colIndex(id: string): number {
		return this.#columns().findIndex((c) => c.id === id);
	}

	/** Step from `fromIdx` by `direction` (1 down, -1 up), skipping disabled rows. */
	#stepRow(fromIdx: number, direction: 1 | -1): { key: string; index: number } | null {
		const rows = this.#rows();
		for (let i = fromIdx + direction; i >= 0 && i < rows.length; i += direction) {
			if (!rows[i].disabled) return { key: rows[i].key, index: i };
		}
		return null;
	}

	/** Find the closest enabled row at or beyond `targetIdx` in `direction`. */
	#nearestEnabled(targetIdx: number, direction: 1 | -1): { key: string; index: number } | null {
		const rows = this.#rows();
		const start = Math.max(0, Math.min(targetIdx, rows.length - 1));
		for (
			let i = start;
			direction === 1 ? i < rows.length : i >= 0;
			i += direction
		) {
			if (!rows[i].disabled) return { key: rows[i].key, index: i };
		}
		// Fallback: try the other direction so callers always land somewhere
		// enabled if any enabled row exists.
		for (
			let i = start;
			direction === 1 ? i >= 0 : i < rows.length;
			i -= direction
		) {
			if (!rows[i].disabled) return { key: rows[i].key, index: i };
		}
		return null;
	}

	#firstEnabledRow(): { key: string; index: number } | null {
		const rows = this.#rows();
		for (let i = 0; i < rows.length; i++) {
			if (!rows[i].disabled) return { key: rows[i].key, index: i };
		}
		return null;
	}

	#lastEnabledRow(): { key: string; index: number } | null {
		const rows = this.#rows();
		for (let i = rows.length - 1; i >= 0; i--) {
			if (!rows[i].disabled) return { key: rows[i].key, index: i };
		}
		return null;
	}

	getKeyBelow(current: FocusTarget): FocusTarget | null {
		switch (current.type) {
			case 'columnheader': {
				const first = this.#firstEnabledRow();
				if (!first) return null;
				// From column header, ArrowDown drops into the first cell of the
				// first enabled row (cell mode). RAC behavior.
				return { type: 'cell', rowKey: first.key, columnId: current.columnId };
			}
			case 'row': {
				const next = this.#stepRow(this.#rowIndex(current.rowKey), 1);
				return next ? { type: 'row', rowKey: next.key } : null;
			}
			case 'cell': {
				const next = this.#stepRow(this.#rowIndex(current.rowKey), 1);
				return next ? { type: 'cell', rowKey: next.key, columnId: current.columnId } : null;
			}
		}
	}

	getKeyAbove(current: FocusTarget): FocusTarget | null {
		switch (current.type) {
			case 'columnheader':
				return null;
			case 'row': {
				const prev = this.#stepRow(this.#rowIndex(current.rowKey), -1);
				if (prev) return { type: 'row', rowKey: prev.key };
				// At the first row, ArrowUp escapes to the column header. We
				// jump to the first column since a row-level focus has no
				// associated column index.
				const cols = this.#columns();
				return cols.length > 0 ? { type: 'columnheader', columnId: cols[0].id } : null;
			}
			case 'cell': {
				const prev = this.#stepRow(this.#rowIndex(current.rowKey), -1);
				if (prev) return { type: 'cell', rowKey: prev.key, columnId: current.columnId };
				return { type: 'columnheader', columnId: current.columnId };
			}
		}
	}

	getKeyRight(current: FocusTarget, direction: 'ltr' | 'rtl' = 'ltr'): FocusTarget | null {
		return direction === 'rtl' ? this.#stepCol(current, -1) : this.#stepCol(current, 1);
	}

	getKeyLeft(current: FocusTarget, direction: 'ltr' | 'rtl' = 'ltr'): FocusTarget | null {
		return direction === 'rtl' ? this.#stepCol(current, 1) : this.#stepCol(current, -1);
	}

	#stepCol(current: FocusTarget, direction: 1 | -1): FocusTarget | null {
		const cols = this.#columns();
		if (cols.length === 0) return null;

		switch (current.type) {
			case 'row': {
				// ArrowRight on a row enters cell mode at the first cell;
				// ArrowLeft on a row stays put (RAC: no left-of-row).
				if (direction === 1) {
					return { type: 'cell', rowKey: current.rowKey, columnId: cols[0].id };
				}
				return null;
			}
			case 'cell': {
				const idx = this.#colIndex(current.columnId);
				if (idx < 0) return null;
				const next = idx + direction;
				if (next < 0) {
					// Past the leading edge → drop back to row mode.
					return { type: 'row', rowKey: current.rowKey };
				}
				if (next >= cols.length) return null;
				return { type: 'cell', rowKey: current.rowKey, columnId: cols[next].id };
			}
			case 'columnheader': {
				const idx = this.#colIndex(current.columnId);
				if (idx < 0) return null;
				const next = idx + direction;
				if (next < 0 || next >= cols.length) return null;
				return { type: 'columnheader', columnId: cols[next].id };
			}
		}
	}

	getFirstKey(current: FocusTarget): FocusTarget | null {
		const cols = this.#columns();
		switch (current.type) {
			case 'columnheader':
				return cols.length > 0 ? { type: 'columnheader', columnId: cols[0].id } : null;
			case 'row': {
				const first = this.#firstEnabledRow();
				return first ? { type: 'row', rowKey: first.key } : null;
			}
			case 'cell':
				// Home in cell mode: first cell of the current row (RAC).
				return cols.length > 0
					? { type: 'cell', rowKey: current.rowKey, columnId: cols[0].id }
					: null;
		}
	}

	getLastKey(current: FocusTarget): FocusTarget | null {
		const cols = this.#columns();
		switch (current.type) {
			case 'columnheader':
				return cols.length > 0
					? { type: 'columnheader', columnId: cols[cols.length - 1].id }
					: null;
			case 'row': {
				const last = this.#lastEnabledRow();
				return last ? { type: 'row', rowKey: last.key } : null;
			}
			case 'cell':
				return cols.length > 0
					? { type: 'cell', rowKey: current.rowKey, columnId: cols[cols.length - 1].id }
					: null;
		}
	}

	getKeyPageBelow(current: FocusTarget): FocusTarget | null {
		const page = this.#pageSize();
		switch (current.type) {
			case 'columnheader':
				return null;
			case 'row': {
				const idx = this.#rowIndex(current.rowKey);
				if (idx < 0) return null;
				const target = this.#nearestEnabled(idx + page, -1);
				return target ? { type: 'row', rowKey: target.key } : null;
			}
			case 'cell': {
				const idx = this.#rowIndex(current.rowKey);
				if (idx < 0) return null;
				const target = this.#nearestEnabled(idx + page, -1);
				return target
					? { type: 'cell', rowKey: target.key, columnId: current.columnId }
					: null;
			}
		}
	}

	getKeyPageAbove(current: FocusTarget): FocusTarget | null {
		const page = this.#pageSize();
		switch (current.type) {
			case 'columnheader':
				return null;
			case 'row': {
				const idx = this.#rowIndex(current.rowKey);
				if (idx < 0) return null;
				const target = this.#nearestEnabled(idx - page, 1);
				return target ? { type: 'row', rowKey: target.key } : null;
			}
			case 'cell': {
				const idx = this.#rowIndex(current.rowKey);
				if (idx < 0) return null;
				const target = this.#nearestEnabled(idx - page, 1);
				return target
					? { type: 'cell', rowKey: target.key, columnId: current.columnId }
					: null;
			}
		}
	}
}
