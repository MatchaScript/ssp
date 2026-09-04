import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './roving-tabindex.svelte.spec-harness.svelte';

/**
 * Characterization tests for TagGroup's roving tabindex and its highlight.
 *
 * These pin the behaviour as it exists today, attribute by attribute, so a
 * refactor of `SelectableCollection` (controllable highlight, single internal
 * write path) has something to fail against. Everything is read off the real
 * rendered DOM with `getAttribute`, because "no tabindex attribute" and
 * `tabindex="-1"` are different states for a roving tab stop.
 */

interface HarnessItem {
	id: string;
	label: string;
	isDisabled?: boolean;
}

interface HarnessProps {
	items: HarnessItem[];
	selectionMode: 'none' | 'single' | 'multiple';
	disabledKeys: Set<string> | undefined;
	onRemove: ((keys: Set<string>) => void) | undefined;
}

let host: HTMLDivElement;
let component: ReturnType<typeof mount>;

const props = $state<HarnessProps>({
	items: [],
	selectionMode: 'none',
	disabledKeys: undefined,
	onRemove: undefined
});

function render(initial: Partial<HarnessProps> & { items: HarnessItem[] }): void {
	host = document.createElement('div');
	document.body.appendChild(host);
	props.items = initial.items;
	props.selectionMode = initial.selectionMode ?? 'none';
	props.disabledKeys = initial.disabledKeys;
	props.onRemove = initial.onRemove;
	component = mount(Harness, { target: host, props });
	flushSync();
}

const grid = (): HTMLElement => host.querySelector('[data-spectrum-tag-group-list]') as HTMLElement;

const rows = (): HTMLElement[] => Array.from(host.querySelectorAll('[data-spectrum-tag]'));

const row = (key: string): HTMLElement =>
	host.querySelector(`[data-spectrum-tag][data-key="${key}"]`) as HTMLElement;

/** tabindex ATTRIBUTE per row, in DOM order. `null` means the attribute is absent. */
const rowTabIndexes = (): (string | null)[] => rows().map((el) => el.getAttribute('tabindex'));

const rowKeys = (): (string | null)[] => rows().map((el) => el.getAttribute('data-key'));

/** Keys of the rows that are real tab stops (tabindex="0"). */
const tabStopKeys = (): (string | null)[] =>
	rows()
		.filter((el) => el.getAttribute('tabindex') === '0')
		.map((el) => el.getAttribute('data-key'));

function press(el: HTMLElement, key: string): void {
	el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
	flushSync();
}

/** The group defers its "roll focus onto the first row" work to a microtask. */
async function settleFocus(): Promise<void> {
	await new Promise<void>((resolve) => queueMicrotask(resolve));
	flushSync();
}

afterEach(() => {
	unmount(component);
	host.remove();
	document.querySelector('[data-ssp-announcer]')?.remove();
});

const THREE: HarnessItem[] = [
	{ id: 'a', label: 'Apple' },
	{ id: 'b', label: 'Banana' },
	{ id: 'c', label: 'Cherry' }
];

const threeItems = (): HarnessItem[] => THREE.map((item) => ({ ...item }));

describe('TagGroup roving tabindex — resting state', () => {
	it('parks the tab stop on the first row, not on the grid container', () => {
		render({ items: threeItems() });

		// `getContainerTabIndex()` only returns 0 for an empty group, so a
		// populated grid is never the tab stop — the first enabled row is.
		expect(grid().getAttribute('tabindex')).toBe('-1');
		expect(rowTabIndexes()).toEqual(['0', '-1', '-1']);
		expect(tabStopKeys()).toEqual(['a']);
	});

	it('marks no row as highlighted before anything is focused', () => {
		render({ items: threeItems() });

		expect(rows().map((el) => el.getAttribute('data-focused'))).toEqual([null, null, null]);
		expect(document.activeElement).not.toBe(row('a'));
	});
});

describe('TagGroup roving tabindex — highlight on a row', () => {
	it('moves the tab stop to the focused row and leaves the container at -1', async () => {
		render({ items: threeItems() });
		row('b').focus();
		await settleFocus();

		// The container's tabindex does NOT react to the highlight here: it is
		// driven purely by emptiness, unlike SelectableCollection.containerTabIndex.
		expect(grid().getAttribute('tabindex')).toBe('-1');
		expect(rowTabIndexes()).toEqual(['-1', '0', '-1']);
		expect(row('b').getAttribute('data-focused')).toBe('true');
		expect(document.activeElement).toBe(row('b'));
	});

	it('rolls focus onto the first enabled row when the grid itself is focused', async () => {
		render({ items: threeItems() });
		grid().focus();
		await settleFocus();

		expect(document.activeElement).toBe(row('a'));
		expect(rowTabIndexes()).toEqual(['0', '-1', '-1']);
		expect(grid().getAttribute('tabindex')).toBe('-1');
	});
});

