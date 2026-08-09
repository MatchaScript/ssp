import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';
import Harness from './roving-tabindex.svelte.spec-harness.svelte';

/**
 * TableView's roving tabindex + highlight state, read straight off the rendered
 * DOM.
 *
 * Every assertion reads the tabindex ATTRIBUTE (`getAttribute`), never the
 * `.tabIndex` property: a missing attribute and `tabindex="-1"` both report
 * `-1` as a property, and the difference between them is exactly what the
 * roving-tabindex contract encodes — a disabled row must not be focusable even
 * programmatically, so it carries no attribute at all.
 */

type Row = { id: string; a: string; b: string; c: string };

const ROWS: Row[] = [
	{ id: 'r0', a: 'Alpha', b: 'b0', c: 'c0' },
	{ id: 'r1', a: 'Bravo', b: 'b1', c: 'c1' },
	{ id: 'r2', a: 'Charlie', b: 'b2', c: 'c2' }
];

type HarnessProps = {
	rows: Row[];
	selectionMode?: 'none' | 'single' | 'multiple';
	disabledKeys?: string[];
	hiddenColumns?: string[];
	withColumnFeatures?: boolean;
	skipColumnB?: boolean;
};

let host: HTMLDivElement;
let component: ReturnType<typeof mount>;

function render(overrides: Partial<HarnessProps> = {}): HarnessProps {
	host = document.createElement('div');
	host.style.width = '900px';
	document.body.appendChild(host);
	const props = $state<HarnessProps>({ rows: ROWS.map((r) => ({ ...r })), ...overrides });
	component = mount(Harness, { target: host, props });
	flushSync();
	return props;
}

afterEach(() => {
	unmount(component);
	host.remove();
	document.querySelector('[data-ssp-announcer]')?.remove();
});

const table = () => host.querySelector<HTMLElement>('table[role="grid"]')!;
const rows = () =>
	Array.from(host.querySelectorAll<HTMLElement>('tr[data-spectrum-table-view-row]'));
const row = (key: string) => host.querySelector<HTMLElement>(`tr[data-key="${key}"]`)!;
const cells = (scope: ParentNode = host) =>
	Array.from(scope.querySelectorAll<HTMLElement>('[data-spectrum-table-view-cell]'));
const checkboxCells = () =>
	Array.from(host.querySelectorAll<HTMLElement>('[data-spectrum-table-view-checkbox-cell]'));
const columnHeaders = () =>
	Array.from(host.querySelectorAll<HTMLElement>('[data-spectrum-table-view-column]'));
const tabindexes = (els: Element[]) => els.map((el) => el.getAttribute('tabindex'));

/** Every natively-focusable element, minus the ones explicitly parked at -1. */
const FOCUSABLE_SELECTOR =
	'a[href], area[href], button, input, select, textarea, iframe, [tabindex], [contenteditable]';
function tabStops(): HTMLElement[] {
	return Array.from(host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
		if (el.getAttribute('tabindex') === '-1') return false;
		return !(el as HTMLButtonElement | HTMLInputElement).disabled;
	});
}

/** Tab into the table. `focusin` on the `<table>` rolls the highlight onto the first enabled row. */
function enterTable(): void {
	table().focus();
	flushSync();
}

function press(key: string): void {
	(document.activeElement as HTMLElement).dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true })
	);
	flushSync();
}

describe('resting state: nothing inside the table is focused', () => {
	it('the <table> carries the only tabindex="0"; rows, cells and headers are all "-1"', () => {
		render();

		expect(document.activeElement).toBe(document.body);
		expect(table().getAttribute('tabindex')).toBe('0');

		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);
		expect(tabindexes(cells())).toEqual(Array(9).fill('-1'));
		expect(tabindexes(checkboxCells())).toEqual(['-1', '-1', '-1']);
		expect(tabindexes(columnHeaders())).toEqual(['-1', '-1', '-1']);
		expect(
			host.querySelector('[data-spectrum-table-view-checkbox-header]')!.getAttribute('tabindex')
		).toBe('-1');
	});

	it('a selectionMode="none" table is still a tab stop', () => {
		render({ selectionMode: 'none' });

		// Keyboard entry does not depend on selection: WCAG 2.1.1 applies to a
		// read-only grid too, and the rows still need to be reachable to be read.
		expect(table().getAttribute('tabindex')).toBe('0');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);

		enterTable();
		expect(document.activeElement).toBe(row('r0'));
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(table().getAttribute('tabindex')).toBe('-1');
	});
});

