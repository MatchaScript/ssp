import { describe, it, expect } from 'vitest';
import {
	handleTagRowKeydown,
	handleTagCellKeydown,
	type KeyboardEventLike,
	type RowKeydownContext,
	type CellKeydownContext
} from './keyboard.js';

function ev(key: string, mods: Partial<KeyboardEventLike> = {}): KeyboardEventLike {
	return {
		key,
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...mods
	};
}

const ROWS = [
	{ key: 'a', disabled: false, isLink: false },
	{ key: 'b', disabled: true, isLink: false },
	{ key: 'c', disabled: false, isLink: false },
	{ key: 'd', disabled: false, isLink: true }
];

function rowCtx(over: Partial<RowKeydownContext> = {}): RowKeydownContext {
	return {
		rows: ROWS,
		currentRowKey: 'a',
		dir: 'ltr',
		hasRemoveButton: () => true,
		selectionMode: 'multiple',
		allowsSelectAll: true,
		...over
	};
}

function cellCtx(over: Partial<CellKeydownContext> = {}): CellKeydownContext {
	return {
		...rowCtx(),
		currentCellId: 'content',
		...over
	};
}

describe('handleTagRowKeydown — navigation', () => {
	it('ArrowRight (ltr) moves to next enabled tag', () => {
		const out = handleTagRowKeydown(ev('ArrowRight'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'c' } });
	});

	it('ArrowRight (ltr) skips disabled tags when starting from one', () => {
		const out = handleTagRowKeydown(ev('ArrowRight'), rowCtx({ currentRowKey: 'b' }));
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'c' } });
	});

	it('ArrowRight returns null at the last enabled tag (no wrap)', () => {
		const out = handleTagRowKeydown(ev('ArrowRight'), rowCtx({ currentRowKey: 'd' }));
		expect(out).toBeNull();
	});

	it('ArrowLeft (ltr) moves to previous enabled tag', () => {
		const out = handleTagRowKeydown(ev('ArrowLeft'), rowCtx({ currentRowKey: 'c' }));
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'a' } });
	});

	it('ArrowRight is reversed under rtl', () => {
		const out = handleTagRowKeydown(
			ev('ArrowRight'),
			rowCtx({ currentRowKey: 'c', dir: 'rtl' })
		);
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'a' } });
	});

	it('ArrowDown enters cell mode when row has remove button', () => {
		const out = handleTagRowKeydown(ev('ArrowDown'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({
			type: 'focus',
			target: { kind: 'cell', rowKey: 'a', cellId: 'content' }
		});
	});

	it('ArrowDown is a noop when the row has no remove button', () => {
		const out = handleTagRowKeydown(
			ev('ArrowDown'),
			rowCtx({ currentRowKey: 'a', hasRemoveButton: () => false })
		);
		expect(out).toBeNull();
	});

	it('ArrowDown is a noop on a link tag even when row has remove button', () => {
		const out = handleTagRowKeydown(ev('ArrowDown'), rowCtx({ currentRowKey: 'd' }));
		expect(out).toBeNull();
	});

	it('Home moves to the first enabled tag', () => {
		const out = handleTagRowKeydown(ev('Home'), rowCtx({ currentRowKey: 'c' }));
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'a' } });
	});

	it('End moves to the last enabled tag', () => {
		const out = handleTagRowKeydown(ev('End'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'd' } });
	});
});

