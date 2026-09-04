import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './roving-tabindex.svelte.spec-harness.svelte';

/**
 * Characterization of ListView's roving tabindex and highlight.
 *
 * The widget must always be exactly one tab stop: the container holds it while
 * nothing inside is focused, the highlighted item holds it once something is.
 * Disabled items get no `tabindex` attribute at all, which is a different state
 * from `tabindex="-1"` — the attribute is queried with `getAttribute` throughout
 * so the two never collapse into each other.
 *
 * These tests pin what the code does today, including the parts that look like
 * accidents (see the unmount block).
 */

let host: HTMLDivElement;
let component: ReturnType<typeof mount>;

interface HarnessProps {
	items: string[];
	disabledKeys: Set<string>;
	selectionMode?: 'none' | 'single' | 'multiple';
	selectionStyle?: 'checkbox' | 'highlight';
}

function render(overrides: Partial<HarnessProps> = {}): HarnessProps {
	host = document.createElement('div');
	document.body.appendChild(host);
	const props = $state<HarnessProps>({
		items: ['a', 'b', 'c', 'd'],
		disabledKeys: new Set<string>(),
		...overrides
	});
	component = mount(Harness, { target: host, props });
	flushSync();
	return props;
}

afterEach(() => {
	unmount(component);
	host.remove();
});

const container = () => host.querySelector('[data-spectrum-list-view]') as HTMLElement;
const items = () =>
	Array.from(host.querySelectorAll<HTMLElement>('[data-spectrum-list-view-item]'));
const item = (key: string) =>
	host.querySelector<HTMLElement>(`[data-spectrum-list-view-item][data-key="${key}"]`)!;
const rows = () => Array.from(host.querySelectorAll<HTMLElement>('[data-spectrum-list-view-row]'));

/** The `tabindex` ATTRIBUTE of every item, in DOM order. `null` = no attribute. */
const itemTabIndexes = () => items().map((el) => el.getAttribute('tabindex'));
const focusedKeys = () =>
	items()
		.filter((el) => el.hasAttribute('data-focused'))
		.map((el) => el.getAttribute('data-key'));

function press(key: string): void {
	(document.activeElement as HTMLElement).dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true })
	);
	flushSync();
}

describe('roving tabindex before anything is focused', () => {
	it('gives the tab stop to the container and -1 to every enabled item', () => {
		render();

		expect(container().getAttribute('tabindex')).toBe('0');
		expect(itemTabIndexes()).toEqual(['-1', '-1', '-1', '-1']);
		expect(focusedKeys()).toEqual([]);
		expect(document.activeElement).not.toBe(container());
	});
});

describe('roving tabindex once the highlight lands on an item', () => {
	it('hands the tab stop from the container to the highlighted item', () => {
		render();

		// Tabbing into the list: `focusin` rolls the highlight onto the first
		// enabled item, which then owns the only tab stop.
		container().focus();
		flushSync();

		expect(document.activeElement).toBe(item('a'));
		expect(container().getAttribute('tabindex')).toBe('-1');
		expect(itemTabIndexes()).toEqual(['0', '-1', '-1', '-1']);
	});

	it('marks the highlighted item and its row with data-focused', () => {
		render();
		container().focus();
		flushSync();

		expect(focusedKeys()).toEqual(['a']);
		expect(rows()[0].hasAttribute('data-focused')).toBe(true);
		expect(rows()[1].hasAttribute('data-focused')).toBe(false);
	});
});

describe('keyboard navigation moves tabindex, data-focused and activeElement together', () => {
	it('follows ArrowDown / ArrowUp', () => {
		render();
		container().focus();
		flushSync();

		press('ArrowDown');
		expect(document.activeElement).toBe(item('b'));
		expect(itemTabIndexes()).toEqual(['-1', '0', '-1', '-1']);
		expect(focusedKeys()).toEqual(['b']);
		expect(container().getAttribute('tabindex')).toBe('-1');

		press('ArrowUp');
		expect(document.activeElement).toBe(item('a'));
		expect(itemTabIndexes()).toEqual(['0', '-1', '-1', '-1']);
		expect(focusedKeys()).toEqual(['a']);
	});

	it('follows End / Home', () => {
		render();
		container().focus();
		flushSync();

		press('End');
		expect(document.activeElement).toBe(item('d'));
		expect(itemTabIndexes()).toEqual(['-1', '-1', '-1', '0']);
		expect(focusedKeys()).toEqual(['d']);

		press('Home');
		expect(document.activeElement).toBe(item('a'));
		expect(itemTabIndexes()).toEqual(['0', '-1', '-1', '-1']);
		expect(focusedKeys()).toEqual(['a']);
	});

	it('does not wrap at either end (shouldFocusWrap is false for ListView)', () => {
		render();
		container().focus();
		flushSync();

		press('ArrowUp');
		expect(document.activeElement).toBe(item('a'));
		expect(itemTabIndexes()).toEqual(['0', '-1', '-1', '-1']);

		press('End');
		press('ArrowDown');
		expect(document.activeElement).toBe(item('d'));
		expect(itemTabIndexes()).toEqual(['-1', '-1', '-1', '0']);
	});
});