describe('highlight on a row', () => {
	it('moves the tab stop off the <table> and onto the highlighted <tr>', () => {
		render();
		enterTable();

		// Tabbing in rolls the highlight onto the first enabled row, which then
		// owns the stop; the container drops out.
		expect(table().getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(document.activeElement).toBe(row('r0'));
		expect(row('r0').getAttribute('data-focused')).toBe('true');

		// Row-mode highlight leaves the cells alone — they only become tab stops
		// in cell mode.
		expect(tabindexes(cells())).toEqual(Array(9).fill('-1'));
		expect(tabindexes(checkboxCells())).toEqual(['-1', '-1', '-1']);
	});

	it('ArrowDown / ArrowUp move tabindex="0" and document.activeElement together', () => {
		render();
		enterTable();

		press('ArrowDown');
		expect(tabindexes(rows())).toEqual(['-1', '0', '-1']);
		expect(document.activeElement).toBe(row('r1'));
		expect(table().getAttribute('tabindex')).toBe('-1');

		press('ArrowDown');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '0']);
		expect(document.activeElement).toBe(row('r2'));

		// `shouldFocusWrap: false` — ArrowDown at the end is a no-op, not a wrap.
		press('ArrowDown');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '0']);
		expect(document.activeElement).toBe(row('r2'));

		press('ArrowUp');
		expect(tabindexes(rows())).toEqual(['-1', '0', '-1']);
		expect(document.activeElement).toBe(row('r1'));
		expect(table().getAttribute('tabindex')).toBe('-1');
	});

	it('End / Home jump the tab stop to the last / first row', () => {
		render();
		enterTable();

		press('End');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '0']);
		expect(document.activeElement).toBe(row('r2'));

		press('Home');
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(document.activeElement).toBe(row('r0'));
	});
});

describe('disabled rows', () => {
	it('a disabled row carries no tabindex attribute at all — not even "-1"', () => {
		render({ disabledKeys: ['r1'] });

		// -1 would still be programmatically focusable, so a stray `.focus()`
		// could land on a row the keyboard deliberately skips. Same rule as
		// `SelectableCollection.itemTabIndex` and upstream `useSelectableItem`.
		// The row's cells and its checkbox cell follow the row.
		expect(row('r1').hasAttribute('tabindex')).toBe(false);
		expect(row('r1').getAttribute('aria-disabled')).toBe('true');
		expect(tabindexes(cells(row('r1')))).toEqual([null, null, null]);
		expect(
			row('r1').querySelector('[data-spectrum-table-view-checkbox-cell]')!.hasAttribute('tabindex')
		).toBe(false);

		// Enabled rows are unaffected.
		expect(row('r0').getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(cells(row('r0')))).toEqual(['-1', '-1', '-1']);
	});

	it('a disabled row cannot take the highlight — ArrowDown steps over it', () => {
		render({ disabledKeys: ['r1'] });
		enterTable();

		expect(document.activeElement).toBe(row('r0'));

		press('ArrowDown');
		expect(tabindexes(rows())).toEqual(['-1', null, '0']);
		expect(document.activeElement).toBe(row('r2'));
		expect(row('r1').hasAttribute('data-focused')).toBe(false);

		press('ArrowUp');
		expect(tabindexes(rows())).toEqual(['0', null, '-1']);
		expect(document.activeElement).toBe(row('r0'));
		expect(row('r1').hasAttribute('data-focused')).toBe(false);
	});

	it('tabbing in skips a disabled first row and highlights the first enabled one', () => {
		render({ disabledKeys: ['r0'] });
		enterTable();

		expect(tabindexes(rows())).toEqual([null, '0', '-1']);
		expect(document.activeElement).toBe(row('r1'));
	});

	it('a row that turns disabled while focused hands focus to its neighbour', async () => {
		const props = render();
		enterTable();
		press('ArrowDown');
		expect(document.activeElement).toBe(row('r1'));

		props.disabledKeys = ['r1'];
		flushSync();
		await tick();

		expect(row('r1').hasAttribute('tabindex')).toBe(false);
		expect(tabindexes(rows())).toEqual(['-1', null, '0']);
		expect(document.activeElement).toBe(row('r2'));
	});
});