describe('TagGroup roving tabindex — keyboard navigation', () => {
	it('ArrowRight advances the tab stop and document.activeElement together', async () => {
		render({ items: threeItems() });
		row('a').focus();
		await settleFocus();
		expect(rowTabIndexes()).toEqual(['0', '-1', '-1']);

		press(row('a'), 'ArrowRight');
		expect(document.activeElement).toBe(row('b'));
		expect(rowTabIndexes()).toEqual(['-1', '0', '-1']);

		press(row('b'), 'ArrowRight');
		expect(document.activeElement).toBe(row('c'));
		expect(rowTabIndexes()).toEqual(['-1', '-1', '0']);
	});

	it('ArrowRight at the last row is a no-op — TagGroup does not wrap', async () => {
		render({ items: threeItems() });
		row('c').focus();
		await settleFocus();

		press(row('c'), 'ArrowRight');
		expect(document.activeElement).toBe(row('c'));
		expect(rowTabIndexes()).toEqual(['-1', '-1', '0']);
	});

	it('ArrowLeft walks the tab stop back', async () => {
		render({ items: threeItems() });
		row('c').focus();
		await settleFocus();

		press(row('c'), 'ArrowLeft');
		expect(document.activeElement).toBe(row('b'));
		expect(rowTabIndexes()).toEqual(['-1', '0', '-1']);
	});

	it('Home and End jump the tab stop to the ends', async () => {
		render({ items: threeItems() });
		row('b').focus();
		await settleFocus();

		press(row('b'), 'End');
		expect(document.activeElement).toBe(row('c'));
		expect(rowTabIndexes()).toEqual(['-1', '-1', '0']);

		press(row('c'), 'Home');
		expect(document.activeElement).toBe(row('a'));
		expect(rowTabIndexes()).toEqual(['0', '-1', '-1']);
	});
});

describe('TagGroup roving tabindex — disabled rows', () => {
	const withDisabledMiddle = (): HarnessItem[] => [
		{ id: 'a', label: 'Apple' },
		{ id: 'b', label: 'Banana', isDisabled: true },
		{ id: 'c', label: 'Cherry' }
	];

	it('renders tabindex="-1" on a disabled row (the attribute is present, not omitted)', () => {
		render({ items: withDisabledMiddle() });

		// SelectableCollection.itemTabIndex() returns `undefined` for disabled
		// items so the attribute would be dropped — but TagGroup does not use it.
		// The row reads `getRowTabIndex()`, typed `0 | -1`, which always emits an
		// attribute, so a disabled tag stays programmatically focusable.
		expect(row('b').getAttribute('tabindex')).toBe('-1');
		expect(row('b').getAttribute('tabindex')).not.toBeNull();
		expect(row('b').getAttribute('aria-disabled')).toBe('true');
		expect(rowTabIndexes()).toEqual(['0', '-1', '-1']);
	});

	it('skips the disabled row when arrowing across it', async () => {
		render({ items: withDisabledMiddle() });
		row('a').focus();
		await settleFocus();

		press(row('a'), 'ArrowRight');
		expect(document.activeElement).toBe(row('c'));
		expect(rowTabIndexes()).toEqual(['-1', '-1', '0']);
		expect(row('b').getAttribute('data-focused')).toBeNull();
	});

	it('gives the resting tab stop to the first ENABLED row', () => {
		render({
			items: [
				{ id: 'a', label: 'Apple', isDisabled: true },
				{ id: 'b', label: 'Banana' },
				{ id: 'c', label: 'Cherry' }
			]
		});

		expect(rowTabIndexes()).toEqual(['-1', '0', '-1']);
		expect(tabStopKeys()).toEqual(['b']);
	});

	it('honours disabledKeys on the group the same way as the per-tag flag', () => {
		render({ items: threeItems(), disabledKeys: new Set(['a']) });

		expect(row('a').getAttribute('tabindex')).toBe('-1');
		expect(rowTabIndexes()).toEqual(['-1', '0', '-1']);
	});

	it('still takes the highlight if a disabled row is focused directly', async () => {
		render({ items: withDisabledMiddle() });

		// Nothing guards the row's `onfocus` -> `syncHighlight` path against a
		// disabled row, and the row is focusable because it carries tabindex="-1".
		// So programmatic focus parks the tab stop on a disabled tag.
		row('b').focus();
		await settleFocus();

		expect(document.activeElement).toBe(row('b'));
		expect(row('b').getAttribute('data-focused')).toBe('true');
		expect(rowTabIndexes()).toEqual(['-1', '0', '-1']);
	});

	it('ignores keystrokes originating on a disabled row', async () => {
		render({ items: withDisabledMiddle() });
		row('a').focus();
		await settleFocus();

		press(row('b'), 'ArrowRight');
		expect(document.activeElement).toBe(row('a'));
		expect(rowTabIndexes()).toEqual(['0', '-1', '-1']);
	});
});

