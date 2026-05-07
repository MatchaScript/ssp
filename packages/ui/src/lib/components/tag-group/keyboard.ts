import type { TagGroupSelectionMode } from './types.js';

export type CellId = 'content' | 'remove';

/**
 * Minimal keyboard-event interface consumed by the handlers.
 * Satisfied by the browser's `KeyboardEvent` and by plain objects in tests.
 */
export interface KeyboardEventLike {
	readonly key: string;
	readonly shiftKey: boolean;
	readonly ctrlKey: boolean;
	readonly metaKey: boolean;
	readonly altKey: boolean;
}

export type FocusTarget =
	| { kind: 'row'; rowKey: string }
	| { kind: 'cell'; rowKey: string; cellId: CellId };

export interface KeyboardModifiers {
	readonly shift: boolean;
	readonly ctrlOrMeta: boolean;
}

export interface RowDescriptor {
	readonly key: string;
	readonly disabled: boolean;
	readonly isLink: boolean;
}

export interface RowKeydownContext {
	readonly rows: readonly RowDescriptor[];
	readonly currentRowKey: string;
	readonly dir: 'ltr' | 'rtl';
	readonly hasRemoveButton: (rowKey: string) => boolean;
	readonly selectionMode: TagGroupSelectionMode;
	readonly allowsSelectAll: boolean;
}

export interface CellKeydownContext extends RowKeydownContext {
	readonly currentCellId: CellId;
}

export type KeyboardOutcome =
	| { type: 'focus'; target: FocusTarget }
	| { type: 'select'; rowKey: string; modifiers: KeyboardModifiers }
	| { type: 'activateLink'; rowKey: string; modifiers: KeyboardModifiers }
	| { type: 'remove'; rowKey: string }
	| { type: 'selectAll' }
	| { type: 'clearSelection' }
	| { type: 'typeahead'; key: string }
	| null;

// ── direction-aware key resolution ──────────────────────────────
//
// `nextKey` / `prevKey` resolve to the key string that means "step toward the
// end" / "step toward the start" given the page direction. In horizontal
// orientation (TagGroup's only mode for v1), rtl flips left and right.

function nextKey(dir: 'ltr' | 'rtl'): 'ArrowRight' | 'ArrowLeft' {
	return dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
}

function prevKey(dir: 'ltr' | 'rtl'): 'ArrowRight' | 'ArrowLeft' {
	return dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
}

// ── row navigation helpers ──────────────────────────────────────

function rowIndex(rows: readonly RowDescriptor[], key: string): number {
	return rows.findIndex((r) => r.key === key);
}

function findEnabled(
	rows: readonly RowDescriptor[],
	from: number,
	step: 1 | -1
): RowDescriptor | null {
	for (let i = from; i >= 0 && i < rows.length; i += step) {
		if (!rows[i].disabled) return rows[i];
	}
	return null;
}

function firstEnabled(rows: readonly RowDescriptor[]): RowDescriptor | null {
	return findEnabled(rows, 0, 1);
}

function lastEnabled(rows: readonly RowDescriptor[]): RowDescriptor | null {
	return findEnabled(rows, rows.length - 1, -1);
}

function modifiers(e: KeyboardEventLike): KeyboardModifiers {
	return { shift: e.shiftKey, ctrlOrMeta: e.ctrlKey || e.metaKey };
}

function isPrintable(e: KeyboardEventLike): boolean {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
}

// ── public handlers ─────────────────────────────────────────────