describe('unmounting the currently-highlighted row', () => {
	it('relocates the identity — and the DOM focus — to the row that took its place', async () => {
		const props = render();
		enterTable();
		press('ArrowDown');

		expect(tabindexes(rows())).toEqual(['-1', '0', '-1']);
		expect(document.activeElement).toBe(row('r1'));

		props.rows = props.rows.filter((r) => r.id !== 'r1');
		flushSync();

		expect(rows().map((el) => el.getAttribute('data-key'))).toEqual(['r0', 'r2']);
		// The identity no longer resolves, so relocation runs: one row was
		// removed, so the landing index is the same index clamped — r2.
		expect(table().getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(rows())).toEqual(['-1', '0']);
		expect(row('r2').getAttribute('data-focused')).toBe('true');

		// DOM focus is restored a microtask later: the tabindex has to reach the
		// DOM first, and the browser drops focus to <body> the moment the old row
		// detaches.
		expect(document.activeElement).toBe(document.body);
		await tick();
		expect(document.activeElement).toBe(row('r2'));
	});

	it('lands ahead of a deleted block rather than after it', async () => {
		const props = render({
			rows: ['r0', 'r1', 'r2', 'r3', 'r4'].map((id) => ({ id, a: id, b: id, c: id }))
		});
		enterTable();
		press('ArrowDown');
		press('ArrowDown');
		expect(document.activeElement).toBe(row('r2'));

		// Remove r1, r2, r3 at once. Clamping the old index (2) to the new length
		// would land on r4; upstream's formula backs up by the number removed and
		// lands on r0.
		props.rows = props.rows.filter((r) => !['r1', 'r2', 'r3'].includes(r.id));
		flushSync();
		await tick();

		expect(rows().map((el) => el.getAttribute('data-key'))).toEqual(['r0', 'r4']);
		expect(document.activeElement).toBe(row('r0'));
		expect(tabindexes(rows())).toEqual(['0', '-1']);
	});

	it('hands the tab stop back to the <table> when no row is left', async () => {
		const props = render();
		enterTable();

		props.rows = [];
		flushSync();
		await tick();

		expect(rows()).toHaveLength(0);
		// Nothing to relocate to, so the identity clears and the container takes
		// the stop back. Re-entering from there lands on a column header.
		expect(table().getAttribute('tabindex')).toBe('0');
	});

	it('unmounting a NON-highlighted row leaves the highlight (and the tab stop) where it was', () => {
		const props = render();
		enterTable();
		press('ArrowDown');
		expect(document.activeElement).toBe(row('r1'));

		props.rows = props.rows.filter((r) => r.id !== 'r2');
		flushSync();

		expect(table().getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(rows())).toEqual(['-1', '0']);
		expect(document.activeElement).toBe(row('r1'));
	});
});