describe('disabled items', () => {
	// `itemTabIndex` reads `disabled` off a plain Map entry, so the rendered
	// attribute only tracks the one reactive value in that expression:
	// `highlightedId`. On the very first render the item has not registered yet
	// (registration happens in an `$effect`, after the attribute is computed), so
	// the lookup misses and the item renders the enabled value.
	it('still carries tabindex="-1" before the first highlight change', () => {
		render({ disabledKeys: new Set(['b']) });

		expect(itemTabIndexes()).toEqual(['-1', '-1', '-1', '-1']);
		// Flushing again does not fix it: nothing re-runs the attribute until
		// `highlightedId` changes.
		flushSync();
		expect(item('b').getAttribute('tabindex')).toBe('-1');
	});

	it('drops the tabindex attribute entirely once the highlight moves', () => {
		render({ disabledKeys: new Set(['b']) });

		container().focus();
		flushSync();

		expect(item('b').getAttribute('tabindex')).toBeNull();
		expect(item('b').hasAttribute('tabindex')).toBe(false);
		expect(itemTabIndexes()).toEqual(['0', null, '-1', '-1']);
	});

	it('does not take the highlight when it receives DOM focus while still -1', () => {
		render({ disabledKeys: new Set(['b']) });

		// The stale `tabindex="-1"` makes the disabled item focusable for one
		// render, but its `focus` handler bails out before `syncHighlight`, and the
		// container's `focusin` handler then rolls the highlight onto the first
		// enabled item instead.
		item('b').focus();
		flushSync();

		expect(document.activeElement).toBe(item('a'));
		expect(focusedKeys()).toEqual(['a']);
		expect(item('b').getAttribute('tabindex')).toBeNull();
	});

	it('is skipped by arrow navigation and never gets the tab stop', () => {
		render({ disabledKeys: new Set(['b']) });
		container().focus();
		flushSync();

		press('ArrowDown');

		expect(document.activeElement).toBe(item('c'));
		expect(itemTabIndexes()).toEqual(['-1', null, '0', '-1']);
		expect(focusedKeys()).toEqual(['c']);
	});

	it('is skipped when the highlight first rolls in, and is not focusable at all', () => {
		render({ disabledKeys: new Set(['a']) });
		container().focus();
		flushSync();

		expect(document.activeElement).toBe(item('b'));
		expect(itemTabIndexes()).toEqual([null, '0', '-1', '-1']);

		// No tabindex attribute means the browser refuses .focus() outright, so a
		// disabled item cannot be highlighted even programmatically.
		item('a').focus();
		flushSync();
		expect(document.activeElement).toBe(item('b'));
		expect(focusedKeys()).toEqual(['b']);
	});
});

describe('unmounting the highlighted item', () => {
	it('clears the highlight and gives the tab stop back to the container', () => {
		const props = render();
		container().focus();
		flushSync();
		press('ArrowDown');
		expect(document.activeElement).toBe(item('b'));

		props.items = ['a', 'c', 'd'];
		flushSync();

		// The unregister closure nulls `highlightedId` when the leaving item owned
		// it, so the collection falls back to "nothing focused": the container
		// takes the tab stop again and no item carries 0.
		expect(container().getAttribute('tabindex')).toBe('0');
		expect(itemTabIndexes()).toEqual(['-1', '-1', '-1']);
		expect(focusedKeys()).toEqual([]);
		// Nothing re-homes DOM focus, so it falls to <body> — the widget is left
		// with no focused element even though the user was navigating it.
		expect(document.activeElement).toBe(document.body);
	});

	it('leaves the highlight alone when some other item unmounts', () => {
		const props = render();
		container().focus();
		flushSync();
		press('ArrowDown');
		expect(document.activeElement).toBe(item('b'));

		props.items = ['a', 'b', 'c'];
		flushSync();

		expect(container().getAttribute('tabindex')).toBe('-1');
		expect(itemTabIndexes()).toEqual(['-1', '0', '-1']);
		expect(focusedKeys()).toEqual(['b']);
		expect(document.activeElement).toBe(item('b'));
	});
});