export function handleTagRowKeydown(
	event: KeyboardEventLike,
	ctx: RowKeydownContext
): KeyboardOutcome {
	const idx = rowIndex(ctx.rows, ctx.currentRowKey);
	const next = nextKey(ctx.dir);
	const prev = prevKey(ctx.dir);

	switch (event.key) {
		case next: {
			const target = findEnabled(ctx.rows, idx + 1, 1);
			if (!target) return null;
			return { type: 'focus', target: { kind: 'row', rowKey: target.key } };
		}
		case prev: {
			const target = findEnabled(ctx.rows, idx - 1, -1);
			if (!target) return null;
			return { type: 'focus', target: { kind: 'row', rowKey: target.key } };
		}
		case 'ArrowDown': {
			if (ctx.rows[idx]?.isLink) return null;
			if (!ctx.hasRemoveButton(ctx.currentRowKey)) return null;
			return {
				type: 'focus',
				target: { kind: 'cell', rowKey: ctx.currentRowKey, cellId: 'content' }
			};
		}
		case 'ArrowUp': {
			return null;
		}
		case 'Home': {
			const target = firstEnabled(ctx.rows);
			if (!target) return null;
			return { type: 'focus', target: { kind: 'row', rowKey: target.key } };
		}
		case 'End': {
			const target = lastEnabled(ctx.rows);
			if (!target) return null;
			return { type: 'focus', target: { kind: 'row', rowKey: target.key } };
		}
		case 'Enter': {
			const row = ctx.rows[idx];
			if (row?.isLink) {
				return { type: 'activateLink', rowKey: ctx.currentRowKey, modifiers: modifiers(event) };
			}
			if (ctx.selectionMode === 'none') return null;
			return { type: 'select', rowKey: ctx.currentRowKey, modifiers: modifiers(event) };
		}
		case ' ': {
			const row = ctx.rows[idx];
			if (row?.isLink) return null;
			if (ctx.selectionMode === 'none') return null;
			return { type: 'select', rowKey: ctx.currentRowKey, modifiers: modifiers(event) };
		}
		case 'Delete':
		case 'Backspace': {
			return { type: 'remove', rowKey: ctx.currentRowKey };
		}
		case 'Escape': {
			if (ctx.rows[idx]?.isLink) return null;
			return { type: 'clearSelection' };
		}
		case 'a':
		case 'A': {
			if (
				(event.ctrlKey || event.metaKey) &&
				ctx.allowsSelectAll &&
				ctx.selectionMode === 'multiple'
			) {
				return { type: 'selectAll' };
			}
			return isPrintable(event) ? { type: 'typeahead', key: event.key } : null;
		}
		default: {
			return isPrintable(event) ? { type: 'typeahead', key: event.key } : null;
		}
	}
}

export function handleTagCellKeydown(
	event: KeyboardEventLike,
	ctx: CellKeydownContext
): KeyboardOutcome {
	const next = nextKey(ctx.dir);
	const prev = prevKey(ctx.dir);

	const cells: CellId[] = ctx.hasRemoveButton(ctx.currentRowKey)
		? ['content', 'remove']
		: ['content'];
	const cellIdx = cells.indexOf(ctx.currentCellId);

	switch (event.key) {
		case next: {
			const nextCellIdx = cellIdx + 1;
			if (nextCellIdx < cells.length) {
				return {
					type: 'focus',
					target: { kind: 'cell', rowKey: ctx.currentRowKey, cellId: cells[nextCellIdx] }
				};
			}
			// past the trailing cell: step to the next enabled row's first cell, or
			// fall back to row mode of the current row.
			const idx = rowIndex(ctx.rows, ctx.currentRowKey);
			const target = findEnabled(ctx.rows, idx + 1, 1);
			if (!target) return { type: 'focus', target: { kind: 'row', rowKey: ctx.currentRowKey } };
			return {
				type: 'focus',
				target: { kind: 'cell', rowKey: target.key, cellId: 'content' }
			};
		}
		case prev: {
			const prevCellIdx = cellIdx - 1;
			if (prevCellIdx >= 0) {
				return {
					type: 'focus',
					target: { kind: 'cell', rowKey: ctx.currentRowKey, cellId: cells[prevCellIdx] }
				};
			}
			// past the leading cell: drop back to row mode.
			return { type: 'focus', target: { kind: 'row', rowKey: ctx.currentRowKey } };
		}
		case 'ArrowUp':
		case 'Escape': {
			return { type: 'focus', target: { kind: 'row', rowKey: ctx.currentRowKey } };
		}
		case 'ArrowDown': {
			return null;
		}
		case 'Home': {
			return {
				type: 'focus',
				target: { kind: 'cell', rowKey: ctx.currentRowKey, cellId: cells[0] }
			};
		}
		case 'End': {
			return {
				type: 'focus',
				target: { kind: 'cell', rowKey: ctx.currentRowKey, cellId: cells[cells.length - 1] }
			};
		}
		case 'Enter':
		case ' ': {
			if (ctx.currentCellId === 'remove') {
				return { type: 'remove', rowKey: ctx.currentRowKey };
			}
			// content cell: behave like row mode
			const row = ctx.rows[rowIndex(ctx.rows, ctx.currentRowKey)];
			if (row?.isLink) {
				if (event.key === ' ') return null;
				return { type: 'activateLink', rowKey: ctx.currentRowKey, modifiers: modifiers(event) };
			}
			if (ctx.selectionMode === 'none') return null;
			return { type: 'select', rowKey: ctx.currentRowKey, modifiers: modifiers(event) };
		}
		case 'Delete':
		case 'Backspace': {
			return { type: 'remove', rowKey: ctx.currentRowKey };
		}
		case 'a':
		case 'A': {
			if (
				(event.ctrlKey || event.metaKey) &&
				ctx.allowsSelectAll &&
				ctx.selectionMode === 'multiple'
			) {
				return { type: 'selectAll' };
			}
			return null; // typeahead suppressed in cell mode
		}
		default: {
			return null;
		}
	}
}