describe('entering the table', () => {
	it('Shift+Tab in from after the table lands on the last enabled row', () => {
		render();
		// A real element after the table, so `focusin` carries a relatedTarget the
		// direction test can read. Outside `host`, so the tab-stop counts below
		// (which query `host`) are unaffected.
		const after = document.createElement('button');
		document.body.appendChild(after);
		after.focus();

		table().focus();
		flushSync();

		expect(document.activeElement).toBe(row('r2'));
		expect(tabindexes(rows())).toEqual(['-1', '-1', '0']);
		after.remove();
	});

	it('clicking a cell moves the identity there, so the table stops being the tab stop', () => {
		render();
		// A `tabindex=-1` cell is still mouse-focusable. If the click did not move
		// the identity, the `<table>` would stay at 0 — a second tab stop sitting
		// right before the focused cell — and Shift+Tab off the cell would land
		// back on it and be walked forward into the table again.
		const cell = cells(row('r1'))[0];
		cell.focus();
		flushSync();

		expect(document.activeElement).toBe(cell);
		expect(cell.getAttribute('tabindex')).toBe('0');
		expect(table().getAttribute('tabindex')).toBe('-1');
		expect(tabStops()).toHaveLength(1);
		expect(row('r1').getAttribute('data-focused')).toBe('true');
	});

	it('an empty table puts the keyboard on a declared column header, not on nothing', () => {
		render({ rows: [], withColumnFeatures: true });

		expect(rows()).toHaveLength(0);
		enterTable();

		// The column headers are the only thing left to operate — and clearing
		// the filter that emptied the table is exactly what a user needs to do
		// from here. Leaving the identity unset would strand them: the header
		// controls are not tab stops of their own.
		const active = document.activeElement as HTMLElement;
		expect(active.getAttribute('role')).toBe('columnheader');
		expect(active.textContent).toContain('A');
		expect(active.getAttribute('tabindex')).toBe('0');
		expect(table().getAttribute('tabindex')).toBe('-1');
		expect(tabStops()).toHaveLength(1);

		// And the other headers are an arrow away, so the column menu — hence
		// sort / hide / filter / resize — still has a keyboard route.
		press('ArrowRight');
		const withMenu = document.activeElement as HTMLElement;
		expect(withMenu.textContent).toContain('B');
		withMenu.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true })
		);
		flushSync();
		expect(host.querySelector('[role="menu"]')).not.toBeNull();
	});

	it('a table whose every row is disabled enters at a column header too', () => {
		render({ disabledKeys: ['r0', 'r1', 'r2'] });
		enterTable();

		expect((document.activeElement as HTMLElement).getAttribute('role')).toBe('columnheader');
		expect(tabindexes(rows())).toEqual([null, null, null]);
		expect(tabStops()).toHaveLength(1);
	});
});

describe('writing direction', () => {
	it('in RTL the leading-edge arrow enters cell mode', () => {
		render();
		host.setAttribute('dir', 'rtl');
		flushSync();
		enterTable();
		expect(document.activeElement).toBe(row('r0'));

		// RTL makes ArrowLeft the logically-forward key. Hardcoding ArrowRight as
		// "enter cell mode" leaves RTL users with no way in at all: ArrowRight
		// resolves to a backward step, which has no meaning on a row.
		press('ArrowRight');
		expect(document.activeElement).toBe(row('r0'));

		press('ArrowLeft');
		const target = document.activeElement as HTMLElement;
		expect(target.hasAttribute('data-spectrum-table-view-checkbox-cell')).toBe(true);
		expect(target.closest('tr')).toBe(row('r0'));
		host.removeAttribute('dir');
	});
});

describe('a row that skips one of its columns', () => {
	it('arrowing into the missing cell falls back to row mode instead of dead-ending', () => {
		render({ skipColumnB: true });
		enterTable();

		// Selection column, then rowheader "a", then "b" — which row r0 does not
		// render. The delegate walks the column list and cannot know that; the
		// identity is what has to stay satisfiable, or the table ends up with no
		// tabindex=0 anywhere and no way back in.
		press('ArrowRight');
		press('ArrowRight');
		press('ArrowRight');

		expect(document.activeElement).toBe(row('r0'));
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(tabStops()).toHaveLength(1);
	});
});

