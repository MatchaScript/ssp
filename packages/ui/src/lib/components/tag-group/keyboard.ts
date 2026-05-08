import type { TagGroupSelectionMode } from './types.js';

/**
 * Pure keyboard delegate for TagGroup row-level navigation and selection.
 *
 * The TagGroup uses the react-aria `keyboardNavigationBehavior: 'tab'` model:
 * arrow keys navigate between rows, Tab moves to focusable descendants of the
 * focused row (i.e. the ClearButton X). Tab is handled by the browser via
 * synchronised roving tabindex on the row and its X — this module owns the
 * arrow / activation / removal / selection keys only.
 */

/**
 * Minimal keyboard-event interface consumed by the handler.
 * Satisfied by the browser's `KeyboardEvent` and by plain objects in tests.
 */
export interface KeyboardEventLike {
	readonly key: string;
	readonly shiftKey: boolean;
	readonly ctrlKey: boolean;
	readonly metaKey: boolean;
	readonly altKey: boolean;
}

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
	readonly selectionMode: TagGroupSelectionMode;
	readonly allowsSelectAll: boolean;
}

export type KeyboardOutcome =
	| { type: 'focus'; rowKey: string }
	| { type: 'select'; rowKey: string; modifiers: KeyboardModifiers }
	| { type: 'activateLink'; rowKey: string; modifiers: KeyboardModifiers }
	| { type: 'remove'; rowKey: string }
	| { type: 'selectAll' }
	| { type: 'clearSelection' }
	| { type: 'typeahead'; key: string }
	| null;

// ── direction-aware key resolution ──────────────────────────────
//
// In horizontal orientation (TagGroup's only mode), rtl flips left/right.

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

// ── public handler ──────────────────────────────────────────────

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
			return { type: 'focus', rowKey: target.key };
		}
		case prev: {
			const target = findEnabled(ctx.rows, idx - 1, -1);
			if (!target) return null;
			return { type: 'focus', rowKey: target.key };
		}
		case 'Home': {
			const target = firstEnabled(ctx.rows);
			if (!target) return null;
			return { type: 'focus', rowKey: target.key };
		}
		case 'End': {
			const target = lastEnabled(ctx.rows);
			if (!target) return null;
			return { type: 'focus', rowKey: target.key };
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