describe('handleTagRowKeydown — selection / removal', () => {
	it('Space toggles selection on a non-link tag', () => {
		const out = handleTagRowKeydown(ev(' '), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({
			type: 'select',
			rowKey: 'a',
			modifiers: { shift: false, ctrlOrMeta: false }
		});
	});

	it('Space is a noop on a link tag', () => {
		const out = handleTagRowKeydown(ev(' '), rowCtx({ currentRowKey: 'd' }));
		expect(out).toBeNull();
	});

	it('Enter toggles selection on a non-link tag', () => {
		const out = handleTagRowKeydown(ev('Enter'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({
			type: 'select',
			rowKey: 'a',
			modifiers: { shift: false, ctrlOrMeta: false }
		});
	});

	it('Enter activates the link on a link tag, forwarding modifiers', () => {
		const out = handleTagRowKeydown(
			ev('Enter', { metaKey: true }),
			rowCtx({ currentRowKey: 'd' })
		);
		expect(out).toEqual({
			type: 'activateLink',
			rowKey: 'd',
			modifiers: { shift: false, ctrlOrMeta: true }
		});
	});

	it('Delete removes the focused tag', () => {
		const out = handleTagRowKeydown(ev('Delete'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({ type: 'remove', rowKey: 'a' });
	});

	it('Backspace removes the focused tag', () => {
		const out = handleTagRowKeydown(ev('Backspace'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({ type: 'remove', rowKey: 'a' });
	});

	it('Ctrl/Cmd+A triggers selectAll in multiple mode', () => {
		const out = handleTagRowKeydown(
			ev('a', { ctrlKey: true }),
			rowCtx({ currentRowKey: 'a' })
		);
		expect(out).toEqual({ type: 'selectAll' });
	});

	it('Ctrl/Cmd+A is a noop in single mode (does not fall through to typeahead)', () => {
		const out = handleTagRowKeydown(
			ev('a', { ctrlKey: true }),
			rowCtx({ selectionMode: 'single', currentRowKey: 'a' })
		);
		expect(out).toBeNull();
	});

	it('Escape clears selection', () => {
		const out = handleTagRowKeydown(ev('Escape'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({ type: 'clearSelection' });
	});

	it('Escape is a noop on a link tag (does not clear selection)', () => {
		const out = handleTagRowKeydown(ev('Escape'), rowCtx({ currentRowKey: 'd' }));
		expect(out).toBeNull();
	});

	it('A printable key triggers typeahead', () => {
		const out = handleTagRowKeydown(ev('r'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({ type: 'typeahead', key: 'r' });
	});
});

describe('handleTagCellKeydown', () => {
	it('ArrowRight (ltr) on content cell moves to remove cell', () => {
		const out = handleTagCellKeydown(
			ev('ArrowRight'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'content' })
		);
		expect(out).toEqual({
			type: 'focus',
			target: { kind: 'cell', rowKey: 'a', cellId: 'remove' }
		});
	});

	it('ArrowRight (ltr) on remove cell of last row returns to row mode', () => {
		const out = handleTagCellKeydown(
			ev('ArrowRight'),
			cellCtx({ currentRowKey: 'd', currentCellId: 'remove' })
		);
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'd' } });
	});

	it('ArrowRight from a non-last remove cell wraps to next row content cell', () => {
		const out = handleTagCellKeydown(
			ev('ArrowRight'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'remove' })
		);
		// 'a' → next enabled row is 'c' (skipping disabled 'b')
		expect(out).toEqual({
			type: 'focus',
			target: { kind: 'cell', rowKey: 'c', cellId: 'content' }
		});
	});

	it('ArrowLeft (ltr) on content cell returns to row mode', () => {
		const out = handleTagCellKeydown(
			ev('ArrowLeft'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'content' })
		);
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'a' } });
	});

	it('ArrowLeft (rtl) flips with ArrowRight', () => {
		const out = handleTagCellKeydown(
			ev('ArrowLeft'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'content', dir: 'rtl' })
		);
		expect(out).toEqual({
			type: 'focus',
			target: { kind: 'cell', rowKey: 'a', cellId: 'remove' }
		});
	});

	it('ArrowUp returns to row mode', () => {
		const out = handleTagCellKeydown(
			ev('ArrowUp'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'content' })
		);
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'a' } });
	});

	it('Escape returns to row mode', () => {
		const out = handleTagCellKeydown(
			ev('Escape'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'remove' })
		);
		expect(out).toEqual({ type: 'focus', target: { kind: 'row', rowKey: 'a' } });
	});

	it('Enter on remove cell removes', () => {
		const out = handleTagCellKeydown(
			ev('Enter'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'remove' })
		);
		expect(out).toEqual({ type: 'remove', rowKey: 'a' });
	});

	it('Space on remove cell removes', () => {
		const out = handleTagCellKeydown(
			ev(' '),
			cellCtx({ currentRowKey: 'a', currentCellId: 'remove' })
		);
		expect(out).toEqual({ type: 'remove', rowKey: 'a' });
	});

	it('Delete removes regardless of cell', () => {
		const out = handleTagCellKeydown(
			ev('Delete'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'content' })
		);
		expect(out).toEqual({ type: 'remove', rowKey: 'a' });
	});

	it('Typeahead is suppressed in cell mode', () => {
		const out = handleTagCellKeydown(
			ev('r'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'content' })
		);
		expect(out).toBeNull();
	});

	it('Home moves to first cell of current row', () => {
		const out = handleTagCellKeydown(
			ev('Home'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'remove' })
		);
		expect(out).toEqual({
			type: 'focus',
			target: { kind: 'cell', rowKey: 'a', cellId: 'content' }
		});
	});

	it('End moves to last cell of current row', () => {
		const out = handleTagCellKeydown(
			ev('End'),
			cellCtx({ currentRowKey: 'a', currentCellId: 'content' })
		);
		expect(out).toEqual({
			type: 'focus',
			target: { kind: 'cell', rowKey: 'a', cellId: 'remove' }
		});
	});
});
