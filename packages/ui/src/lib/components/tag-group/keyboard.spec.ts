import { describe, it, expect } from 'vitest';
import { handleTagRowKeydown, type KeyboardEventLike, type RowKeydownContext } from './keyboard.js';

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
		selectionMode: 'multiple',
		allowsSelectAll: true,
		...over
	};
}

describe('handleTagRowKeydown — navigation', () => {
	it('ArrowRight (ltr) moves to next enabled tag', () => {
		const out = handleTagRowKeydown(ev('ArrowRight'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({ type: 'focus', rowKey: 'c' });
	});

	it('ArrowRight (ltr) skips disabled tags when starting from one', () => {
		const out = handleTagRowKeydown(ev('ArrowRight'), rowCtx({ currentRowKey: 'b' }));
		expect(out).toEqual({ type: 'focus', rowKey: 'c' });
	});

	it('ArrowRight returns null at the last enabled tag (no wrap)', () => {
		const out = handleTagRowKeydown(ev('ArrowRight'), rowCtx({ currentRowKey: 'd' }));
		expect(out).toBeNull();
	});

	it('ArrowLeft (ltr) moves to previous enabled tag', () => {
		const out = handleTagRowKeydown(ev('ArrowLeft'), rowCtx({ currentRowKey: 'c' }));
		expect(out).toEqual({ type: 'focus', rowKey: 'a' });
	});

	it('ArrowRight is reversed under rtl', () => {
		const out = handleTagRowKeydown(ev('ArrowRight'), rowCtx({ currentRowKey: 'c', dir: 'rtl' }));
		expect(out).toEqual({ type: 'focus', rowKey: 'a' });
	});

	it('Home moves to the first enabled tag', () => {
		const out = handleTagRowKeydown(ev('Home'), rowCtx({ currentRowKey: 'c' }));
		expect(out).toEqual({ type: 'focus', rowKey: 'a' });
	});

	it('End moves to the last enabled tag', () => {
		const out = handleTagRowKeydown(ev('End'), rowCtx({ currentRowKey: 'a' }));
		expect(out).toEqual({ type: 'focus', rowKey: 'd' });
	});

	it('ArrowDown / ArrowUp are noops (within-row navigation is the browser native Tab)', () => {
		expect(handleTagRowKeydown(ev('ArrowDown'), rowCtx({ currentRowKey: 'a' }))).toBeNull();
		expect(handleTagRowKeydown(ev('ArrowUp'), rowCtx({ currentRowKey: 'a' }))).toBeNull();
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
		const out = handleTagRowKeydown(ev('Enter', { metaKey: true }), rowCtx({ currentRowKey: 'd' }));
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
		const out = handleTagRowKeydown(ev('a', { ctrlKey: true }), rowCtx({ currentRowKey: 'a' }));
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