describe('TagGroup roving tabindex — unmounting the highlighted row', () => {
	const remaining = (): HarnessItem[] => [
		{ id: 'a', label: 'Apple' },
		{ id: 'c', label: 'Cherry' }
	];

	it('drops the highlight and hands the tab stop back to the first row', async () => {
		render({ items: threeItems() });
		row('b').focus();
		await settleFocus();
		expect(rowTabIndexes()).toEqual(['-1', '0', '-1']);

		props.items = remaining();
		flushSync();

		// Unregistering the highlighted item nulls `highlightedId`, so the group
		// falls back to its "nothing highlighted" layout: the first enabled row
		// owns the stop, the container stays -1, and the group stays tabbable.
		expect(rowKeys()).toEqual(['a', 'c']);
		expect(grid().getAttribute('tabindex')).toBe('-1');
		expect(rowTabIndexes()).toEqual(['0', '-1']);
		expect(tabStopKeys()).toEqual(['a']);
		expect(rows().map((el) => el.getAttribute('data-focused'))).toEqual([null, null]);
	});

	it('does not move DOM focus anywhere — it falls back to <body>', async () => {
		render({ items: threeItems() });
		row('b').focus();
		await settleFocus();
		expect(document.activeElement).toBe(row('b'));

		props.items = remaining();
		flushSync();
		await settleFocus();

		// Nothing re-homes focus after the highlighted row leaves the DOM: the
		// browser drops it on <body>, and the group's focusin handler never runs
		// again, so no row takes over as the focused element.
		expect(document.activeElement).toBe(document.body);
		expect(tabStopKeys()).toEqual(['a']);
	});

	it('unmounting a NON-highlighted row keeps the highlight where it is', async () => {
		render({ items: threeItems() });
		row('b').focus();
		await settleFocus();

		props.items = [
			{ id: 'b', label: 'Banana' },
			{ id: 'c', label: 'Cherry' }
		];
		flushSync();

		expect(rowKeys()).toEqual(['b', 'c']);
		expect(rowTabIndexes()).toEqual(['0', '-1']);
		expect(row('b').getAttribute('data-focused')).toBe('true');
		expect(document.activeElement).toBe(row('b'));
	});

	it('removing the highlighted tag with Delete leaves exactly one tab stop in the group', async () => {
		render({
			items: threeItems(),
			onRemove: (keys) => {
				props.items = props.items.filter((item) => !keys.has(item.id));
			}
		});
		row('b').focus();
		await settleFocus();

		press(row('b'), 'Delete');
		await settleFocus();

		expect(rowKeys()).toEqual(['a', 'c']);
		expect(rowTabIndexes()).toEqual(['0', '-1']);
		expect(tabStopKeys()).toEqual(['a']);
	});

	it('hands the tab stop to the container once the last row unmounts', async () => {
		render({ items: threeItems() });
		row('b').focus();
		await settleFocus();

		props.items = [];
		flushSync();

		expect(rows()).toHaveLength(0);
		expect(grid().getAttribute('tabindex')).toBe('0');
	});
});

describe('TagGroup roving tabindex — the row X mirrors its row', () => {
	it('keeps the ClearButton tabindex identical to its row on every move', async () => {
		render({ items: threeItems(), onRemove: () => {} });

		const clearTabIndexes = (): (string | null)[] =>
			rows().map(
				(el) => el.querySelector('[data-spectrum-clear-button]')?.getAttribute('tabindex') ?? null
			);

		expect(clearTabIndexes()).toEqual(['0', '-1', '-1']);

		row('c').focus();
		await settleFocus();

		expect(clearTabIndexes()).toEqual(['-1', '-1', '0']);
		expect(rowTabIndexes()).toEqual(['-1', '-1', '0']);
	});
});