describe('hiding the column the keyboard is on', () => {
	it('does not strand the table without a tab stop', async () => {
		const props = render({ withColumnFeatures: true });
		enterTable();
		// Into cell mode, then along to column "c".
		press('ArrowRight');
		press('ArrowRight');
		press('ArrowRight');
		press('ArrowRight');
		expect((document.activeElement as HTMLElement).id.endsWith('-cell-c')).toBe(true);

		props.hiddenColumns = ['c'];
		flushSync();
		await tick();

		// The identity stopped resolving, so the target is relocated rather than
		// left pointing at a column that is no longer in the nav order. Either
		// way the widget still has exactly one tab stop.
		expect(tabStops()).toHaveLength(1);
		expect(host.querySelector('[data-spectrum-table-view-cell][id$="-cell-c"]')).toBeNull();
	});
});

describe('cell mode', () => {
	it('ArrowRight moves the tab stop off the <tr> and onto a cell', () => {
		render();
		enterTable();
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);

		press('ArrowRight');

		// Leading nav column is the synthetic selection column, so the first
		// cell-mode stop is the row's checkbox `<td>`, not the rowheader.
		const target = document.activeElement as HTMLElement;
		expect(target.hasAttribute('data-spectrum-table-view-checkbox-cell')).toBe(true);
		expect(target.closest('tr')).toBe(row('r0'));
		expect(target.getAttribute('tabindex')).toBe('0');

		// The row keeps the highlight (`data-focused`) but surrenders the stop,
		// and the container stays out because a row is still highlighted.
		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);
		expect(row('r0').getAttribute('data-focused')).toBe('true');
		expect(table().getAttribute('tabindex')).toBe('-1');
		// Exactly one cell-level stop across the whole table.
		expect(tabindexes([...checkboxCells(), ...cells()]).filter((t) => t === '0')).toHaveLength(1);

		press('ArrowRight');
		const second = document.activeElement as HTMLElement;
		expect(second.getAttribute('role')).toBe('rowheader');
		expect(second.getAttribute('tabindex')).toBe('0');
		expect(checkboxCells()[0].getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);
	});

	it('Escape returns the tab stop from the cell to the <tr>', () => {
		render();
		enterTable();
		press('ArrowRight');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);

		press('Escape');
		expect(document.activeElement).toBe(row('r0'));
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(tabindexes(checkboxCells())).toEqual(['-1', '-1', '-1']);
		expect(table().getAttribute('tabindex')).toBe('-1');
	});
});

describe('how many tab stops the widget actually exposes', () => {
	it('a table with a resizable column and a column menu is still a single tab stop', () => {
		render({ withColumnFeatures: true });

		// The resizer handle, the visually hidden range input inside it and each
		// column-menu trigger are all parked at -1. The range input is the one
		// that needs saying out loud: it carries no tabindex of its own and is
		// tabbable on native focusability alone, so -1 has to be written on it.
		expect(tabStops()).toHaveLength(1);
		expect(tabStops()[0]).toBe(table());
	});

	it('a plain table (no resizer, no column menu) is a single tab stop', () => {
		render();

		expect(tabStops()).toHaveLength(1);
		expect(tabStops()[0]).toBe(table());
	});

	it('Alt+ArrowDown on a column header opens its menu — the keyboard way in', () => {
		render({ withColumnFeatures: true });
		enterTable();
		// Row → cell mode → up to the column header for column "b".
		press('ArrowRight');
		press('ArrowRight');
		press('ArrowRight');
		press('ArrowUp');

		const header = document.activeElement as HTMLElement;
		expect(header.getAttribute('data-spectrum-table-view-column')).not.toBeNull();
		expect(header.querySelector('[data-spectrum-table-view-column-menu-trigger]')).not.toBeNull();

		(document.activeElement as HTMLElement).dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true })
		);
		flushSync();

		expect(host.querySelector('[role="menu"]')).not.toBeNull();
	});
});
